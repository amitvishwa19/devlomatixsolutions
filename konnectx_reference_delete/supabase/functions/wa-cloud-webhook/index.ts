import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256, x-test-skip-signature",
};

// Inbound STOP-keyword opt-out detection
const STOP_KEYWORDS = ["stop", "unsubscribe", "cancel", "quit", "end", "optout", "opt out", "opt-out"];
function isStopKeyword(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = String(text).trim().toLowerCase().replace(/[.!,]+$/g, "");
  if (!t) return false;
  return STOP_KEYWORDS.includes(t);
}

const GRAPH = "https://graph.facebook.com/v22.0";

function withinOfficeHours(officeHours: any): boolean {
  if (!officeHours || typeof officeHours !== "object") return true;
  const tz = officeHours.timezone || "UTC";
  const now = new Date();
  // Get day-of-week and HH:MM in the configured timezone
  let weekday = "";
  let hhmm = "";
  try {
    const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" });
    const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
    weekday = dayFmt.format(now).toLowerCase().slice(0, 3);
    hhmm = timeFmt.format(now);
  } catch {
    weekday = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getUTCDay()];
    hhmm = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
  }
  const days = officeHours.days || {};
  const start = officeHours.start || "09:00";
  const end = officeHours.end || "18:00";
  if (!days[weekday]) return false;
  return hhmm >= start && hhmm <= end;
}

function ruleMatchesText(rule: any, text: string | null | undefined): boolean {
  if (!text) return false;
  const subject = rule.case_sensitive ? text : text.toLowerCase();
  const keywords = (rule.match_keywords || []).map((k: string) => rule.case_sensitive ? k : k.toLowerCase());
  if (!keywords.length) return false;
  if (rule.match_mode === "exact") return keywords.some((k: string) => subject.trim() === k.trim());
  if (rule.match_mode === "all") return keywords.every((k: string) => subject.includes(k));
  return keywords.some((k: string) => subject.includes(k));
}

async function findApplicableRule(supabase: any, opts: { text: string | null; isFirstMessage: boolean }): Promise<any | null> {
  const { data: rules } = await supabase
    .from("wa_automation_rules")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: true });
  if (!rules?.length) return null;
  for (const rule of rules) {
    if (rule.rule_type === "keyword" && ruleMatchesText(rule, opts.text)) return rule;
    if (rule.rule_type === "welcome" && opts.isFirstMessage) return rule;
    if (rule.rule_type === "away" && !withinOfficeHours(rule.office_hours)) return rule;
  }
  return null;
}

