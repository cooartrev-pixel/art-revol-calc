import { useState, useEffect, useCallback } from 'react';

export type SoundType = 'chime' | 'bell' | 'ding' | 'notification' | 'alert';

interface NotificationSoundSettings {
  enabled: boolean;
  volume: number;
  soundType: SoundType;
}

const STORAGE_KEY = 'notification-sound-settings';

const defaultSettings: NotificationSoundSettings = {
  enabled: true,
  volume: 0.5,
  soundType: 'chime',
};

// Sound configurations for 5 different notification sounds
const soundConfigs: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  chime: {
    frequencies: [800, 1000, 800],
    durations: [0.1, 0.1, 0.1],
    type: 'sine',
  },
  bell: {
    frequencies: [523, 659, 784],
    durations: [0.15, 0.15, 0.2],
    type: 'sine',
  },
  ding: {
    frequencies: [1200],
    durations: [0.3],
    type: 'sine',
  },
  notification: {
    frequencies: [440, 554, 659],
    durations: [0.1, 0.1, 0.15],
    type: 'triangle',
  },
  alert: {
    frequencies: [600, 800, 600, 800],
    durations: [0.1, 0.1, 0.1, 0.1],
    type: 'square',
  },
};

export const soundLabels: Record<SoundType, string> = {
  chime: 'Дзвіночок',
  bell: 'Дзвін',
  ding: 'Динь',
  notification: 'Сповіщення',
  alert: 'Сигнал',
};

export function useNotificationSound() {
  const [settings, setSettings] = useState<NotificationSoundSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const playSound = useCallback((soundType?: SoundType) => {
    if (!settings.enabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const config = soundConfigs[soundType || settings.soundType];
      
      let currentTime = audioContext.currentTime;
      
      config.frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(freq, currentTime);
        
        const duration = config.durations[index];
        gainNode.gain.setValueAtTime(settings.volume, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
        
        currentTime += duration;
      });
    } catch (error) {
      console.log('Audio notification not supported');
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<NotificationSoundSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    settings,
    updateSettings,
    playSound,
  };
}
