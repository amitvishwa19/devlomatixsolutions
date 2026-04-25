"use server";

import { supabase } from "@/lib/supabase";
import { graph, required } from "../../_lib/server/meta";

/**
 * Ported from konnectx_reference_delete/supabase/functions/wa-cloud-api/index.ts
 */

function preview(token) {
  return token.length > 12 ? `${token.slice(0, 6)}••••${token.slice(-4)}` : "••••";
}

export async function testAccount(payload) {
  try {
    const phone_number_id = required(payload.phone_number_id, "Phone number ID").slice(0, 80);
    const access_token = required(payload.access_token, "Access token");
    const waba_id = typeof payload.waba_id === "string" ? payload.waba_id.trim().slice(0, 80) : "";

    const meta = await graph(`/${phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name,name_status`, access_token);
    
    let waba = null;
    if (waba_id) {
      try { 
        waba = await graph(`/${waba_id}?fields=id,name,timezone_id,message_template_namespace`, access_token); 
      } catch (_) { 
        waba = null; 
      }
    }

    return { success: true, meta, waba };
  } catch (error) {
    console.error("[testAccount Action Error]", error);
    return { success: false, error: error.message };
  }
}

export async function saveAccount(payload) {
  try {
    const display_name = required(payload.display_name, "Account name").slice(0, 120);
    const phone_number_id = required(payload.phone_number_id, "Phone number ID").slice(0, 80);
    const waba_id = required(payload.waba_id, "WABA ID").slice(0, 80);
    const access_token = required(payload.access_token, "Access token");
    const user_phone = typeof payload.phone_number === "string" ? payload.phone_number.trim().slice(0, 32) : "";

    const meta = await graph(`/${phone_number_id}?fields=id,display_phone_number,quality_rating,verified_name`, access_token);
    const phone_number = user_phone || meta?.display_phone_number || phone_number_id;

    // Check if this is the first account to set it as default
    const { data: existing } = await supabase.from("wa_phone_numbers").select("id").limit(1);

    const { data: account, error } = await supabase
      .from("wa_phone_numbers")
      .upsert(
        {
          display_name,
          phone_number,
          phone_number_id,
          waba_id,
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
      .upsert(
        { 
          phone_number_id: account.id, 
          access_token, 
          token_preview: preview(access_token) 
        }, 
        { onConflict: "phone_number_id" }
      );

    if (credentialError) throw credentialError;

    return { success: true, account_id: account.id, meta };
  } catch (error) {
    console.error("[saveAccount Action Error]", error);
    return { success: false, error: error.message };
  }
}

export async function syncTemplates(payload = {}) {
  const { resolveAccount } = await import("../../_lib/server/credentials");
  const { account, token } = await resolveAccount(payload);
  const result = await graph(`/${account.waba_id}/message_templates?limit=100`, token);
  const templates = (result.data || []).map((item) => ({
    waba_id: account.waba_id,
    name: item.name,
    language: item.language,
    category: item.category || "UNKNOWN",
    status: item.status || "UNKNOWN",
    components: item.components || [],
    variables: [],
    rejection_reason: item.rejected_reason || null,
    metadata: item,
  }));
  if (templates.length) {
    const { error } = await supabase.from("wa_templates").upsert(templates, { onConflict: "waba_id,name,language" });
    if (error) throw error;
  }
  return { success: true, count: templates.length };
}