async function sendAutomatedReply(supabase: any, rule: any, contact: any, conversation: any, account: any | null): Promise<void> {
  // Resolve sender account: prefer the conversation's account, then is_default
  let senderAccount = account;
  if (!senderAccount?.id) {
    const { data: def } = await supabase.from("wa_phone_numbers").select("*").eq("is_default", true).maybeSingle();
    senderAccount = def;
  }
  if (!senderAccount?.id) return;
  const { data: cred } = await supabase.from("wa_account_credentials").select("access_token").eq("phone_number_id", senderAccount.id).maybeSingle();
  if (!cred?.access_token) return;

  // Cooldown check
  if (rule.cooldown_minutes && contact?.id) {
    const since = new Date(Date.now() - Number(rule.cooldown_minutes) * 60_000).toISOString();
    const { data: recent } = await supabase
      .from("wa_messages")
      .select("id")
      .eq("conversation_id", conversation?.id || "")
      .eq("direction", "outbound")
      .gte("created_at", since)
      .like("body", "%[auto]%")
      .limit(1);
    if (recent?.length) return;
  }

  const to = String(contact?.phone_number || conversation?.external_contact_phone || "").replace(/[\s().-]/g, "");
  if (!to) return;

  let payload: Record<string, unknown>;
  let bodyForLog = "";
  if (rule.reply_type === "template" && rule.template_id) {
    const { data: tpl } = await supabase.from("wa_templates").select("*").eq("id", rule.template_id).maybeSingle();
    if (!tpl) return;
    payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: { name: tpl.name, language: { code: tpl.language }, components: [] },
    };
    bodyForLog = `[auto:template] ${tpl.name}`;
  } else {
    const text = String(rule.reply_body || "").slice(0, 4096);
    if (!text) return;
    payload = { messaging_product: "whatsapp", to, type: "text", text: { preview_url: false, body: text } };
    bodyForLog = `[auto] ${text}`;
  }

  try {
    const response = await fetch(`${GRAPH}/${senderAccount.phone_number_id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cred.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    const providerMessageId = result?.messages?.[0]?.id || null;
    await supabase.from("wa_messages").insert({
      conversation_id: conversation?.id || null,
      contact_id: contact?.id || null,
      phone_number_id: senderAccount.id,
      provider_message_id: providerMessageId,
      direction: "outbound",
      message_type: rule.reply_type === "template" ? "template" : "text",
      template_name: rule.reply_type === "template" ? (payload as any).template?.name : null,
      template_language: rule.reply_type === "template" ? (payload as any).template?.language?.code : null,
      body: bodyForLog,
      status: response.ok ? "sent" : "failed",
      error_message: response.ok ? null : (typeof result === "object" ? JSON.stringify(result).slice(0, 500) : null),
      raw_payload: { automation_rule_id: rule.id, sent_payload: payload, result },
      sent_at: new Date().toISOString(),
    });
    await supabase.from("wa_automation_rules").update({
      trigger_count: (rule.trigger_count || 0) + 1,
      last_triggered_at: new Date().toISOString(),
    }).eq("id", rule.id);
  } catch (e) {
    console.error("Auto-reply send failed:", e);
  }
}

// Constant-time comparison of two hex strings
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Verify Meta's X-Hub-Signature-256 (sha256 HMAC of the raw request body using the App Secret)
async function verifyMetaSignature(rawBody: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const provided = header.startsWith("sha256=") ? header.slice(7) : header;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return safeEqual(expected, provided.toLowerCase());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);

  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge") || "";
    const expected = Deno.env.get("META_WA_VERIFY_TOKEN") || "wa-cloud-api";
    if (mode === "subscribe" && token === expected) return new Response(challenge, { headers: corsHeaders });
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  // Read raw body once so we can both verify the signature and parse JSON.
  const rawBody = await req.text();

  // Signature verification (X-Hub-Signature-256). If the App Secret is configured we enforce it.
  // The in-app tester sends `x-test-skip-signature: 1` to bypass — only honored when the request
  // already presents a valid Supabase auth header (which Meta never sends).
  const appSecret = Deno.env.get("META_WA_APP_SECRET") || "";
  const signatureHeader = req.headers.get("x-hub-signature-256");
  const testerBypass = req.headers.get("x-test-skip-signature") === "1" && !!req.headers.get("authorization");
  if (appSecret && !testerBypass) {
    const ok = await verifyMetaSignature(rawBody, signatureHeader, appSecret);
    if (!ok) {
      // Persist the rejection for debugging in the Events page
      try {
        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await supabase.from("wa_webhook_events").insert({
          event_type: "signature_rejected",
          provider_object: null,
          payload: { reason: "Invalid X-Hub-Signature-256", header_present: !!signatureHeader, body_preview: rawBody.slice(0, 500) },
          processed: false,
          processing_error: "Signature verification failed",
        });
      } catch (_) {}
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const entries = payload.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        for (const message of value.messages || []) {
          const from = message.from;
          const text = message.text?.body || message.button?.text || message.interactive?.button_reply?.title || null;
          const providerPhoneId = value.metadata?.phone_number_id;
          const { data: account } = await supabase.from("wa_phone_numbers").select("id").eq("phone_number_id", providerPhoneId).maybeSingle();
          const { data: contact } = await supabase.from("wa_contacts").upsert({ phone_number: from, name: value.contacts?.[0]?.profile?.name || from, source: "webhook", last_message_at: new Date(Number(message.timestamp || Date.now() / 1000) * 1000).toISOString() }, { onConflict: "phone_number" }).select().single();
          const { data: conversation } = await supabase.from("wa_conversations").upsert({ phone_number_id: account?.id || null, contact_id: contact?.id || null, external_contact_phone: from, last_message_preview: text || message.type, last_message_at: new Date().toISOString(), unread_count: 1 }, { onConflict: "phone_number_id,external_contact_phone" }).select().single();
          // Detect "first message" before we insert this inbound row
          let isFirstMessage = false;
          if (conversation?.id) {
            const { count } = await supabase
              .from("wa_messages")
              .select("id", { count: "exact", head: true })
              .eq("conversation_id", conversation.id)
              .eq("direction", "inbound");
            isFirstMessage = !count || count === 0;
          }
          const { data: insertedMessage } = await supabase.from("wa_messages").insert({ conversation_id: conversation?.id || null, contact_id: contact?.id || null, phone_number_id: account?.id || null, provider_message_id: message.id, direction: "inbound", message_type: message.type || "unknown", body: text, status: "received", raw_payload: message }).select("id").single();

          // Fire-and-forget AI auto-tagging + sentiment
          if (insertedMessage?.id && text) {
            const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/wa-classify-message`;
            fetch(fnUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
              body: JSON.stringify({ message_id: insertedMessage.id }),
            }).catch((err) => console.error("classify dispatch failed:", err));
          }

          // Fire-and-forget outbound webhook: message.received
          try {
            const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/wa-webhook-dispatch`;
            fetch(fnUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
              body: JSON.stringify({
                event_type: "message.received",
                payload: {
                  message_id: insertedMessage?.id,
                  provider_message_id: message.id,
                  from,
                  text,
                  type: message.type,
                  conversation_id: conversation?.id,
                  contact: { id: contact?.id, name: contact?.name, phone_number: contact?.phone_number },
                  phone_number_id: account?.id,
                  received_at: new Date().toISOString(),
                },
              }),
            }).catch((err) => console.error("webhook dispatch failed:", err));
          } catch (_) {}

          // STOP-keyword opt-out
          if (contact?.id && isStopKeyword(text)) {
            await supabase
              .from("wa_contacts")
              .update({
                opted_out_at: new Date().toISOString(),
                opt_out_reason: `Inbound keyword: ${String(text).trim()}`,
                status: "opted_out",
              })
              .eq("id", contact.id);
            continue;
          }

          // Skip auto-replies for opted-out contacts
          if (contact?.opted_out_at || contact?.status === "opted_out") continue;

          // Find and run an applicable automation rule
          try {
            const accountRow = account?.id ? (await supabase.from("wa_phone_numbers").select("*").eq("id", account.id).maybeSingle()).data : null;
            const rule = await findApplicableRule(supabase, { text, isFirstMessage });
            if (rule) {
              await sendAutomatedReply(supabase, rule, contact, conversation, accountRow);
            }
          } catch (e) {
            console.error("Automation rule processing failed:", e);
          }
        }
        // Resolve the account once per `change` so status billing events can reference it.
        const statusProviderPhoneId = value.metadata?.phone_number_id;
        let statusAccountId: string | null = null;
        if (statusProviderPhoneId && (value.statuses || []).length > 0) {
          const { data: acc } = await supabase
            .from("wa_phone_numbers")
            .select("id")
            .eq("phone_number_id", statusProviderPhoneId)
            .maybeSingle();
          statusAccountId = acc?.id || null;
        }

        for (const status of value.statuses || []) {
          await supabase.from("wa_messages").update({ status: status.status, delivered_at: status.status === "delivered" ? new Date().toISOString() : undefined, read_at: status.status === "read" ? new Date().toISOString() : undefined, error_message: status.errors?.[0]?.message || null }).eq("provider_message_id", status.id);

          // Capture conversation pricing for the Billing/Usage meter.
          // Meta reports `pricing` + `conversation` on the first delivery event of each new conversation window.
          const pricing = status.pricing;
          const conv = status.conversation;
          if (pricing && conv?.id) {
            const category = String(conv.origin?.type || pricing.category || "unknown").toLowerCase();
            try {
              await supabase.from("wa_billing_events").upsert({
                phone_number_id: statusAccountId,
                conversation_provider_id: conv.id,
                category,
                pricing_model: pricing.pricing_model || null,
                billable: pricing.billable !== false,
                origin_type: conv.origin?.type || null,
                recipient_phone: status.recipient_id || null,
                occurred_at: new Date(Number(status.timestamp || Date.now() / 1000) * 1000).toISOString(),
                raw: { pricing, conversation: conv, status_value: status.status },
              }, { onConflict: "conversation_provider_id,category", ignoreDuplicates: true });
            } catch (e) {
              console.error("Billing event insert failed:", e);
            }
          }
        }
        await supabase.from("wa_webhook_events").insert({ event_type: change.field || "messages", provider_object: payload.object, payload, processed: true });
      }
    }
    return new Response(JSON.stringify({ ok: true, signature_verified: !!appSecret && !testerBypass }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error(error);
    try {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await supabase.from("wa_webhook_events").insert({
        event_type: "processing_error",
        provider_object: null,
        payload: { body_preview: rawBody.slice(0, 1000) },
        processed: false,
        processing_error: error instanceof Error ? error.message : String(error),
      });
    } catch (_) {}
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
