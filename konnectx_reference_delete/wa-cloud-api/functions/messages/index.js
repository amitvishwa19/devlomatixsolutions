import { supabase } from "@/integrations/supabase/client";

export async function listMessages({ conversationId, limit = 200 } = {}) {
  let q = supabase.from("wa_messages").select("*").order("created_at", { ascending: false }).limit(limit);
  if (conversationId) q = q.eq("conversation_id", conversationId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getMessage(id) {
  const { data, error } = await supabase.from("wa_messages").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}