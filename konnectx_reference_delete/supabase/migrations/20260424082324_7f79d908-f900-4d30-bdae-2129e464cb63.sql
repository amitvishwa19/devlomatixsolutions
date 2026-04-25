-- Custom fields on contacts (jsonb bag) + dedicated lifecycle stage
ALTER TABLE public.wa_contacts ADD COLUMN IF NOT EXISTS custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.wa_contacts ADD COLUMN IF NOT EXISTS lifecycle_stage text;

-- Ensure phone_number is unique for upsert dedupe
CREATE UNIQUE INDEX IF NOT EXISTS wa_contacts_phone_number_key ON public.wa_contacts (phone_number);

-- Segments: saved filters reusable in Campaigns
CREATE TABLE IF NOT EXISTS public.wa_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);
ALTER TABLE public.wa_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read segments" ON public.wa_segments FOR SELECT USING (true);
CREATE POLICY "Public app can create segments" ON public.wa_segments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update segments" ON public.wa_segments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete segments" ON public.wa_segments FOR DELETE USING (true);

CREATE TRIGGER update_wa_segments_updated_at
BEFORE UPDATE ON public.wa_segments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();