
-- Quick replies / canned responses
CREATE TABLE IF NOT EXISTS public.wa_quick_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shortcut text NOT NULL,
  body text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shortcut)
);
ALTER TABLE public.wa_quick_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read quick replies" ON public.wa_quick_replies FOR SELECT USING (true);
CREATE POLICY "Public app can create quick replies" ON public.wa_quick_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update quick replies" ON public.wa_quick_replies FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete quick replies" ON public.wa_quick_replies FOR DELETE USING (true);

-- Simple assignee list (no auth)
CREATE TABLE IF NOT EXISTS public.wa_assignees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);
ALTER TABLE public.wa_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read assignees" ON public.wa_assignees FOR SELECT USING (true);
CREATE POLICY "Public app can create assignees" ON public.wa_assignees FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update assignees" ON public.wa_assignees FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete assignees" ON public.wa_assignees FOR DELETE USING (true);

-- Labels on conversations
ALTER TABLE public.wa_conversations ADD COLUMN IF NOT EXISTS labels text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Opt-out tracking on contacts
ALTER TABLE public.wa_contacts ADD COLUMN IF NOT EXISTS opted_out_at timestamptz;
ALTER TABLE public.wa_contacts ADD COLUMN IF NOT EXISTS opt_out_reason text;

-- A/B test support
ALTER TABLE public.wa_campaigns ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.wa_campaign_recipients ADD COLUMN IF NOT EXISTS variant text;
