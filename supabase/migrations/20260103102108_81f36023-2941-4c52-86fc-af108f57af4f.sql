-- Update the notify_consultation_request function to remove trigger_secret
-- and rely solely on service_role_key authentication

CREATE OR REPLACE FUNCTION public.notify_consultation_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text;
  service_role_key text;
  payload jsonb;
BEGIN
  -- Get environment values from Supabase vault/config
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Build the payload from the new row (no trigger_secret needed)
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
    'message', NEW.message
  );

  -- Call the edge function using pg_net extension with service role key
  PERFORM net.http_post(
    url := coalesce(supabase_url, 'https://bsnpgnnxvsarebbvpaua.supabase.co') || '/functions/v1/notify-consultation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )::jsonb,
    body := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'notify_consultation_request failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;