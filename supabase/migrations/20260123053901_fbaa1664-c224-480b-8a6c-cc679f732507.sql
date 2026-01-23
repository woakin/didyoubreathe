-- Add column for weekly email preference
ALTER TABLE public.profiles 
ADD COLUMN weekly_email_enabled BOOLEAN NOT NULL DEFAULT true;