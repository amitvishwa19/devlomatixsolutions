// Direct DB equivalents for actions performed in pages/Contacts.jsx.
import { supabase } from "@/integrations/supabase/client";

export async function listContacts() {
  const { data, error } = await supabase.from("wa_contacts").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createContact(payload) {
  const { data, error } = await supabase.from("wa_contacts").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateContact(id, patch) {
  const { data, error } = await supabase.from("wa_contacts").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteContact(id) {
  const { error } = await supabase.from("wa_contacts").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function bulkImportContacts(rows) {
  const { data, error } = await supabase.from("wa_contacts").upsert(rows, { onConflict: "phone_number" }).select();
  if (error) throw error;
  return data;
}

export async function optOutContact(id, reason) {
  const { error } = await supabase
    .from("wa_contacts")
    .update({ status: "opted_out", opted_out_at: new Date().toISOString(), opt_out_reason: reason || null })
    .eq("id", id);
  if (error) throw error;
  return { ok: true };
}