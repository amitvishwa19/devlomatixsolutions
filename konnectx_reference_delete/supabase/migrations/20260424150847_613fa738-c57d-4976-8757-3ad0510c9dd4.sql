DROP VIEW IF EXISTS public.wa_ai_config_safe;

CREATE OR REPLACE FUNCTION public.get_ai_config_safe()
RETURNS TABLE (
  provider text,
  model text,
  custom_model text,
  custom_base_url text,
  has_custom_api_key boolean,
  custom_api_key_preview text,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.provider,
    c.model,
    c.custom_model,
    c.custom_base_url,
    (length(coalesce(c.custom_api_key, '')) > 0) AS has_custom_api_key,
    CASE
      WHEN length(coalesce(c.custom_api_key, '')) > 8
        THEN left(c.custom_api_key, 4) || '…' || right(c.custom_api_key, 4)
      ELSE ''
    END AS custom_api_key_preview,
    c.updated_at
  FROM public.wa_ai_config c
  WHERE c.id = 'default'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_config_safe() TO anon, authenticated;