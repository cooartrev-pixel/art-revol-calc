import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

// Get initial settings from localStorage (fallback)
const getLocalSettings = (): NotificationSoundSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export function useNotificationSound() {
  const { session } = useAuth();
  const [settings, setSettings] = useState<NotificationSoundSettings>(getLocalSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch settings from database when user is authenticated
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_sound_enabled, notification_sound_volume, notification_sound_type')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const dbSettings: NotificationSoundSettings = {
            enabled: data.notification_sound_enabled,
            volume: Number(data.notification_sound_volume),
            soundType: data.notification_sound_type as SoundType,
          };
          setSettings(dbSettings);
          // Also update localStorage as cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [session?.user?.id]);

  // Save settings to localStorage (for non-authenticated users)
  useEffect(() => {
    if (!session?.user?.id) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, session?.user?.id]);

  const updateSettings = useCallback(async (updates: Partial<NotificationSoundSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Save to database if authenticated
    if (session?.user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            notification_sound_enabled: newSettings.enabled,
            notification_sound_volume: newSettings.volume,
            notification_sound_type: newSettings.soundType,
          })
          .eq('user_id', session.user.id);

        if (error) throw error;
        
        // Update localStorage cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving notification settings:', error);
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }
  }, [settings, session?.user?.id]);

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

  return {
    settings,
    updateSettings,
    playSound,
    isLoading,
  };
}
