import { supabase } from "@/lib/supabase";

export async function resolveTokenFor(accountUuid) {
  const { data: cred, error } = await supabase
    .from("wa_account_credentials")
    .select("access_token")
    .eq("phone_number_id", accountUuid)
    .single();
    
  if (error || !cred?.access_token) {
    throw new Error("Access token missing for the selected account. Please re-configure in settings.");
  }
  
  return cred.access_token;
}

export async function resolveAccount({ account_id } = {}) {
  let account = null;
  
  if (account_id) {
    const { data, error } = await supabase
      .from("wa_phone_numbers")
      .select("*")
      .eq("id", account_id)
      .single();
    if (error) throw error;
    account = data;
  } else {
    const { data, error } = await supabase
      .from("wa_phone_numbers")
      .select("*")
      .eq("is_default", true)
      .maybeSingle();
    if (error) throw error;
    account = data;
  }
  
  if (!account) throw new Error("No WhatsApp account configured. Please add one in settings.");
  
  const token = await resolveTokenFor(account.id);
  return { account, token };
}
