// Local equivalents of edge actions: test_account, save_account, refresh_account.
// Returns the same shapes the edge function returns.
import { supabase } from "@/integrations/supabase/client";
import { graph, required, tokenPreview } from "../_shared/meta";
import { resolveTokenFor } from "../_shared/credentials";

export async function testAccount(payload) {
  const phone_number_id = required(payload.phone_number_id, "Phone number ID").slice(0, 80);
  const access_token = required(payload.access_token, "Access token");
  const waba_id = typeof payload.waba_id === "string" ? payload.waba_id.trim().slice(0, 80) : "";
  const meta = await graph(`/${phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name,name_status`, access_token);
  let waba = null;
  if (waba_id) {
    try { waba = await graph(`/${waba_id}?fields=id,name,timezone_id,message_template_namespace`, access_token); } catch { waba = null; }
  }
  return { ok: true, meta, waba };
}

export async function saveAccount(payload) {
  const display_name = required(payload.display_name, "Account name").slice(0, 120);
  const phone_number_id = required(payload.phone_number_id, "Phone number ID").slice(0, 80);
  const waba_id = required(payload.waba_id, "WABA ID").slice(0, 80);
  const access_token = required(payload.access_token, "Access token");
  const user_phone = typeof payload.phone_number === "string" ? payload.phone_number.trim().slice(0, 32) : "";

  const meta = await graph(`/${phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name`, access_token);
  const phone_number = user_phone || meta?.display_phone_number || phone_number_id;

  const { data: existing } = await supabase.from("wa_phone_numbers").select("id").limit(1);
  const { data: account, error } = await supabase
    .from("wa_phone_numbers")
    .upsert(
      {
        display_name, phone_number, phone_number_id, waba_id,
        is_default: !existing?.length,
        status: "connected",
        quality_rating: meta?.quality_rating || "unknown",
        verified_name: meta?.verified_name || null,
        last_verified_at: new Date().toISOString(),
      },
      { onConflict: "phone_number_id" }
    )
    .select()
    .single();
  if (error) throw error;

  const { error: credentialError } = await supabase
    .from("wa_account_credentials")
    .upsert({ phone_number_id: account.id, access_token, token_preview: tokenPreview(access_token) }, { onConflict: "phone_number_id" });
  if (credentialError) throw credentialError;
  return { ok: true, account_id: account.id, meta };
}

export async function refreshAccount(payload) {
  const account_id = required(payload.account_id, "Account");
  const { data: account, error } = await supabase.from("wa_phone_numbers").select("*").eq("id", account_id).single();
  if (error) throw error;
  const token = await resolveTokenFor(account.id);
  const meta = await graph(`/${account.phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name`, token);
  await supabase
    .from("wa_phone_numbers")
    .update({
      phone_number: meta?.display_phone_number || account.phone_number,
      quality_rating: meta?.quality_rating || "unknown",
      verified_name: meta?.verified_name || null,
      last_verified_at: new Date().toISOString(),
    })
    .eq("id", account.id);
  return { ok: true, meta };
}