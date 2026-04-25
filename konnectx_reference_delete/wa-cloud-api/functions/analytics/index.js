import { supabase } from "@/integrations/supabase/client";

export async function getAnalytics({ since } = {}) {
  let q = supabase.from("wa_messages").select("direction, status, created_at");
  if (since) q = q.gte("created_at", since);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}