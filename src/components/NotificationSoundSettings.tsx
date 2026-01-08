import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2, VolumeX, Play, Settings } from 'lucide-react';
import { useNotificationSound, SoundType, soundLabels } from '@/hooks/useNotificationSound';

export function NotificationSoundSettings() {
  const { settings, updateSettings, playSound } = useNotificationSound();

  const soundTypes: SoundType[] = ['chime', 'bell', 'ding', 'notification', 'alert'];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {settings.enabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Налаштування звуку</h4>
          </div>

          {/* Enable/Disable toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled" className="text-sm">
              Звукові сповіщення
            </Label>
            <Switch
              id="sound-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          {/* Volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Гучність</Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.volume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([volume]) => updateSettings({ volume })}
              disabled={!settings.enabled}
            />
          </div>

          {/* Sound type selector */}
          <div className="space-y-2">
            <Label className="text-sm">Тип звуку</Label>
            <div className="flex gap-2">
              <Select
                value={settings.soundType}
                onValueChange={(soundType: SoundType) => updateSettings({ soundType })}
                disabled={!settings.enabled}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {soundTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {soundLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => playSound()}
                disabled={!settings.enabled}
                title="Прослухати"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
