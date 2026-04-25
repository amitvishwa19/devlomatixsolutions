import { supabase } from "@/lib/supabase";

export const PROVIDER_PRESETS = {
  Gemini: { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.5-flash-lite" },
  OpenRouter: { baseURL: "https://openrouter.ai/api/v1", model: "google/gemini-2.0-flash-exp:free" },
  OpenAI: { baseURL: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  Groq: { baseURL: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
  Together: { baseURL: "https://api.together.xyz/v1", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  Mistral: { baseURL: "https://api.mistral.ai/v1", model: "mistral-large-latest" },
  Ollama: { baseURL: "http://localhost:11434/v1", model: "llama3.1" },
  Custom: { baseURL: "", model: "" },
};

export const newModel = (overrides = {}) => ({
  id: crypto.randomUUID(),
  label: "new-model",
  provider: "Gemini",
  baseURL: PROVIDER_PRESETS.Gemini.baseURL,
  model: PROVIDER_PRESETS.Gemini.model,
  apiKey: "",
  strengths: "",
  ...overrides,
});

export const defaultConfig = {
  name: "My Agent",
  systemPrompt:
    "You are a helpful, precise AI agent. Use tools when they improve accuracy. Cite sources when using web search. When document context is provided, prefer it over prior knowledge.",
  temperature: 0.3,
  enableWebSearch: false,
  enableCalculator: true,
  models: [],
  defaultModelId: null,
  enableRouter: true,
  streamDelayMs: 18,
};

export const getDefaultModel = (c) => {
  const models = c?.models ?? [];
  return models.find((m) => m.id === c?.defaultModelId) ?? models[0] ?? null;
};

// ---------- Config (singleton row) ----------

async function getOrCreateConfigRow() {
  const { data, error } = await supabase
    .from("agent_config")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insErr } = await supabase
    .from("agent_config")
    .insert({})
    .select("*")
    .single();
  if (insErr) throw insErr;
  return created;
}

export async function loadConfig() {
  try {
    const row = await getOrCreateConfigRow();
    const { data: models, error: mErr } = await supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: true });
    if (mErr) throw mErr;
    return {
      name: row.name,
      systemPrompt: row.system_prompt,
      temperature: Number(row.temperature),
      enableWebSearch: row.enable_web_search,
      enableCalculator: row.enable_calculator,
      enableRouter: row.enable_router,
      defaultModelId: row.default_model_id,
      streamDelayMs: Number(row.stream_delay_ms ?? 18),
      models: (models ?? []).map((m) => ({
        id: m.id,
        label: m.label,
        provider: m.provider,
        baseURL: m.base_url,
        model: m.model,
        apiKey: m.api_key,
        strengths: m.strengths ?? "",
        lastTestOk: m.last_test_ok ?? null,
        lastTestAt: m.last_test_at ?? null,
        lastTestMessage: m.last_test_message ?? null,
        lastLatencyMs: m.last_latency_ms ?? null,
        capabilities: m.capabilities ?? [],
      })),
    };
  } catch (e) {
    console.error("loadConfig failed", e);
    return defaultConfig;
  }
}

export async function saveAgentMeta(c) {
  const row = await getOrCreateConfigRow();
  const { error } = await supabase
    .from("agent_config")
    .update({
      name: c.name,
      system_prompt: c.systemPrompt,
      temperature: c.temperature,
      enable_web_search: c.enableWebSearch,
      enable_calculator: c.enableCalculator,
      enable_router: c.enableRouter,
      default_model_id: c.defaultModelId,
      stream_delay_ms: c.streamDelayMs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  if (error) throw error;
}

export async function setDefaultModelId(id) {
  const row = await getOrCreateConfigRow();
  const { error } = await supabase
    .from("agent_config")
    .update({ default_model_id: id })
    .eq("id", row.id);
  if (error) throw error;
}

// ---------- Models ----------

export async function upsertModel(m) {
  const payload = {
    id: m.id,
    label: m.label,
    provider: m.provider,
    base_url: m.baseURL,
    model: m.model,
    api_key: m.apiKey,
    strengths: m.strengths ?? "",
  };
  const { data, error } = await supabase
    .from("models")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    label: data.label,
    provider: data.provider,
    baseURL: data.base_url,
    model: data.model,
    apiKey: data.api_key,
    strengths: data.strengths ?? "",
    lastTestOk: data.last_test_ok ?? null,
    lastTestAt: data.last_test_at ?? null,
    lastTestMessage: data.last_test_message ?? null,
    lastLatencyMs: data.last_latency_ms ?? null,
    capabilities: data.capabilities ?? [],
  };
}

export async function saveModelTestResult(
  id,
  ok,
  message,
  latencyMs,
  capabilities,
) {
  const patch = {
    last_test_ok: ok,
    last_test_at: new Date().toISOString(),
    last_test_message: message.slice(0, 500),
  };
  if (typeof latencyMs === "number") patch.last_latency_ms = latencyMs;
  if (Array.isArray(capabilities)) patch.capabilities = capabilities;
  const { error } = await supabase.from("models").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteModel(id) {
  const { error } = await supabase.from("models").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Messages ----------

export async function loadMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map((m) => ({
    role: m.role,
    content: m.content,
    meta: m.meta ?? undefined,
  }));
}

export async function appendMessage(m) {
  const { error } = await supabase.from("messages").insert({
    role: m.role,
    content: m.content,
    meta: m.meta ?? null,
  });
  if (error) throw error;
}

export async function clearMessages() {
  const { error } = await supabase.from("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}

// ---------- RAG ----------

export async function loadRag() {
  const { data, error } = await supabase
    .from("rag_docs")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    chunks: d.chunks ?? [],
  }));
}

export async function insertRagDoc(doc) {
  const { error } = await supabase.from("rag_docs").insert({
    id: doc.id,
    name: doc.name,
    chunks: doc.chunks,
  });
  if (error) throw error;
}

export async function deleteRagDoc(id) {
  const { error } = await supabase.from("rag_docs").delete().eq("id", id);
  if (error) throw error;
}
