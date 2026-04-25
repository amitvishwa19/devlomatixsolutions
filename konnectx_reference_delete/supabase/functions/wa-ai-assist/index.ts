import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";
const ALLOWED_LOVABLE_MODELS = new Set([
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-flash",
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-3.1-pro-preview",
]);

type AiCfg = {
  provider: "lovable" | "custom";
  model: string;
  custom_model: string;
  custom_base_url: string;
  custom_api_key: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function loadAiConfig(supabase: any): Promise<AiCfg> {
  const { data, error } = await supabase
    .from("wa_ai_config")
    .select("provider, model, custom_model, custom_base_url, custom_api_key")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw new Error(`Failed to load AI config: ${error.message}`);
  return {
    provider: (data?.provider === "custom" ? "custom" : "lovable"),
    model: data?.model || DEFAULT_MODEL,
    custom_model: data?.custom_model || "",
    custom_base_url: data?.custom_base_url || "",
    custom_api_key: data?.custom_api_key || "",
  };
}

async function callAI(
  cfg: AiCfg,
  messages: Array<{ role: string; content: string }>,
  opts: { tools?: any; tool_choice?: any } = {},
) {
  const isCustom =
    cfg.provider === "custom" && cfg.custom_api_key && cfg.custom_base_url && cfg.custom_model;

  let url: string;
  let apiKey: string;
  let model: string;

  if (isCustom) {
    url = `${cfg.custom_base_url.replace(/\/+$/, "")}/chat/completions`;
    apiKey = cfg.custom_api_key;
    model = cfg.custom_model;
  } else {
    apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
    url = LOVABLE_GATEWAY;
    model = ALLOWED_LOVABLE_MODELS.has(cfg.model) ? cfg.model : DEFAULT_MODEL;
  }

  const { tools, tool_choice } = opts;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, ...(tools ? { tools } : {}), ...(tool_choice ? { tool_choice } : {}) }),
  });
  if (response.status === 429) throw new Error("Rate limit reached. Please retry shortly.");
  if (response.status === 402) throw new Error("AI credits exhausted.");
  if (response.status === 401) throw new Error("Invalid API key for the configured AI provider.");
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`AI provider error ${response.status}: ${text.slice(0, 240)}`);
  }
  return await response.json();
}

async function loadThread(supabase: any, conversationId: string) {
  const { data: conv } = await supabase
    .from("wa_conversations")
    .select("*, wa_contacts(name, phone_number), wa_phone_numbers(display_name)")
    .eq("id", conversationId)
    .maybeSingle();
  const { data: msgs } = await supabase
    .from("wa_messages")
    .select("direction, body, message_type, created_at, status")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(60);
  return { conv, msgs: msgs || [] };
}

function transcript(msgs: any[]) {
  return msgs
    .map((m) => `${m.direction === "outbound" ? "Agent" : "Customer"}: ${m.body || `[${m.message_type}]`}`)
    .join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const cfg = await loadAiConfig(supabase);

    if (action === "ping") {
      const result = await callAI(cfg, [{ role: "user", content: "Reply with the single word: ok" }]);
      const reply = result.choices?.[0]?.message?.content?.trim() || "";
      const usedModel = cfg.provider === "custom" ? cfg.custom_model : cfg.model;
      return json({ ok: true, reply, provider: cfg.provider, model: usedModel });
    }

    if (action === "smart_reply") {
      const conversationId = String(body.conversation_id || "");
      if (!conversationId) return json({ error: "conversation_id required" }, 400);
      const { conv, msgs } = await loadThread(supabase, conversationId);
      if (!msgs.length) return json({ error: "No messages in this thread yet" }, 400);
      const customerName = conv?.wa_contacts?.name || conv?.external_contact_phone || "the customer";
      const sys = `You are a concise, friendly WhatsApp customer-support agent. Reply to ${customerName}. Keep replies under 320 characters, plain text (no markdown), warm but professional, and directly address the most recent customer message. Match the language the customer is writing in. Never invent prices, dates, or order details.`;
      const result = await callAI(cfg, [
        { role: "system", content: sys },
        { role: "user", content: `Conversation so far:\n${transcript(msgs)}\n\nWrite the single best next reply for the agent. Output only the reply text, no quotes, no preface.` },
      ]);
      const reply = result.choices?.[0]?.message?.content?.trim() || "";
      return json({ ok: true, reply });
    }

    if (action === "summarize_thread") {
      const conversationId = String(body.conversation_id || "");
      if (!conversationId) return json({ error: "conversation_id required" }, 400);
      const { msgs } = await loadThread(supabase, conversationId);
      if (!msgs.length) return json({ error: "No messages in this thread yet" }, 400);
      const tools = [{
        type: "function",
        function: {
          name: "summarize",
          description: "Summarize a customer support conversation",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "2-4 sentence summary of the conversation" },
              sentiment: { type: "string", enum: ["positive", "neutral", "negative", "frustrated", "happy"] },
              intent: { type: "string", description: "Primary customer intent (e.g. refund request, product question)" },
              next_action: { type: "string", description: "Recommended next action for the agent" },
              urgency: { type: "string", enum: ["low", "medium", "high"] },
            },
            required: ["summary", "sentiment", "intent", "next_action", "urgency"],
            additionalProperties: false,
          },
        },
      }];
      const result = await callAI(cfg, [
        { role: "system", content: "You analyze WhatsApp customer support threads and return structured insights." },
        { role: "user", content: `Analyze this conversation and call the summarize tool:\n\n${transcript(msgs)}` },
      ], { tools, tool_choice: { type: "function", function: { name: "summarize" } } });
      const call = result.choices?.[0]?.message?.tool_calls?.[0];
      if (!call) return json({ error: "AI did not return a summary" }, 500);
      const parsed = JSON.parse(call.function.arguments || "{}");
      const latestInbound = [...msgs].reverse().find((m) => m.direction === "inbound");
      if (latestInbound) {
        await supabase.from("wa_messages")
          .update({ sentiment: parsed.sentiment, ai_summary: parsed.summary })
          .eq("conversation_id", conversationId)
          .eq("direction", "inbound")
          .order("created_at", { ascending: false })
          .limit(1);
      }
      return json({ ok: true, ...parsed });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("wa-ai-assist error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
