-- Create a function to call the edge function via pg_net
CREATE OR REPLACE FUNCTION public.notify_consultation_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  supabase_anon_key text;
  service_role_key text;
  payload jsonb;
BEGIN
  -- Get environment values from Supabase vault/config
  supabase_url := current_setting('app.settings.supabase_url', true);
  supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Build the payload from the new row
  payload := jsonb_build_object(
    'name', NEW.name,
    'phone', NEW.phone,
    'email', NEW.email,
    'propertyValue', NEW.property_value,
    'loanAmount', NEW.loan_amount,
    'loanTerm', NEW.loan_term,
    'interestRate', NEW.interest_rate,
    'isYeoselya', NEW.is_yeoselya,
    'selectedBank', NEW.selected_bank,
    'message', NEW.message,
    'trigger_secret', 'db_trigger_internal'
  );

  -- Call the edge function using pg_net extension
  PERFORM net.http_post(
    url := coalesce(supabase_url, 'https://bsnpgnnxvsarebbvpaua.supabase.co') || '/functions/v1/notify-consultation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(service_role_key, supabase_anon_key, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbnBnbm54dnNhcmViYnZwYXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODY5MzcsImV4cCI6MjA4MDk2MjkzN30.zEh9wopdXpbSaaG_XLjKc8gWX8Sl2m5fZtf1vL5wI5g')
    )::jsonb,
    body := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'notify_consultation_request failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_consultation_request_created ON public.consultation_requests;
CREATE TRIGGER on_consultation_request_created
  AFTER INSERT ON public.consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_consultation_request();