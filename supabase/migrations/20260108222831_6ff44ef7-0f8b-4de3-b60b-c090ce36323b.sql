-- Add notification sound settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_sound_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_sound_volume numeric NOT NULL DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS notification_sound_type text NOT NULL DEFAULT 'chime';

-- Add constraint for valid sound types
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_sound_type CHECK (notification_sound_type IN ('chime', 'bell', 'ding', 'notification', 'alert'));

-- Add constraint for volume range (0 to 1)
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_volume CHECK (notification_sound_volume >= 0 AND notification_sound_volume <= 1);