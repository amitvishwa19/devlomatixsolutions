"use server";

import { supabase } from "@/lib/supabase";

export async function listCampaigns() {
  const { data, error } = await supabase
    .from("wa_campaigns")
    .select("*, wa_templates(name, language), wa_phone_numbers(display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return { success: true, data };
}

export async function createCampaign(payload) {
  const { data, error } = await supabase.from("wa_campaigns").insert(payload).select().single();
  if (error) throw error;
  return { success: true, data };
}

export async function updateCampaign(id, patch) {
  const { data, error } = await supabase.from("wa_campaigns").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return { success: true, data };
}

export async function startCampaign(id) {
  const { error } = await supabase
    .from("wa_campaigns")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  
  // Note: In a real environment, this should trigger a background worker.
  // For now, we just update the status to activate any existing database triggers or edge functions.
  return { success: true };
}

export async function pauseCampaign(id) {
  const { error } = await supabase
    .from("wa_campaigns")
    .update({ status: "paused" })
    .eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function deleteCampaign(id) {
  const { error } = await supabase.from("wa_campaigns").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}
