// Mirror of edge function's logSendAttempts.
import { supabase } from "@/integrations/supabase/client";

export async function logSendAttempts(attempts, meta) {
  if (!attempts?.length) return;
  const rows = attempts.map((a) => ({
    stage: meta.stage,
    kind: meta.kind,
    phone_number_id: meta.phone_number_id ?? null,
    template_id: meta.template_id ?? null,
    template_name: meta.template_name ?? null,
    recipient_phone: meta.recipient_phone ?? null,
    message_id: meta.message_id ?? null,
    provider_message_id: a.status === "success" ? meta.provider_message_id ?? null : null,
    attempt_number: a.attempt_number,
    status: a.status,
    http_status: a.http_status,
    error_message: a.error_message,
    latency_ms: a.latency_ms,
    request_payload: meta.request_payload || {},
    response_payload: a.response_payload || {},
  }));
  await supabase.from("wa_send_attempts").insert(rows);
}