import { supabase } from "@/lib/supabase";

/**
 * Ported from konnectx_reference_delete/supabase/functions/wa-cloud-api/index.ts
 */
export async function ensureOutboundConversation(
  account,
  to,
  preview,
  templateMeta = null
) {
  // 1. Ensure contact exists
  const { data: contact } = await supabase
    .from("wa_contacts")
    .upsert(
      { 
        phone_number: to, 
        name: to, 
        source: "outbound", 
        last_message_at: new Date().toISOString() 
      }, 
      { onConflict: "phone_number" }
    )
    .select()
    .single();

  // 2. Fetch existing conversation metadata to preserve it
  const { data: existing } = await supabase
    .from("wa_conversations")
    .select("metadata")
    .eq("phone_number_id", account.id)
    .eq("external_contact_phone", to)
    .maybeSingle();

  const baseMeta = (existing?.metadata && typeof existing.metadata === "object") ? existing.metadata : {};
  const nextMeta = templateMeta?.name
    ? { 
        ...baseMeta, 
        last_template: { 
          name: templateMeta.name, 
          language: templateMeta.language || null, 
          variables: Array.isArray(templateMeta.variables) ? templateMeta.variables : [] 
        } 
      }
    : baseMeta;

  // 3. Upsert conversation
  const { data: conversation } = await supabase
    .from("wa_conversations")
    .upsert(
      {
        phone_number_id: account.id,
        contact_id: contact?.id || null,
        external_contact_phone: to,
        last_message_preview: String(preview || "").slice(0, 500),
        last_message_at: new Date().toISOString(),
        metadata: nextMeta,
      },
      { onConflict: "phone_number_id,external_contact_phone" }
    )
    .select()
    .single();

  return { conversation, contact };
}

export async function logSendAttempts(attempts, meta) {
  if (!attempts.length) return;
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
    http_status: a.http_status || null,
    error_message: a.error_message,
    latency_ms: a.latency_ms,
    request_payload: meta.request_payload || {},
    response_payload: a.response_payload || {},
  }));
  await supabase.from("wa_send_attempts").insert(rows);
}
