// Outbound webhook dispatcher.
// Body: { event_type: string, payload: any, webhook_id?: string }
// If webhook_id is provided, deliver only to that endpoint (used by "test send").
// Otherwise, fan out to every enabled endpoint subscribed to event_type.
// Each delivery is signed with HMAC-SHA256 using the per-endpoint secret and
// sent with up to 3 attempts (exponential backoff). Outcome is logged.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function deliverOnce(url: string, body: string, signature: string, eventType: string) {
  const start = Date.now();
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": eventType,
        "X-Webhook-Signature-256": `sha256=${signature}`,
        "User-Agent": "KonnectX-Webhook/1.0",
      },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    const responseText = await resp.text().catch(() => "");
    return {
      ok: resp.ok,
      status: resp.status,
      latency: Date.now() - start,
      response: responseText.slice(0, 500),
      error: resp.ok ? null : `HTTP ${resp.status}`,
    };
  } catch (e) {
    return {
      ok: false,
      status: null as number | null,
      latency: Date.now() - start,
      response: null as string | null,
      error: e instanceof Error ? e.message : "network error",
    };
  }
}

async function dispatchOne(supabase: any, hook: any, eventType: string, payload: unknown) {
  const body = JSON.stringify({ event: eventType, sent_at: new Date().toISOString(), data: payload });
  const signature = hook.secret ? await hmacSha256Hex(hook.secret, body) : "";
  let attempt = 0;
  let outcome: Awaited<ReturnType<typeof deliverOnce>> | null = null;
  while (attempt < 3) {
    attempt += 1;
    outcome = await deliverOnce(hook.url, body, signature, eventType);
    if (outcome.ok) break;
    if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  await supabase.from("wa_outbound_webhook_deliveries").insert({
    webhook_id: hook.id,
    event_type: eventType,
    target_url: hook.url,
    status: outcome?.ok ? "delivered" : "failed",
    http_status: outcome?.status,
    latency_ms: outcome?.latency,
    attempt_number: attempt,
    request_payload: JSON.parse(body),
    response_body: outcome?.response,
    error_message: outcome?.error,
  });
  await supabase.from("wa_outbound_webhooks").update({
    last_delivery_at: new Date().toISOString(),
    last_status: outcome?.ok ? "delivered" : "failed",
    last_error: outcome?.error,
    failure_count: outcome?.ok ? 0 : (hook.failure_count || 0) + 1,
  }).eq("id", hook.id);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { event_type, payload, webhook_id } = await req.json();
    if (!event_type) {
      return new Response(JSON.stringify({ error: "event_type required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let hooks: any[] = [];
    if (webhook_id) {
      const { data } = await supabase.from("wa_outbound_webhooks").select("*").eq("id", webhook_id).limit(1);
      hooks = data || [];
    } else {
      const { data } = await supabase
        .from("wa_outbound_webhooks")
        .select("*")
        .eq("enabled", true)
        .contains("events", [event_type]);
      hooks = data || [];
    }
    if (!hooks.length) {
      return new Response(JSON.stringify({ ok: true, dispatched: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Fire-and-forget so the caller (webhook ingestion) isn't slowed by slow customer endpoints.
    const tasks = hooks.map((h) => dispatchOne(supabase, h, event_type, payload));
    if (webhook_id) await Promise.all(tasks); // Test sends should report back synchronously
    else { Promise.allSettled(tasks); }
    return new Response(JSON.stringify({ ok: true, dispatched: hooks.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wa-webhook-dispatch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
