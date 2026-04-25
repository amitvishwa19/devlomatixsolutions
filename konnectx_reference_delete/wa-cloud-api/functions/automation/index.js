import { supabase } from "@/integrations/supabase/client";

export async function listRules() {
  const { data, error } = await supabase.from("wa_automation_rules").select("*").order("priority", { ascending: true });
  if (error) throw error;
  return data || [];
}
export async function createRule(payload) {
  const { data, error } = await supabase.from("wa_automation_rules").insert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function updateRule(id, patch) {
  const { data, error } = await supabase.from("wa_automation_rules").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteRule(id) {
  const { error } = await supabase.from("wa_automation_rules").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}
export async function toggleRule(id, enabled) {
  const { error } = await supabase.from("wa_automation_rules").update({ enabled }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}