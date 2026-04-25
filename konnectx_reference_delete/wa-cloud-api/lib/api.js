import { supabase } from "@/integrations/supabase/client";

const ACTION_FUNCTION = "wa-cloud-api";

export async function cloudAction(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke(ACTION_FUNCTION, {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message || "Cloud function failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export const db = {
  phoneNumbers: () => supabase.from("wa_phone_numbers").select("*").order("is_default", { ascending: false }).order("created_at", { ascending: false }),
  contacts: () => supabase.from("wa_contacts").select("*").order("updated_at", { ascending: false }),
  conversations: () => supabase.from("wa_conversations").select("*, wa_contacts(name, phone_number), wa_phone_numbers(display_name)").order("last_message_at", { ascending: false, nullsFirst: false }),
  messages: (conversationId) => supabase.from("wa_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true }),
  templates: () => supabase.from("wa_templates").select("*").order("updated_at", { ascending: false }),
  media: () => supabase.from("wa_media_assets").select("*, wa_phone_numbers(display_name)").order("created_at", { ascending: false }),
  campaigns: () => supabase.from("wa_campaigns").select("*, wa_templates(name, language), wa_phone_numbers(display_name)").order("created_at", { ascending: false }),
  events: () => supabase.from("wa_webhook_events").select("*").order("received_at", { ascending: false }).limit(30),
  quickReplies: () => supabase.from("wa_quick_replies").select("*").order("shortcut", { ascending: true }),
  assignees: () => supabase.from("wa_assignees").select("*").order("name", { ascending: true }),
  segments: () => supabase.from("wa_segments").select("*").order("updated_at", { ascending: false }),
  sendAttempts: (messageId) => supabase.from("wa_send_attempts").select("*").eq("message_id", messageId).order("created_at", { ascending: true }),
  webhookEventsForMessage: (providerMessageId) => supabase.from("wa_webhook_events").select("*").eq("provider_message_id", providerMessageId).order("received_at", { ascending: true }),
  message: (id) => supabase.from("wa_messages").select("*").eq("id", id).single(),
};
