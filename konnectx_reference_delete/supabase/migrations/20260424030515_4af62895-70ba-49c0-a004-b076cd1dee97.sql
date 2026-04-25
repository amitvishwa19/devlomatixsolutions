CREATE TABLE IF NOT EXISTS public.wa_account_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number_id UUID NOT NULL REFERENCES public.wa_phone_numbers(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL CHECK (char_length(access_token) BETWEEN 20 AND 10000),
  token_preview TEXT NOT NULL CHECK (char_length(token_preview) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wa_account_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Credentials are hidden from public app" ON public.wa_account_credentials;
CREATE POLICY "Credentials are hidden from public app"
ON public.wa_account_credentials
FOR SELECT
USING (false);

CREATE TRIGGER update_wa_account_credentials_updated_at
BEFORE UPDATE ON public.wa_account_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_default_wa_phone_number(_phone_number_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.wa_phone_numbers SET is_default = false WHERE is_default = true;
  UPDATE public.wa_phone_numbers SET is_default = true WHERE id = _phone_number_uuid;
END;
$$;