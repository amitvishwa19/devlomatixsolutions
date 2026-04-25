import { supabase } from "@/integrations/supabase/client";

export async function getDashboardStats() {
  const [conversations, messages, contacts, campaigns] = await Promise.all([
    supabase.from("wa_conversations").select("id", { count: "exact", head: true }),
    supabase.from("wa_messages").select("id", { count: "exact", head: true }),
    supabase.from("wa_contacts").select("id", { count: "exact", head: true }),
    supabase.from("wa_campaigns").select("id", { count: "exact", head: true }),
  ]);
  return {
    conversations: conversations.count || 0,
    messages: messages.count || 0,
    contacts: contacts.count || 0,
    campaigns: campaigns.count || 0,
  };
}