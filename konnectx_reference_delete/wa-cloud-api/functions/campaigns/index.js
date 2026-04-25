import { supabase } from "@/integrations/supabase/client";

export async function listCampaigns() {
  const { data, error } = await supabase
    .from("wa_campaigns")
    .select("*, wa_templates(name, language), wa_phone_numbers(display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function createCampaign(payload) {
  const { data, error } = await supabase.from("wa_campaigns").insert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function updateCampaign(id, patch) {
  const { data, error } = await supabase.from("wa_campaigns").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
export async function startCampaign(id) {
  const { error } = await supabase.from("wa_campaigns").update({ status: "running", started_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}
export async function pauseCampaign(id) {
  const { error } = await supabase.from("wa_campaigns").update({ status: "paused" }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}
export async function deleteCampaign(id) {
  const { error } = await supabase.from("wa_campaigns").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}