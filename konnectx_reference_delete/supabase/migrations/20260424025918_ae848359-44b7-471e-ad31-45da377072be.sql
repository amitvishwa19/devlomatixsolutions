CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.wa_phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (char_length(display_name) <= 120),
  phone_number TEXT NOT NULL CHECK (char_length(phone_number) <= 32),
  phone_number_id TEXT NOT NULL UNIQUE CHECK (char_length(phone_number_id) <= 80),
  waba_id TEXT NOT NULL CHECK (char_length(waba_id) <= 80),
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected','pending','disabled','error')),
  quality_rating TEXT DEFAULT 'unknown' CHECK (quality_rating IN ('green','yellow','red','unknown')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX wa_phone_numbers_one_default ON public.wa_phone_numbers (is_default) WHERE is_default;
CREATE INDEX idx_wa_phone_numbers_waba_id ON public.wa_phone_numbers (waba_id);

ALTER TABLE public.wa_phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read phone numbers" ON public.wa_phone_numbers FOR SELECT USING (true);
CREATE POLICY "Public app can create phone numbers" ON public.wa_phone_numbers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update phone numbers" ON public.wa_phone_numbers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete phone numbers" ON public.wa_phone_numbers FOR DELETE USING (true);

CREATE TRIGGER update_wa_phone_numbers_updated_at BEFORE UPDATE ON public.wa_phone_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 140),
  phone_number TEXT NOT NULL UNIQUE CHECK (phone_number ~ '^\\+?[1-9][0-9]{7,15}$'),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source TEXT NOT NULL DEFAULT 'manual' CHECK (char_length(source) <= 60),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','opted_out','blocked','invalid')),
  last_message_at TIMESTAMPTZ,
  notes TEXT CHECK (char_length(notes) <= 1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_contacts_tags ON public.wa_contacts USING GIN(tags);
CREATE INDEX idx_wa_contacts_status ON public.wa_contacts (status);

ALTER TABLE public.wa_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read contacts" ON public.wa_contacts FOR SELECT USING (true);
CREATE POLICY "Public app can create contacts" ON public.wa_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update contacts" ON public.wa_contacts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete contacts" ON public.wa_contacts FOR DELETE USING (true);

CREATE TRIGGER update_wa_contacts_updated_at BEFORE UPDATE ON public.wa_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.wa_contacts(id) ON DELETE SET NULL,
  phone_number_id UUID REFERENCES public.wa_phone_numbers(id) ON DELETE SET NULL,
  external_contact_phone TEXT NOT NULL CHECK (char_length(external_contact_phone) <= 32),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','closed','archived')),
  assigned_to TEXT CHECK (char_length(assigned_to) <= 120),
  last_message_preview TEXT CHECK (char_length(last_message_preview) <= 500),
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_wa_conversations_unique_pair ON public.wa_conversations (phone_number_id, external_contact_phone);
CREATE INDEX idx_wa_conversations_last_message_at ON public.wa_conversations (last_message_at DESC);

ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read conversations" ON public.wa_conversations FOR SELECT USING (true);
CREATE POLICY "Public app can create conversations" ON public.wa_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update conversations" ON public.wa_conversations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete conversations" ON public.wa_conversations FOR DELETE USING (true);

CREATE TRIGGER update_wa_conversations_updated_at BEFORE UPDATE ON public.wa_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.wa_conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.wa_contacts(id) ON DELETE SET NULL,
  phone_number_id UUID REFERENCES public.wa_phone_numbers(id) ON DELETE SET NULL,
  provider_message_id TEXT UNIQUE CHECK (char_length(provider_message_id) <= 160),
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','template','image','document','audio','video','sticker','interactive','location','contacts','unknown')),
  body TEXT CHECK (char_length(body) <= 4096),
  media_id TEXT CHECK (char_length(media_id) <= 160),
  media_url TEXT CHECK (char_length(media_url) <= 1000),
  media_mime_type TEXT CHECK (char_length(media_mime_type) <= 120),
  template_name TEXT CHECK (char_length(template_name) <= 120),
  template_language TEXT CHECK (char_length(template_language) <= 20),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed','received')),
  error_message TEXT CHECK (char_length(error_message) <= 1000),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_messages_conversation_created ON public.wa_messages (conversation_id, created_at DESC);
CREATE INDEX idx_wa_messages_status ON public.wa_messages (status);
CREATE INDEX idx_wa_messages_provider_id ON public.wa_messages (provider_message_id);

ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read messages" ON public.wa_messages FOR SELECT USING (true);
CREATE POLICY "Public app can create messages" ON public.wa_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update messages" ON public.wa_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete messages" ON public.wa_messages FOR DELETE USING (true);

CREATE TRIGGER update_wa_messages_updated_at BEFORE UPDATE ON public.wa_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waba_id TEXT NOT NULL CHECK (char_length(waba_id) <= 80),
  name TEXT NOT NULL CHECK (char_length(name) <= 120),
  language TEXT NOT NULL CHECK (char_length(language) <= 20),
  category TEXT NOT NULL CHECK (char_length(category) <= 60),
  status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (char_length(status) <= 40),
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  rejection_reason TEXT CHECK (char_length(rejection_reason) <= 1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (waba_id, name, language)
);

CREATE INDEX idx_wa_templates_status ON public.wa_templates (status);
CREATE INDEX idx_wa_templates_waba ON public.wa_templates (waba_id);

ALTER TABLE public.wa_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read templates" ON public.wa_templates FOR SELECT USING (true);
CREATE POLICY "Public app can create templates" ON public.wa_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update templates" ON public.wa_templates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete templates" ON public.wa_templates FOR DELETE USING (true);

CREATE TRIGGER update_wa_templates_updated_at BEFORE UPDATE ON public.wa_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number_id UUID REFERENCES public.wa_phone_numbers(id) ON DELETE SET NULL,
  provider_media_id TEXT UNIQUE CHECK (char_length(provider_media_id) <= 160),
  filename TEXT NOT NULL CHECK (char_length(filename) <= 220),
  media_type TEXT NOT NULL CHECK (media_type IN ('image','document','audio','video','sticker')),
  mime_type TEXT NOT NULL CHECK (char_length(mime_type) <= 120),
  file_size BIGINT CHECK (file_size IS NULL OR file_size >= 0),
  source_url TEXT CHECK (char_length(source_url) <= 1000),
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_media_assets_type ON public.wa_media_assets (media_type);

ALTER TABLE public.wa_media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read media assets" ON public.wa_media_assets FOR SELECT USING (true);
CREATE POLICY "Public app can create media assets" ON public.wa_media_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update media assets" ON public.wa_media_assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete media assets" ON public.wa_media_assets FOR DELETE USING (true);

CREATE TRIGGER update_wa_media_assets_updated_at BEFORE UPDATE ON public.wa_media_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 160),
  phone_number_id UUID REFERENCES public.wa_phone_numbers(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.wa_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','running','paused','completed','failed','cancelled')),
  audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
  variable_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  pacing_per_minute INTEGER NOT NULL DEFAULT 20 CHECK (pacing_per_minute BETWEEN 1 AND 1000),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_count INTEGER NOT NULL DEFAULT 0 CHECK (total_count >= 0),
  sent_count INTEGER NOT NULL DEFAULT 0 CHECK (sent_count >= 0),
  delivered_count INTEGER NOT NULL DEFAULT 0 CHECK (delivered_count >= 0),
  read_count INTEGER NOT NULL DEFAULT 0 CHECK (read_count >= 0),
  failed_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_campaigns_status ON public.wa_campaigns (status);
CREATE INDEX idx_wa_campaigns_created ON public.wa_campaigns (created_at DESC);

ALTER TABLE public.wa_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read campaigns" ON public.wa_campaigns FOR SELECT USING (true);
CREATE POLICY "Public app can create campaigns" ON public.wa_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update campaigns" ON public.wa_campaigns FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete campaigns" ON public.wa_campaigns FOR DELETE USING (true);

CREATE TRIGGER update_wa_campaigns_updated_at BEFORE UPDATE ON public.wa_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.wa_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.wa_contacts(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL CHECK (char_length(recipient_phone) <= 32),
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed','skipped')),
  provider_message_id TEXT CHECK (char_length(provider_message_id) <= 160),
  error_message TEXT CHECK (char_length(error_message) <= 1000),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_campaign_recipients_campaign ON public.wa_campaign_recipients (campaign_id);
CREATE INDEX idx_wa_campaign_recipients_status ON public.wa_campaign_recipients (status);

ALTER TABLE public.wa_campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read campaign recipients" ON public.wa_campaign_recipients FOR SELECT USING (true);
CREATE POLICY "Public app can create campaign recipients" ON public.wa_campaign_recipients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update campaign recipients" ON public.wa_campaign_recipients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete campaign recipients" ON public.wa_campaign_recipients FOR DELETE USING (true);

CREATE TRIGGER update_wa_campaign_recipients_updated_at BEFORE UPDATE ON public.wa_campaign_recipients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wa_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (char_length(event_type) <= 80),
  provider_object TEXT CHECK (char_length(provider_object) <= 80),
  provider_message_id TEXT CHECK (char_length(provider_message_id) <= 160),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  processing_error TEXT CHECK (char_length(processing_error) <= 1000),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_webhook_events_received ON public.wa_webhook_events (received_at DESC);
CREATE INDEX idx_wa_webhook_events_type ON public.wa_webhook_events (event_type);

ALTER TABLE public.wa_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read webhook events" ON public.wa_webhook_events FOR SELECT USING (true);
CREATE POLICY "Public app can create webhook events" ON public.wa_webhook_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update webhook events" ON public.wa_webhook_events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete webhook events" ON public.wa_webhook_events FOR DELETE USING (true);