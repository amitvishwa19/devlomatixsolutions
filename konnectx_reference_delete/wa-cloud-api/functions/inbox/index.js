// Inbox actions: send reply, assign, close, load messages, mark read.
// Sending a reply delegates to the send module so we don't duplicate Meta call code.
import { supabase } from "@/integrations/supabase/client";
import { sendMessage } from "../send";

export async function loadMessages(conversationId) {
  const { data, error } = await supabase
    .from("wa_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listConversations() {
  const { data, error } = await supabase
    .from("wa_conversations")
    .select("*, wa_contacts(name, phone_number), wa_phone_numbers(display_name)")
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function sendReply({ to, body, account_id }) {
  return sendMessage({ to, body, kind: "text", account_id });
}

export async function assignConversation(id, assignee) {
  const { error } = await supabase.from("wa_conversations").update({ assigned_to: assignee }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function closeConversation(id) {
  const { error } = await supabase.from("wa_conversations").update({ status: "closed" }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function markRead(id) {
  const { error } = await supabase.from("wa_conversations").update({ unread_count: 0 }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}