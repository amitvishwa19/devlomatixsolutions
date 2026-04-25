import { supabase } from "@/integrations/supabase/client";

export async function listSegments() {
  const { data, error } = await supabase.from("wa_segments").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function createSegment(payload) {
  const { data, error } = await supabase.from("wa_segments").insert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function updateSegment(id, patch) {
  const { data, error } = await supabase.from("wa_segments").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteSegment(id) {
  const { error } = await supabase.from("wa_segments").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}