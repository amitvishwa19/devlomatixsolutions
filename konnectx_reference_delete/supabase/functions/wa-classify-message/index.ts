// Auto-tag + sentiment for an inbound WhatsApp message.
// Best-effort: failures are logged and never block message intake.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash-lite";

type AiCfg = {
  provider: "lovable" | "custom";
  model: string;
  custom_model: string;
  custom_base_url: string;
  custom_api_key: string;
};

async function loadAiConfig(supabase: any): Promise<AiCfg> {
  const { data } = await supabase
    .from("wa_ai_config")
    .select("provider, model, custom_model, custom_base_url, custom_api_key")
    .eq("id", "default")
    .maybeSingle();
  return {
    provider: data?.provider === "custom" ? "custom" : "lovable",
    model: data?.model || DEFAULT_MODEL,
    custom_model: data?.custom_model || "",
    custom_base_url: data?.custom_base_url || "",
    custom_api_key: data?.custom_api_key || "",
  };
}

async function callAI(cfg: AiCfg, body: Record<string, unknown>) {
  const isCustom =
    cfg.provider === "custom" && cfg.custom_api_key && cfg.custom_base_url && cfg.custom_model;
  let url: string, apiKey: string, model: string;
  if (isCustom) {
    url = `${cfg.custom_base_url.replace(/\/+$/, "")}/chat/completions`;
    apiKey = cfg.custom_api_key;
    model = cfg.custom_model;
  } else {
    apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
    url = LOVABLE_GATEWAY;
    model = cfg.model || DEFAULT_MODEL;
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, ...body }),
  });
  if (resp.status === 429) throw new Error("Rate limited");
  if (resp.status === 402) throw new Error("AI credits exhausted");
  if (!resp.ok) throw new Error(`AI ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return await resp.json();
}

const TAG_OPTIONS = [
  "lead", "support", "complaint", "billing", "sales",
  "feedback", "spam", "urgent", "question", "order",
];

const tools = [{
  type: "function",
  function: {
    name: "classify_message",
    description: "Classify an incoming customer WhatsApp message",
    parameters: {
      type: "object",
      properties: {
        tags: {
          type: "array",
          items: { type: "string", enum: TAG_OPTIONS },
          description: "1-3 tags that best describe this message",
        },
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative", "frustrated", "happy"],
        },
        urgency: { type: "string", enum: ["low", "medium", "high"] },
      },
      required: ["tags", "sentiment", "urgency"],
      additionalProperties: false,
    },
  },
}];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { message_id } = await req.json();
    if (!message_id) {
      return new Response(JSON.stringify({ error: "message_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: msg } = await supabase
      .from("wa_messages")
      .select("id, body, message_type, conversation_id")
      .eq("id", message_id)
      .maybeSingle();
    if (!msg?.body) {
      return new Response(JSON.stringify({ ok: true, skipped: "no body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cfg = await loadAiConfig(supabase);
    const result = await callAI(cfg, {
      messages: [
        { role: "system", content: "You are a fast classifier of inbound customer WhatsApp messages. Always call the classify_message tool." },
        { role: "user", content: `Message: """${String(msg.body).slice(0, 800)}"""` },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "classify_message" } },
    });
    const args = result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("no classification returned");
    const parsed = JSON.parse(args);
    const tags = (parsed.tags || []).filter((t: string) => TAG_OPTIONS.includes(t));
    await supabase.from("wa_messages").update({
      auto_tags: tags,
      sentiment: parsed.sentiment || null,
    }).eq("id", message_id);
    return new Response(JSON.stringify({ ok: true, tags, sentiment: parsed.sentiment, urgency: parsed.urgency }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wa-classify-message error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
