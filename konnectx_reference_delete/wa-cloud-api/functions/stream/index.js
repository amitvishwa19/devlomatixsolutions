import { supabase } from "@/integrations/supabase/client";

export async function streamRecent({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("wa_messages").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}