// Local equivalents of edge actions: sync_templates, create_template,
// edit_template, delete_template, send_test_template.
import { supabase } from "@/integrations/supabase/client";
import { graph, required, withRetry, GRAPH, phoneNum } from "../_shared/meta";
import { resolveAccount } from "../_shared/credentials";
import { logSendAttempts } from "../_shared/attempts";
import { buildTemplateComponents, ensureOutboundConversation } from "../_shared/templateBuild";

const sampleFor = (i) => ["Alex", "12345", "today", "$49", "Premium", "tomorrow"][i] || `value${i + 1}`;

function normalizeComponents(components) {
  for (const comp of components) {
    if (comp?.type === "BUTTONS" && Array.isArray(comp.buttons)) {
      for (const btn of comp.buttons) {
        if (btn?.type === "FLOW") {
          const num = typeof btn.flow_id === "number" ? btn.flow_id : Number(String(btn.flow_id ?? "").trim());
          if (!Number.isFinite(num) || num <= 0) {
            throw new Error(`FLOW button "${btn.text || "(unnamed)"}" needs a valid numeric flow_id from Meta. Replace the placeholder with your published Flow ID.`);
          }
          btn.flow_id = num;
        }
      }
    }
  }
  for (const comp of components) {
    const t = String(comp?.type || "").toUpperCase();
    if (t !== "HEADER" && t !== "BODY") continue;
    const text = typeof comp.text === "string" ? comp.text : "";
    if (!text) continue;
    const found = Array.from(text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)).map((m) => m[1]);
    const unique = Array.from(new Set(found));
    if (!unique.length) continue;
    let normalized = text;
    unique.forEach((orig, idx) => {
      const re = new RegExp(`\\{\\{\\s*${orig}\\s*\\}\\}`, "g");
      normalized = normalized.replace(re, `{{${idx + 1}}}`);
    });
    comp.text = normalized;
    const samples = unique.map((_, idx) => sampleFor(idx));
    if (t === "BODY") comp.example = { ...(comp.example || {}), body_text: [samples] };
    else comp.example = { ...(comp.example || {}), header_text: samples };
  }
}

export async function syncTemplates(payload = {}) {
  const { account, token } = await resolveAccount(payload);
  const result = await graph(`/${account.waba_id}/message_templates?limit=100`, token);
  const templates = (result.data || []).map((item) => ({
    waba_id: account.waba_id,
    name: item.name,
    language: item.language,
    category: item.category || "UNKNOWN",
    status: item.status || "UNKNOWN",
    components: item.components || [],
    variables: [],
    rejection_reason: item.rejected_reason || null,
    metadata: item,
  }));
  if (templates.length) {
    const { error } = await supabase.from("wa_templates").upsert(templates, { onConflict: "waba_id,name,language" });
    if (error) throw error;
  }
  return { ok: true, count: templates.length };
}

export async function createTemplate(payload) {
  const { account, token } = await resolveAccount(payload);
  const name = required(payload.name, "Template name").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 512);
  const language = required(payload.language, "Language").slice(0, 10);
  const category = ["MARKETING", "UTILITY", "AUTHENTICATION"].includes(payload.category) ? payload.category : "MARKETING";
  const components = Array.isArray(payload.components) ? payload.components : [];
  if (!components.length) throw new Error("At least one component (e.g. BODY) is required");
  normalizeComponents(components);

  const result = await graph(`/${account.waba_id}/message_templates`, token, {
    method: "POST",
    body: JSON.stringify({ name, language, category, components }),
  });

  const { error } = await supabase.from("wa_templates").upsert(
    {
      waba_id: account.waba_id, name, language, category,
      status: result?.status || "PENDING",
      components, variables: [], rejection_reason: null, metadata: result,
    },
    { onConflict: "waba_id,name,language" }
  );
  if (error) throw error;
  return { ok: true, result };
}

