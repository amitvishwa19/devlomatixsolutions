import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v22.0";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function required(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

function phone(value: unknown) {
  const v = required(value, "Recipient phone").replace(/[\s().-]/g, "");
  if (!/^\+?[1-9][0-9]{7,15}$/.test(v)) throw new Error("Invalid phone number");
  return v;
}

function preview(token: string) {
  return token.length > 12 ? `${token.slice(0, 6)}••••${token.slice(-4)}` : "••••";
}

async function graph(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`${GRAPH}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Meta API failed [${response.status}]: ${JSON.stringify(data)}`);
  return data;
}

// Smart retry: only retry network errors and 5xx responses. 4xx (bad input,
// invalid template, auth) won't succeed on retry. Returns full attempt
// metadata (status, latency, payloads, error) for each try so callers can log
// to wa_send_attempts.
type AttemptLog = {
  attempt_number: number;
  status: "success" | "failed";
  http_status: number | null;
  latency_ms: number;
  error_message: string | null;
  response_payload: any;
};

async function withRetry(
  exec: () => Promise<{ ok: boolean; status: number; data: any }>,
  opts: { maxAttempts?: number; onAttempt?: (a: AttemptLog) => void } = {},
): Promise<{ result: any; attempts: AttemptLog[] }> {
  const max = opts.maxAttempts ?? 3;
  const attempts: AttemptLog[] = [];
  let lastError: Error | null = null;
  for (let i = 1; i <= max; i++) {
    const start = Date.now();
    try {
      const r = await exec();
      const latency = Date.now() - start;
      if (r.ok) {
        const log: AttemptLog = { attempt_number: i, status: "success", http_status: r.status, latency_ms: latency, error_message: null, response_payload: r.data };
        attempts.push(log);
        opts.onAttempt?.(log);
        return { result: r.data, attempts };
      }
      const errMsg = `Meta API failed [${r.status}]: ${JSON.stringify(r.data)}`;
      const log: AttemptLog = { attempt_number: i, status: "failed", http_status: r.status, latency_ms: latency, error_message: errMsg, response_payload: r.data };
      attempts.push(log);
      opts.onAttempt?.(log);
      // 4xx = bad request, don't retry. 5xx = server error, do retry.
      if (r.status < 500) {
        const e = new Error(errMsg);
        (e as any).attempts = attempts;
        throw e;
      }
      lastError = new Error(errMsg);
    } catch (e) {
      if ((e as any)?.attempts) throw e;
      const latency = Date.now() - start;
      const msg = e instanceof Error ? e.message : String(e);
      // If we already pushed (4xx case), don't double-log
      if (!attempts.length || attempts[attempts.length - 1].attempt_number !== i) {
        const log: AttemptLog = { attempt_number: i, status: "failed", http_status: null, latency_ms: latency, error_message: msg, response_payload: {} };
        attempts.push(log);
        opts.onAttempt?.(log);
      }
      lastError = e instanceof Error ? e : new Error(msg);
      // Don't retry 4xx
      if (msg.includes("Meta API failed [4")) {
        (lastError as any).attempts = attempts;
        throw lastError;
      }
    }
    if (i < max) {
      const backoff = Math.pow(2, i - 1) * 1000; // 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  const finalErr = lastError || new Error("Operation failed after retries");
  (finalErr as any).attempts = attempts;
  throw finalErr;
}

async function graphWithRetry(path: string, token: string, init: RequestInit = {}) {
  return withRetry(async () => {
    const response = await fetch(`${GRAPH}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  });
}

async function logSendAttempts(
  supabase: any,
  attempts: AttemptLog[],
  meta: {
    stage: "upload" | "send";
    kind: string;
    phone_number_id?: string | null;
    template_id?: string | null;
    template_name?: string | null;
    recipient_phone?: string | null;
    message_id?: string | null;
    provider_message_id?: string | null;
    request_payload?: any;
  },
) {
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
    http_status: a.http_status,
    error_message: a.error_message,
    latency_ms: a.latency_ms,
    request_payload: meta.request_payload || {},
    response_payload: a.response_payload || {},
  }));
  await supabase.from("wa_send_attempts").insert(rows);
}

async function resolveTokenFor(supabase: any, accountUuid: string) {
  const { data: cred, error } = await supabase.from("wa_account_credentials").select("access_token").eq("phone_number_id", accountUuid).single();
  if (error || !cred?.access_token) throw new Error("Access token missing for the selected account");
  return cred.access_token as string;
}

async function ensureOutboundConversation(
  supabase: any,
  account: any,
  to: string,
  preview: string,
  templateMeta: { name?: string; language?: string; variables?: unknown[] } | null = null,
) {
  const { data: contact } = await supabase
    .from("wa_contacts")
    .upsert({ phone_number: to, name: to, source: "outbound", last_message_at: new Date().toISOString() }, { onConflict: "phone_number" })
    .select()
    .single();

  const { data: existing } = await supabase
    .from("wa_conversations")
    .select("metadata")
    .eq("phone_number_id", account.id)
    .eq("external_contact_phone", to)
    .maybeSingle();

  const baseMeta = (existing?.metadata && typeof existing.metadata === "object") ? existing.metadata : {};
  const nextMeta = templateMeta?.name
    ? { ...baseMeta, last_template: { name: templateMeta.name, language: templateMeta.language || null, variables: Array.isArray(templateMeta.variables) ? templateMeta.variables : [] } }
    : baseMeta;

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

function getTemplateHeaderDefinition(template: any) {
  const tplComponents = Array.isArray(template?.components) ? template.components : [];
  return tplComponents.find((c: any) => String(c?.type || "").toUpperCase() === "HEADER") || null;
}

function countTemplateTextVariables(text: unknown) {
  if (typeof text !== "string") return 0;
  const matches = Array.from(text.matchAll(/\{\{\s*(\d+)\s*\}\}/g));
  return matches.reduce((max, match) => Math.max(max, Number(match[1] || 0)), 0);
}

function getTemplateButtonsDefinition(template: any) {
  const tplComponents = Array.isArray(template?.components) ? template.components : [];
  return tplComponents.find((c: any) => String(c?.type || "").toUpperCase() === "BUTTONS") || null;
}

function isDynamicUrlButton(button: any) {
  return String(button?.type || "").toUpperCase() === "URL" && /\{\{\s*1\s*\}\}/.test(String(button?.url || ""));
}

function buildTemplateComponents(template: any, body: any) {
  const values = Array.isArray(body.variables) ? body.variables : [];
  const components: any[] = [];
  const headerDef = getTemplateHeaderDefinition(template);
  const buttonsDef = getTemplateButtonsDefinition(template);

  if (headerDef) {
    const fmt = String(headerDef.format || "TEXT").toUpperCase();
    const headerMediaUrl = typeof body.header_media_url === "string" ? body.header_media_url.trim() : "";
    const headerMediaId = typeof body.header_media_id === "string" ? body.header_media_id.trim() : "";
    if (fmt === "IMAGE" || fmt === "VIDEO" || fmt === "DOCUMENT") {
      if (!headerMediaUrl && !headerMediaId) {
        throw new Error(`Template "${template.name}" requires a ${fmt.toLowerCase()} header. Provide header_media_url or header_media_id.`);
      }
      const mediaKey = fmt.toLowerCase();
      const mediaObject: Record<string, unknown> = headerMediaId ? { id: headerMediaId } : { link: headerMediaUrl };
      components.push({
        type: "header",
        parameters: [{ type: mediaKey, [mediaKey]: mediaObject }],
      });
    } else if (fmt === "TEXT") {
      const headerVarCount = countTemplateTextVariables(headerDef.text);
      if (headerVarCount > 0) {
        const headerValues = Array.isArray(body.header_variables) ? body.header_variables : [];
        if (headerValues.length < headerVarCount || headerValues.some((value: unknown) => String(value ?? "").trim() === "")) {
          throw new Error(`Template "${template.name}" requires ${headerVarCount} header variable${headerVarCount === 1 ? "" : "s"}.`);
        }
        components.push({
          type: "header",
          parameters: headerValues.slice(0, headerVarCount).map((text: string) => ({ type: "text", text: String(text).slice(0, 60) })),
        });
      }
    }
  }

  if (values.length) {
    components.push({
      type: "body",
      parameters: values.map((text: string) => ({ type: "text", text: String(text).slice(0, 512) })),
    });
  }

  if (buttonsDef?.buttons && Array.isArray(buttonsDef.buttons)) {
    const buttonPayloadValues = Array.isArray(body.button_payloads) ? body.button_payloads : [];
    const buttonUrlValues = Array.isArray(body.button_url_suffixes) ? body.button_url_suffixes : [];

    buttonsDef.buttons.forEach((button: any, index: number) => {
      const buttonType = String(button?.type || "").toUpperCase();

      if (buttonType === "QUICK_REPLY") {
        components.push({
          type: "button",
          sub_type: "quick_reply",
          index: String(index),
          parameters: [{ type: "payload", payload: String(buttonPayloadValues[index] || button.text || `button_${index + 1}`).slice(0, 128) }],
        });
        return;
      }

      if (buttonType === "FLOW") {
        const action: Record<string, unknown> = {
          flow_token: typeof body.flow_token === "string" && body.flow_token.trim() ? body.flow_token.trim().slice(0, 256) : "unused",
        };
        if (body.flow_action_data && typeof body.flow_action_data === "object" && !Array.isArray(body.flow_action_data)) {
          action.flow_action_data = body.flow_action_data;
        }
        components.push({
          type: "button",
          sub_type: "flow",
          index: String(index),
          parameters: [{ type: "action", action }],
        });
        return;
      }

      if (buttonType === "URL" && isDynamicUrlButton(button)) {
        const suffix = String(buttonUrlValues[index] || "").trim();
        if (!suffix) {
          throw new Error(`Template "${template.name}" requires a value for URL button ${index + 1}.`);
        }
        components.push({
          type: "button",
          sub_type: "url",
          index: String(index),
          parameters: [{ type: "text", text: suffix.slice(0, 2000) }],
        });
      }
    });
  }

  return { components, values, headerDef, buttonsDef };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) throw new Error("Cloud database credentials are not configured");
    const supabase = createClient(supabaseUrl, serviceRole);
    const body = await req.json().catch(() => ({}));

    // -------- Test & Preview (no save) --------
    if (body.action === "test_account") {
      const phone_number_id = required(body.phone_number_id, "Phone number ID").slice(0, 80);
      const access_token = required(body.access_token, "Access token");
      const waba_id = typeof body.waba_id === "string" ? body.waba_id.trim().slice(0, 80) : "";
      const meta = await graph(`/${phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name,name_status`, access_token);
      let waba: any = null;
      if (waba_id) {
        try { waba = await graph(`/${waba_id}?fields=id,name,timezone_id,message_template_namespace`, access_token); } catch (_) { waba = null; }
      }
      return json({ ok: true, meta, waba });
    }

    // -------- Save account --------
    if (body.action === "save_account") {
      const display_name = required(body.display_name, "Account name").slice(0, 120);
      const phone_number_id = required(body.phone_number_id, "Phone number ID").slice(0, 80);
      const waba_id = required(body.waba_id, "WABA ID").slice(0, 80);
      const access_token = required(body.access_token, "Access token");
      const user_phone = typeof body.phone_number === "string" ? body.phone_number.trim().slice(0, 32) : "";

      const meta = await graph(`/${phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name`, access_token);
      const phone_number = user_phone || meta?.display_phone_number || phone_number_id;

      const { data: existing } = await supabase.from("wa_phone_numbers").select("id").limit(1);
      const { data: account, error } = await supabase
        .from("wa_phone_numbers")
        .upsert(
          {
            display_name,
            phone_number,
            phone_number_id,
            waba_id,
            is_default: !existing?.length,
            status: "connected",
            quality_rating: meta?.quality_rating || "unknown",
            verified_name: meta?.verified_name || null,
            last_verified_at: new Date().toISOString(),
          },
          { onConflict: "phone_number_id" }
        )
        .select()
        .single();
      if (error) throw error;

      const { error: credentialError } = await supabase
        .from("wa_account_credentials")
        .upsert({ phone_number_id: account.id, access_token, token_preview: preview(access_token) }, { onConflict: "phone_number_id" });
      if (credentialError) throw credentialError;
      return json({ ok: true, account_id: account.id, meta });
    }

    // -------- Refresh verification for an existing account --------
    if (body.action === "refresh_account") {
      const account_id = required(body.account_id, "Account");
      const { data: account, error } = await supabase.from("wa_phone_numbers").select("*").eq("id", account_id).single();
      if (error) throw error;
      const token = await resolveTokenFor(supabase, account.id);
      const meta = await graph(`/${account.phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name`, token);
      await supabase
        .from("wa_phone_numbers")
        .update({
          phone_number: meta?.display_phone_number || account.phone_number,
          quality_rating: meta?.quality_rating || "unknown",
          verified_name: meta?.verified_name || null,
          last_verified_at: new Date().toISOString(),
        })
        .eq("id", account.id);
      return json({ ok: true, meta });
    }

    // For account-scoped actions, resolve account (explicit account_id or default)
    let account: any = null;
    let token = "";
    if (body.account_id) {
      const { data, error } = await supabase.from("wa_phone_numbers").select("*").eq("id", body.account_id).single();
      if (error) throw error;
      account = data;
    } else {
      const { data, error } = await supabase.from("wa_phone_numbers").select("*").eq("is_default", true).maybeSingle();
      if (error) throw error;
      account = data;
    }
    if (!account) throw new Error("No WhatsApp account configured");
    token = await resolveTokenFor(supabase, account.id);

    // -------- Publish a Flow to Meta (create + upload JSON + publish) --------
    if (body.action === "publish_flow") {
      const name = required(body.name, "Flow name").slice(0, 200);
      const categories = Array.isArray(body.categories) && body.categories.length
        ? body.categories
        : ["SIGN_UP"];
      const flowJson = body.flow_json;
      if (!flowJson || typeof flowJson !== "object") throw new Error("flow_json is required");

      // 1) Create the Flow shell
      const created = await graph(`/${account.waba_id}/flows`, token, {
        method: "POST",
        body: JSON.stringify({ name, categories, endpoint_uri: undefined }),
      });
      const flowId = created?.id;
      if (!flowId) throw new Error(`Meta did not return a flow id: ${JSON.stringify(created)}`);

      // 2) Upload the flow.json as a multipart asset
      const form = new FormData();
      form.append("name", "flow.json");
      form.append("asset_type", "FLOW_JSON");
      form.append(
        "file",
        new Blob([JSON.stringify(flowJson)], { type: "application/json" }),
        "flow.json",
      );
      const upload = await fetch(`${GRAPH}/${flowId}/assets`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const uploadData = await upload.json().catch(() => ({}));
      if (!upload.ok) {
        return json({ error: `Flow created (${flowId}) but JSON upload failed: ${JSON.stringify(uploadData)}`, flow_id: flowId }, 500);
      }
      // Surface JSON validation errors from Meta
      if (Array.isArray(uploadData?.validation_errors) && uploadData.validation_errors.length) {
        return json({ error: `Flow JSON validation failed: ${JSON.stringify(uploadData.validation_errors)}`, flow_id: flowId }, 400);
      }

      // 3) Publish
      let published = false;
      let publishError: any = null;
      try {
        await graph(`/${flowId}/publish`, token, { method: "POST" });
        published = true;
      } catch (e) {
        publishError = e instanceof Error ? e.message : String(e);
      }

      return json({ ok: true, flow_id: flowId, published, publish_error: publishError, upload: uploadData });
    }

    // -------- Sync templates from Meta --------
    if (body.action === "sync_templates") {
      const result = await graph(`/${account.waba_id}/message_templates?limit=100`, token);
      const templates = (result.data || []).map((item: any) => ({
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
      return json({ ok: true, count: templates.length });
    }

    // -------- Create template on Meta --------
    if (body.action === "create_template") {
      const name = required(body.name, "Template name").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 512);
      const language = required(body.language, "Language").slice(0, 10);
      const category = ["MARKETING", "UTILITY", "AUTHENTICATION"].includes(body.category) ? body.category : "MARKETING";
      const components = Array.isArray(body.components) ? body.components : [];
      if (!components.length) throw new Error("At least one component (e.g. BODY) is required");

      // Sanitize FLOW buttons: Meta requires flow_id to be a number.
      for (const comp of components) {
        if (comp?.type === "BUTTONS" && Array.isArray(comp.buttons)) {
          for (const btn of comp.buttons) {
            if (btn?.type === "FLOW") {
              const raw = btn.flow_id;
              const num = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
              if (!Number.isFinite(num) || num <= 0) {
                throw new Error(`FLOW button "${btn.text || "(unnamed)"}" needs a valid numeric flow_id from Meta. Replace the placeholder with your published Flow ID.`);
              }
              btn.flow_id = num;
            }
          }
        }
      }

      // Meta requires `example` values for any HEADER/BODY containing {{n}} variables,
      // and variables must be sequential starting from {{1}}. Normalize and auto-fill.
      const sampleFor = (i: number) => ["Alex", "12345", "today", "$49", "Premium", "tomorrow"][i] || `value${i + 1}`;
      for (const comp of components) {
        const t = String(comp?.type || "").toUpperCase();
        if (t !== "HEADER" && t !== "BODY") continue;
        const text: string = typeof comp.text === "string" ? comp.text : "";
        if (!text) continue;
        // Re-index variables to be sequential from {{1}}
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
        if (t === "BODY") {
          comp.example = { ...(comp.example || {}), body_text: [samples] };
        } else {
          comp.example = { ...(comp.example || {}), header_text: samples };
        }
      }

      const result = await graph(`/${account.waba_id}/message_templates`, token, {
        method: "POST",
        body: JSON.stringify({ name, language, category, components }),
      });

      const { error } = await supabase.from("wa_templates").upsert(
        {
          waba_id: account.waba_id,
          name,
          language,
          category,
          status: result?.status || "PENDING",
          components,
          variables: [],
          rejection_reason: null,
          metadata: result,
        },
        { onConflict: "waba_id,name,language" }
      );
      if (error) throw error;
      return json({ ok: true, result });
    }

    // -------- Delete template from Meta --------
    if (body.action === "delete_template") {
      const template_id = required(body.template_id, "Template");
      const { data: tpl, error } = await supabase.from("wa_templates").select("*").eq("id", template_id).single();
      if (error) throw error;
      try {
        await graph(`/${account.waba_id}/message_templates?name=${encodeURIComponent(tpl.name)}`, token, { method: "DELETE" });
      } catch (e) {
        console.warn("Meta delete failed, removing local copy anyway:", e);
      }
      await supabase.from("wa_templates").delete().eq("id", template_id);
      return json({ ok: true });
    }

    // -------- Edit existing template on Meta --------
    // Meta only allows editing `category` and `components` (not name/language) on
    // APPROVED or PAUSED templates via POST /{template_meta_id}.
    if (body.action === "edit_template") {
      const template_id = required(body.template_id, "Template");
      const { data: tpl, error: tplErr } = await supabase.from("wa_templates").select("*").eq("id", template_id).single();
      if (tplErr) throw tplErr;

      const components = Array.isArray(body.components) ? body.components : tpl.components;
      if (!components.length) throw new Error("At least one component (e.g. BODY) is required");
      const category = ["MARKETING", "UTILITY", "AUTHENTICATION"].includes(body.category) ? body.category : tpl.category;

      // Same FLOW + example normalization as create_template.
      for (const comp of components) {
        if (comp?.type === "BUTTONS" && Array.isArray(comp.buttons)) {
          for (const btn of comp.buttons) {
            if (btn?.type === "FLOW") {
              const num = typeof btn.flow_id === "number" ? btn.flow_id : Number(String(btn.flow_id ?? "").trim());
              if (!Number.isFinite(num) || num <= 0) throw new Error(`FLOW button "${btn.text || "(unnamed)"}" needs a numeric flow_id`);
              btn.flow_id = num;
            }
          }
        }
      }
      const sampleFor = (i: number) => ["Alex", "12345", "today", "$49", "Premium", "tomorrow"][i] || `value${i + 1}`;
      for (const comp of components) {
        const t = String(comp?.type || "").toUpperCase();
        if (t !== "HEADER" && t !== "BODY") continue;
        const text: string = typeof comp.text === "string" ? comp.text : "";
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

      // Resolve Meta's template id. Prefer the one stored in metadata; otherwise look it up by name+language.
      let metaTemplateId: string | null = (tpl.metadata && typeof tpl.metadata === "object" && (tpl.metadata as any).id) || null;
      if (!metaTemplateId) {
        const lookup = await graph(`/${account.waba_id}/message_templates?name=${encodeURIComponent(tpl.name)}&limit=20`, token);
        const match = (lookup.data || []).find((x: any) => x.name === tpl.name && x.language === tpl.language);
        metaTemplateId = match?.id || null;
      }
      if (!metaTemplateId) throw new Error("Could not find this template on Meta. Try syncing first.");

      const result = await graph(`/${metaTemplateId}`, token, {
        method: "POST",
        body: JSON.stringify({ category, components }),
      });

      const { error } = await supabase.from("wa_templates").update({
        category,
        components,
        status: result?.status || "PENDING",
        rejection_reason: null,
        metadata: { ...(tpl.metadata || {}), id: metaTemplateId, last_edit: result },
      }).eq("id", template_id);
      if (error) throw error;
      return json({ ok: true, result });
    }

    // -------- Send test template --------
    // -------- Upload local media to Meta and get a media_id --------
    // Accepts { file_base64, mime_type, filename } and returns { media_id }.
    // The returned id can be passed as `header_media_id` to send_test_template
    // / send_message so users can use local files instead of public URLs.
    if (body.action === "upload_media") {
      const mime = required(body.mime_type, "mime_type").slice(0, 120);
      const filename = (typeof body.filename === "string" && body.filename.trim()) ? body.filename.trim().slice(0, 200) : "upload";
      const b64 = required(body.file_base64, "file_base64");
      // Decode base64 → bytes
      const cleaned = b64.includes(",") ? b64.split(",").pop()! : b64;
      const binary = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
      if (binary.byteLength > 16 * 1024 * 1024) {
        throw new Error("File too large. Meta limits images to 5MB, video to 16MB, documents to 100MB.");
      }
      const buildForm = () => {
        const form = new FormData();
        form.append("messaging_product", "whatsapp");
        form.append("type", mime);
        form.append("file", new Blob([binary], { type: mime }), filename);
        return form;
      };
      try {
        const { result, attempts } = await withRetry(async () => {
          const upload = await fetch(`${GRAPH}/${account.phone_number_id}/media`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: buildForm(),
          });
          const data = await upload.json().catch(() => ({}));
          return { ok: upload.ok && !!data?.id, status: upload.status, data };
        });
        await logSendAttempts(supabase, attempts, {
          stage: "upload",
          kind: "upload_media",
          phone_number_id: account.id,
          request_payload: { filename, mime_type: mime, size_bytes: binary.byteLength },
        });
        return json({ ok: true, media_id: result.id, mime_type: mime, filename, attempts: attempts.length });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const attempts: AttemptLog[] = (e as any)?.attempts || [];
        await logSendAttempts(supabase, attempts.length ? attempts : [{
          attempt_number: 1, status: "failed", http_status: null, latency_ms: 0, error_message: msg, response_payload: {},
        }], {
          stage: "upload",
          kind: "upload_media",
          phone_number_id: account.id,
          request_payload: { filename, mime_type: mime, size_bytes: binary.byteLength },
        });
        throw e;
      }
    }

    if (body.action === "send_test_template") {
      const to = phone(body.to);
      const template_id = required(body.template_id, "Template");
      const { data: tpl, error } = await supabase.from("wa_templates").select("*").eq("id", template_id).single();
      if (error) throw error;
      const { components, values } = buildTemplateComponents(tpl, body);
      const tplPayload: Record<string, unknown> = {
        name: tpl.name,
        language: { code: tpl.language },
      };
      if (components.length) tplPayload.components = components;
      const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: tplPayload,
      };
      let result: any;
      let attempts: AttemptLog[] = [];
      try {
        const out = await withRetry(async () => {
          const r = await fetch(`${GRAPH}/${account.phone_number_id}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await r.json().catch(() => ({}));
          return { ok: r.ok, status: r.status, data };
        });
        result = out.result;
        attempts = out.attempts;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const errAttempts: AttemptLog[] = (e as any)?.attempts || [{
          attempt_number: 1, status: "failed", http_status: null, latency_ms: 0, error_message: msg, response_payload: {},
        }];
        await logSendAttempts(supabase, errAttempts, {
          stage: "send",
          kind: "send_test_template",
          phone_number_id: account.id,
          template_id: tpl.id,
          template_name: tpl.name,
          recipient_phone: to,
          request_payload: payload,
        });
        throw e;
      }
      const providerMessageId = result.messages?.[0]?.id || null;
      const previewText = `[template: ${tpl.name}]`;
      const { conversation, contact } = await ensureOutboundConversation(supabase, account, to, previewText, { name: tpl.name, language: tpl.language, variables: values });
      const { data: insertedMsg } = await supabase.from("wa_messages").insert({
        conversation_id: conversation?.id || null,
        contact_id: contact?.id || null,
        phone_number_id: account.id,
        provider_message_id: providerMessageId,
        direction: "outbound",
        message_type: "template",
        template_name: tpl.name,
        template_language: tpl.language,
        body: previewText,
        status: "sent",
        raw_payload: { ...result, sent_payload: payload, variables: values },
        sent_at: new Date().toISOString(),
      }).select().single();
      await logSendAttempts(supabase, attempts, {
        stage: "send",
        kind: "send_test_template",
        phone_number_id: account.id,
        template_id: tpl.id,
        template_name: tpl.name,
        recipient_phone: to,
        message_id: insertedMsg?.id || null,
        provider_message_id: providerMessageId,
        request_payload: payload,
      });
      return json({ ok: true, result, message_id: insertedMsg?.id || null, attempts: attempts.length });
    }

    // -------- Send message (text / media / template) --------
    if (body.action === "send_message") {
      const to = phone(body.to);
      let payload: Record<string, unknown>;
      if (body.kind === "template") {
        const { data: template, error } = await supabase.from("wa_templates").select("*").eq("id", required(body.template_id, "Template")).single();
        if (error) throw error;
        const { components, values } = buildTemplateComponents(template, body);
        const tplPayload: Record<string, unknown> = {
          name: template.name,
          language: { code: template.language },
        };
        if (components.length) tplPayload.components = components;
        payload = {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: tplPayload,
        };
      } else if (body.kind === "media") {
        const type = ["image", "document", "audio", "video"].includes(body.type) ? body.type : "image";
        payload = {
          messaging_product: "whatsapp",
          to,
          type,
          [type]: { link: required(body.media_url, "Media URL"), caption: String(body.caption || "").slice(0, 1024) },
        };
      } else {
        payload = { messaging_product: "whatsapp", to, type: "text", text: { preview_url: true, body: required(body.body, "Message").slice(0, 4096) } };
      }
      const result = await graph(`/${account.phone_number_id}/messages`, token, { method: "POST", body: JSON.stringify(payload) });
      const providerMessageId = result.messages?.[0]?.id || null;
      const previewText = body.body || body.caption || `[${body.kind || "text"}]`;
      const isTemplate = body.kind === "template";
      const tplMeta = isTemplate ? { name: (payload as any).template?.name, language: (payload as any).template?.language?.code, variables: Array.isArray(body.variables) ? body.variables : [] } : null;
      const { conversation, contact } = await ensureOutboundConversation(supabase, account, to, previewText, tplMeta);
      await supabase.from("wa_messages").insert({
        conversation_id: conversation?.id || null,
        contact_id: contact?.id || null,
        phone_number_id: account.id,
        provider_message_id: providerMessageId,
        direction: "outbound",
        message_type: String(body.kind || "text"),
        body: body.body || body.caption || null,
        template_name: isTemplate ? (payload as any).template?.name || null : null,
        template_language: isTemplate ? (payload as any).template?.language?.code || null : null,
        status: "sent",
        raw_payload: { ...result, sent_payload: payload, variables: isTemplate ? (Array.isArray(body.variables) ? body.variables : []) : undefined },
        sent_at: new Date().toISOString(),
      });
      return json({ ok: true, result });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
