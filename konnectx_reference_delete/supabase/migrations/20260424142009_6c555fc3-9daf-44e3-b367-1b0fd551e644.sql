DROP POLICY IF EXISTS "Credentials are hidden from public app" ON public.wa_account_credentials;

CREATE POLICY "Public app can read credentials"
ON public.wa_account_credentials
FOR SELECT
USING (true);

CREATE POLICY "Public app can create credentials"
ON public.wa_account_credentials
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public app can update credentials"
ON public.wa_account_credentials
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public app can delete credentials"
ON public.wa_account_credentials
FOR DELETE
USING (true);