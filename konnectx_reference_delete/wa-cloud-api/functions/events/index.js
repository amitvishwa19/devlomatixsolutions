import { supabase } from "@/integrations/supabase/client";

export async function listEvents({ limit = 30 } = {}) {
  const { data, error } = await supabase
    .from("wa_webhook_events").select("*").order("received_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function eventsForMessage(providerMessageId) {
  const { data, error } = await supabase
    .from("wa_webhook_events").select("*").eq("provider_message_id", providerMessageId).order("received_at", { ascending: true });
  if (error) throw error;
  return data || [];
}