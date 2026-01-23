-- Habilitar extensión pg_net para llamadas HTTP asíncronas
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Función que llama al edge function cuando se crea un profile
CREATE OR REPLACE FUNCTION public.on_profile_created_send_welcome_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Obtener email del usuario desde auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
  
  -- Obtener secrets del vault
  SELECT decrypted_secret INTO supabase_url 
  FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL';
  
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
  
  -- Llamar edge function con los datos del profile + email
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'record', jsonb_build_object(
        'user_id', NEW.user_id,
        'display_name', NEW.display_name,
        'email', user_email
      )
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger después de insertar en profiles (envía email de bienvenida)
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.on_profile_created_send_welcome_email();