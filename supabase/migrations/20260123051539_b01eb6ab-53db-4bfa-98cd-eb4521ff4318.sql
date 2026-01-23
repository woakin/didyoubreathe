-- Enable the Send Email Hook to use our custom function
-- This will intercept all auth emails (recovery, signup confirmation, etc.)

-- First, ensure the function returns the correct format for auth hooks
CREATE OR REPLACE FUNCTION public.handle_auth_email_hook(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get secrets from vault
  SELECT decrypted_secret INTO supabase_url 
  FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL';
  
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the edge function to send the custom email
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/custom-auth-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := payload
  );

  -- Return empty object to indicate we handled the email
  RETURN jsonb_build_object();
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_auth_email_hook(jsonb) TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

-- Configure the auth hook to use our function
-- Note: This sets up the hook in the auth.hooks configuration
SELECT set_config('auth.hook.send_email', 'public.handle_auth_email_hook', false);