-- Create table for legislative updates
CREATE TABLE public.legislative_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_auto_fetched BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.legislative_updates ENABLE ROW LEVEL SECURITY;

-- Everyone can view published updates
CREATE POLICY "Anyone can view published updates" 
ON public.legislative_updates 
FOR SELECT 
USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all updates" 
ON public.legislative_updates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_legislative_updates_published_at ON public.legislative_updates(published_at DESC);
CREATE INDEX idx_legislative_updates_category ON public.legislative_updates(category);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_legislative_updates_updated_at
BEFORE UPDATE ON public.legislative_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();