export async function editTemplate(payload) {
  const { account, token } = await resolveAccount(payload);
  const template_id = required(payload.template_id, "Template");
  const { data: tpl, error: tplErr } = await supabase.from("wa_templates").select("*").eq("id", template_id).single();
  if (tplErr) throw tplErr;
  const components = Array.isArray(payload.components) ? payload.components : tpl.components;
  if (!components.length) throw new Error("At least one component (e.g. BODY) is required");
  const category = ["MARKETING", "UTILITY", "AUTHENTICATION"].includes(payload.category) ? payload.category : tpl.category;
  normalizeComponents(components);

  let metaTemplateId = (tpl.metadata && typeof tpl.metadata === "object" && tpl.metadata.id) || null;
  if (!metaTemplateId) {
    const lookup = await graph(`/${account.waba_id}/message_templates?name=${encodeURIComponent(tpl.name)}&limit=20`, token);
    const match = (lookup.data || []).find((x) => x.name === tpl.name && x.language === tpl.language);
    metaTemplateId = match?.id || null;
  }
  if (!metaTemplateId) throw new Error("Could not find this template on Meta. Try syncing first.");

  const result = await graph(`/${metaTemplateId}`, token, { method: "POST", body: JSON.stringify({ category, components }) });

  const { error } = await supabase.from("wa_templates").update({
    category, components, status: result?.status || "PENDING", rejection_reason: null,
    metadata: { ...(tpl.metadata || {}), id: metaTemplateId, last_edit: result },
  }).eq("id", template_id);
  if (error) throw error;
  return { ok: true, result };
}

export async function deleteTemplate(payload) {
  const { account, token } = await resolveAccount(payload);
  const template_id = required(payload.template_id, "Template");
  const { data: tpl, error } = await supabase.from("wa_templates").select("*").eq("id", template_id).single();
  if (error) throw error;
  try {
    await graph(`/${account.waba_id}/message_templates?name=${encodeURIComponent(tpl.name)}`, token, { method: "DELETE" });
  } catch (e) {
    console.warn("Meta delete failed, removing local copy anyway:", e);
  }
  await supabase.from("wa_templates").delete().eq("id", template_id);
  return { ok: true };
}

export async function sendTestTemplate(payload) {
  const { account, token } = await resolveAccount(payload);
  const to = phoneNum(payload.to);
  const template_id = required(payload.template_id, "Template");
  const { data: tpl, error } = await supabase.from("wa_templates").select("*").eq("id", template_id).single();
  if (error) throw error;
  const { components, values } = buildTemplateComponents(tpl, payload);
  const tplPayload = { name: tpl.name, language: { code: tpl.language } };
  if (components.length) tplPayload.components = components;
  const reqPayload = { messaging_product: "whatsapp", to, type: "template", template: tplPayload };

  let result, attempts = [];
  try {
    const out = await withRetry(async () => {
      const r = await fetch(`${GRAPH}/${account.phone_number_id}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload),
      });
      const data = await r.json().catch(() => ({}));
      return { ok: r.ok, status: r.status, data };
    });
    result = out.result; attempts = out.attempts;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const errAttempts = e?.attempts || [{ attempt_number: 1, status: "failed", http_status: null, latency_ms: 0, error_message: msg, response_payload: {} }];
    await logSendAttempts(errAttempts, {
      stage: "send", kind: "send_test_template", phone_number_id: account.id,
      template_id: tpl.id, template_name: tpl.name, recipient_phone: to, request_payload: reqPayload,
    });
    throw e;
  }
  const providerMessageId = result.messages?.[0]?.id || null;
  const previewText = `[template: ${tpl.name}]`;
  const { conversation, contact } = await ensureOutboundConversation(supabase, account, to, previewText, { name: tpl.name, language: tpl.language, variables: values });
  const { data: insertedMsg } = await supabase.from("wa_messages").insert({
    conversation_id: conversation?.id || null, contact_id: contact?.id || null, phone_number_id: account.id,
    provider_message_id: providerMessageId, direction: "outbound", message_type: "template",
    template_name: tpl.name, template_language: tpl.language, body: previewText, status: "sent",
    raw_payload: { ...result, sent_payload: reqPayload, variables: values },
    sent_at: new Date().toISOString(),
  }).select().single();
  await logSendAttempts(attempts, {
    stage: "send", kind: "send_test_template", phone_number_id: account.id,
    template_id: tpl.id, template_name: tpl.name, recipient_phone: to,
    message_id: insertedMsg?.id || null, provider_message_id: providerMessageId, request_payload: reqPayload,
  });
  return { ok: true, result, message_id: insertedMsg?.id || null, attempts: attempts.length };
}