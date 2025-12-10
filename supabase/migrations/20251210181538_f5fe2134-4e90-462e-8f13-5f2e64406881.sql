-- Create consultation requests table
CREATE TABLE public.consultation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  property_value NUMERIC,
  loan_amount NUMERIC,
  loan_term INTEGER,
  interest_rate NUMERIC,
  selected_bank TEXT,
  is_yeoselya BOOLEAN DEFAULT false,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit consultation request" 
ON public.consultation_requests 
FOR INSERT 
WITH CHECK (true);