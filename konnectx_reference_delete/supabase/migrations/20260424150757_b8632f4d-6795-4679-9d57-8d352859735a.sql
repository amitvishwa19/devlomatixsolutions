CREATE TABLE public.wa_ai_config (
  id text PRIMARY KEY DEFAULT 'default',
  provider text NOT NULL DEFAULT 'lovable',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  custom_model text NOT NULL DEFAULT '',
  custom_base_url text NOT NULL DEFAULT '',
  custom_api_key text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wa_ai_config_singleton CHECK (id = 'default')
);

ALTER TABLE public.wa_ai_config ENABLE ROW LEVEL SECURITY;

-- Public/anon clients must NOT be able to read the api key. Provide a safe view instead.
CREATE OR REPLACE VIEW public.wa_ai_config_safe AS
SELECT
  id,
  provider,
  model,
  custom_model,
  custom_base_url,
  (length(coalesce(custom_api_key, '')) > 0) AS has_custom_api_key,
  CASE
    WHEN length(coalesce(custom_api_key, '')) > 8
      THEN left(custom_api_key, 4) || '…' || right(custom_api_key, 4)
    ELSE ''
  END AS custom_api_key_preview,
  updated_at
FROM public.wa_ai_config;

GRANT SELECT ON public.wa_ai_config_safe TO anon, authenticated;

-- Allow public app to insert/update config (including writing a new api key) but NOT to select the raw row (which contains the key)
CREATE POLICY "App can insert ai config" ON public.wa_ai_config
  FOR INSERT WITH CHECK (true);
CREATE POLICY "App can update ai config" ON public.wa_ai_config
  FOR UPDATE USING (true) WITH CHECK (true);
-- intentionally NO select policy on the base table for anon/authenticated

-- Seed the singleton row
INSERT INTO public.wa_ai_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Keep updated_at fresh
CREATE TRIGGER update_wa_ai_config_updated_at
  BEFORE UPDATE ON public.wa_ai_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();