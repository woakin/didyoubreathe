-- Add RLS policies to password_reset_tokens table
-- This table should ONLY be accessed by edge functions using service role
-- Regular users should NEVER be able to read, insert, update, or delete tokens directly

-- Deny all SELECT access - service role bypasses RLS anyway
CREATE POLICY "No direct read access to tokens"
ON public.password_reset_tokens
FOR SELECT
USING (false);

-- Deny all INSERT access - only edge functions with service role can insert
CREATE POLICY "No direct insert access to tokens"
ON public.password_reset_tokens
FOR INSERT
WITH CHECK (false);

-- Deny all UPDATE access - only edge functions with service role can update
CREATE POLICY "No direct update access to tokens"
ON public.password_reset_tokens
FOR UPDATE
USING (false);

-- Deny all DELETE access - tokens should be managed by edge functions only
CREATE POLICY "No direct delete access to tokens"
ON public.password_reset_tokens
FOR DELETE
USING (false);