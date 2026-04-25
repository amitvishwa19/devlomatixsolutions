CREATE TABLE public.wa_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'keyword',
  enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  match_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  match_mode TEXT NOT NULL DEFAULT 'any',
  case_sensitive BOOLEAN NOT NULL DEFAULT false,
  reply_type TEXT NOT NULL DEFAULT 'text',
  reply_body TEXT,
  template_id UUID REFERENCES public.wa_templates(id) ON DELETE SET NULL,
  template_language TEXT,
  office_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  cooldown_minutes INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wa_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public app can read automation rules" ON public.wa_automation_rules FOR SELECT USING (true);
CREATE POLICY "Public app can create automation rules" ON public.wa_automation_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update automation rules" ON public.wa_automation_rules FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete automation rules" ON public.wa_automation_rules FOR DELETE USING (true);

CREATE TRIGGER update_wa_automation_rules_updated_at
BEFORE UPDATE ON public.wa_automation_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wa_automation_rules_enabled ON public.wa_automation_rules(enabled, priority);

-- Add a sentiment column to messages for AI analysis
ALTER TABLE public.wa_messages
  ADD COLUMN IF NOT EXISTS sentiment TEXT,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT;