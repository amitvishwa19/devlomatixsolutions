CREATE TABLE public.wa_send_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NULL,
  phone_number_id uuid NULL,
  template_id uuid NULL,
  template_name text NULL,
  recipient_phone text NULL,
  kind text NOT NULL DEFAULT 'send_test_template',
  attempt_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  stage text NOT NULL DEFAULT 'send',
  http_status integer NULL,
  error_code text NULL,
  error_message text NULL,
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_message_id text NULL,
  latency_ms integer NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_send_attempts_message_id ON public.wa_send_attempts(message_id);
CREATE INDEX idx_wa_send_attempts_provider_msg_id ON public.wa_send_attempts(provider_message_id);
CREATE INDEX idx_wa_send_attempts_created_at ON public.wa_send_attempts(created_at DESC);

ALTER TABLE public.wa_send_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public app can read send attempts" ON public.wa_send_attempts FOR SELECT USING (true);
CREATE POLICY "Public app can create send attempts" ON public.wa_send_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update send attempts" ON public.wa_send_attempts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete send attempts" ON public.wa_send_attempts FOR DELETE USING (true);

CREATE TRIGGER trg_wa_send_attempts_updated_at
BEFORE UPDATE ON public.wa_send_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();