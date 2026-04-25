ALTER VIEW public.wa_ai_config_safe SET (security_invoker = true);
GRANT SELECT ON public.wa_ai_config TO service_role;