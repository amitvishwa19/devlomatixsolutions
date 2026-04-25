// AI configuration is stored in the database (table `wa_ai_config`, single row id='default').
// The API key is NEVER returned to the browser — only `has_custom_api_key` + a masked preview.
// The wa-ai-assist edge function reads the full row server-side using the service role.
import { supabase } from "@/lib/supabase";

export const PRESET_MODELS = [
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (preview)" },
];

export const DEFAULT_CONFIG = {
  provider: "lovable",
  model: "google/gemini-2.5-flash",
  custom_model: "",
  custom_base_url: "",
  has_custom_api_key: false,
  custom_api_key_preview: "",
};

// Read non-secret AI config from the backend.
export async function loadAiConfig() {
  const { data, error } = await supabase.rpc("get_ai_config_safe");
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ...DEFAULT_CONFIG };
  return {
    provider: row.provider || DEFAULT_CONFIG.provider,
    model: row.model || DEFAULT_CONFIG.model,
    custom_model: row.custom_model || "",
    custom_base_url: row.custom_base_url || "",
    has_custom_api_key: !!row.has_custom_api_key,
    custom_api_key_preview: row.custom_api_key_preview || "",
  };
}

// Save AI config to the backend. Pass `custom_api_key` (string) only when (re)setting it;
// pass `null` or omit it to leave the existing key untouched. Pass "" to clear it.
export async function saveAiConfig(patch) {
  const update = {
    provider: patch.provider,
    model: patch.model,
    custom_model: patch.custom_model ?? "",
    custom_base_url: patch.custom_base_url ?? "",
  };
  // Only include the api key if the caller explicitly provided one (string).
  if (typeof patch.custom_api_key === "string") {
    update.custom_api_key = patch.custom_api_key;
  }
  // Strip undefined keys
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const { error } = await supabase
    .from("wa_ai_config")
    .update(update)
    .eq("id", "default");
  if (error) throw new Error(error.message);
  return loadAiConfig();
}
