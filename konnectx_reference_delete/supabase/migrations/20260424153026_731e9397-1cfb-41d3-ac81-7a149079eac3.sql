
-- 1. Add auto_tags to messages
ALTER TABLE public.wa_messages
  ADD COLUMN IF NOT EXISTS auto_tags text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE INDEX IF NOT EXISTS wa_messages_auto_tags_idx ON public.wa_messages USING gin (auto_tags);

-- 2. Outbound webhooks (endpoints registered by user)
CREATE TABLE IF NOT EXISTS public.wa_outbound_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  secret text NOT NULL DEFAULT '',
  events text[] NOT NULL DEFAULT ARRAY[]::text[],
  enabled boolean NOT NULL DEFAULT true,
  last_delivery_at timestamptz,
  last_status text,
  last_error text,
  failure_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wa_outbound_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public app can read outbound webhooks" ON public.wa_outbound_webhooks FOR SELECT USING (true);
CREATE POLICY "Public app can create outbound webhooks" ON public.wa_outbound_webhooks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update outbound webhooks" ON public.wa_outbound_webhooks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete outbound webhooks" ON public.wa_outbound_webhooks FOR DELETE USING (true);

CREATE TRIGGER set_wa_outbound_webhooks_updated_at
  BEFORE UPDATE ON public.wa_outbound_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Outbound webhook delivery log
CREATE TABLE IF NOT EXISTS public.wa_outbound_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES public.wa_outbound_webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  target_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  http_status integer,
  latency_ms integer,
  attempt_number integer NOT NULL DEFAULT 1,
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_body text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wa_outbound_webhook_deliveries_webhook_idx
  ON public.wa_outbound_webhook_deliveries(webhook_id, created_at DESC);

ALTER TABLE public.wa_outbound_webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read deliveries" ON public.wa_outbound_webhook_deliveries FOR SELECT USING (true);
CREATE POLICY "Public app can create deliveries" ON public.wa_outbound_webhook_deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update deliveries" ON public.wa_outbound_webhook_deliveries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete deliveries" ON public.wa_outbound_webhook_deliveries FOR DELETE USING (true);

-- 4. Billing/usage meter events
CREATE TABLE IF NOT EXISTS public.wa_billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id uuid REFERENCES public.wa_phone_numbers(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.wa_messages(id) ON DELETE SET NULL,
  conversation_provider_id text,
  category text NOT NULL DEFAULT 'unknown',
  pricing_model text,
  billable boolean NOT NULL DEFAULT true,
  origin_type text,
  recipient_phone text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Dedupe identical conversation+category rows (Meta sends same conv id many times within window)
CREATE UNIQUE INDEX IF NOT EXISTS wa_billing_events_conv_unique
  ON public.wa_billing_events(conversation_provider_id, category)
  WHERE conversation_provider_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS wa_billing_events_phone_occurred_idx
  ON public.wa_billing_events(phone_number_id, occurred_at DESC);

ALTER TABLE public.wa_billing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app can read billing events" ON public.wa_billing_events FOR SELECT USING (true);
CREATE POLICY "Public app can create billing events" ON public.wa_billing_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update billing events" ON public.wa_billing_events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete billing events" ON public.wa_billing_events FOR DELETE USING (true);
