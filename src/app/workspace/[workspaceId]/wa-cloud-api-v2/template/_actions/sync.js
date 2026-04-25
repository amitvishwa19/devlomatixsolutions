"use server";

import { supabase } from "@/lib/supabase";
import { graph, required } from "../../_lib/server/meta";
import { resolveAccount } from "../../_lib/server/credentials";

/**
 * Ported from konnectx_reference_delete/supabase/functions/wa-cloud-api/index.ts
 */
export async function syncTemplates(payload = {}) {
  try {
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
      const { error } = await supabase
        .from("wa_templates")
        .upsert(templates, { onConflict: "waba_id,name,language" });
      if (error) throw error;
    }

    return { success: true, count: templates.length };
  } catch (error) {
    console.error("[syncTemplates Action Error]", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTemplate(templateId, accountId = null) {
  try {
    const { account, token } = await resolveAccount({ account_id: accountId });
    
    const { data: tpl, error: tplErr } = await supabase
      .from("wa_templates")
      .select("*")
      .eq("id", required(templateId, "Template"))
      .single();
    if (tplErr) throw tplErr;

    try {
      await graph(`/${account.waba_id}/message_templates?name=${encodeURIComponent(tpl.name)}`, token, { method: "DELETE" });
    } catch (e) {
      console.warn("Meta delete failed, removing local copy anyway:", e);
    }

    await supabase.from("wa_templates").delete().eq("id", templateId);
    return { success: true };
  } catch (error) {
    console.error("[deleteTemplate Action Error]", error);
    return { success: false, error: error.message };
  }
}

export async function createTemplate(payload) {
  try {
    const { account, token } = await resolveAccount({ account_id: payload.account_id });
    
    // Logic from edge function for sanitizing components, adding examples, etc.
    const name = required(payload.name, "Template name").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 512);
    const language = required(payload.language, "Language").slice(0, 10);
    const category = ["MARKETING", "UTILITY", "AUTHENTICATION"].includes(payload.category) ? payload.category : "MARKETING";
    const components = Array.isArray(payload.components) ? payload.components : [];
    
    // ... (logic from index.ts lines 496-535 would go here for a production-ready port)
    // For now, porting the core Graph API call
    
    const result = await graph(`/${account.waba_id}/message_templates`, token, {
      method: "POST",
      body: JSON.stringify({ name, language, category, components }),
    });

    const { error } = await supabase.from("wa_templates").upsert(
      {
        waba_id: account.waba_id,
        name,
        language,
        category,
        status: result?.status || "PENDING",
        components,
        variables: [],
        rejection_reason: null,
        metadata: result,
      },
      { onConflict: "waba_id,name,language" }
    );
    if (error) throw error;
    
    return { success: true, result };
  } catch (error) {
    console.error("[createTemplate Action Error]", error);
    return { success: false, error: error.message };
  }
}

export async function editTemplate(payload) {
  try {
    const { account, token } = await resolveAccount({ account_id: payload.account_id });
    const { data: tpl, error: tplErr } = await supabase.from("wa_templates").select("*").eq("id", required(payload.template_id, "Template")).single();
    if (tplErr) throw tplErr;

    const components = Array.isArray(payload.components) ? payload.components : tpl.components;
    const category = ["MARKETING", "UTILITY", "AUTHENTICATION"].includes(payload.category) ? payload.category : tpl.category;

    let metaTemplateId = (tpl.metadata && typeof tpl.metadata === "object" && tpl.metadata.id) || null;
    if (!metaTemplateId) {
      const lookup = await graph(`/${account.waba_id}/message_templates?name=${encodeURIComponent(tpl.name)}&limit=20`, token);
      const match = (lookup.data || []).find((x) => x.name === tpl.name && x.language === tpl.language);
      metaTemplateId = match?.id || null;
    }
    if (!metaTemplateId) throw new Error("Could not find this template on Meta. Try syncing first.");

    const result = await graph(`/${metaTemplateId}`, token, {
      method: "POST",
      body: JSON.stringify({ category, components }),
    });

    const { error } = await supabase.from("wa_templates").update({
      category,
      components,
      status: result?.status || "PENDING",
      rejection_reason: null,
      metadata: { ...(tpl.metadata || {}), id: metaTemplateId, last_edit: result },
    }).eq("id", payload.template_id);
    if (error) throw error;

    return { success: true, result };
  } catch (error) {
    console.error("[editTemplate Action Error]", error);
    return { success: false, error: error.message };
  }
}

export async function uploadMedia(payload) {
  try {
    const { account, token } = await resolveAccount({ account_id: payload.account_id });
    const mime = required(payload.mime_type, "mime_type").slice(0, 120);
    const filename = (typeof payload.filename === "string" && payload.filename.trim()) ? payload.filename.trim().slice(0, 200) : "upload";
    const b64 = required(payload.file_base64, "file_base64");
    
    const cleaned = b64.includes(",") ? b64.split(",").pop() : b64;
    const buffer = Buffer.from(cleaned, 'base64');
    
    if (buffer.length > 16 * 1024 * 1024) {
      throw new Error("File too large. Meta limits images to 5MB, video to 16MB, documents to 100MB.");
    }

    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", mime);
    form.append("file", new Blob([buffer], { type: mime }), filename);

    const res = await fetch(`https://graph.facebook.com/v22.0/${account.phone_number_id}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(`Media upload failed: ${data?.error?.message || JSON.stringify(data)}`);

    return { success: true, media_id: data.id };
  } catch (error) {
    console.error("[uploadMedia Action Error]", error);
    return { success: false, error: error.message };
  }
}

export async function sendTestTemplate(payload) {
  try {
    const { account, token } = await resolveAccount({ account_id: payload.account_id });
    const to = payload.to;
    const { data: tpl, error } = await supabase.from("wa_templates").select("*").eq("id", required(payload.template_id, "Template")).single();
    if (error) throw error;

    const { buildTemplateComponents } = await import("../../_lib/server/templates");
    const { components, values } = buildTemplateComponents(tpl, payload);
    
    const tplPayload = {
      name: tpl.name,
      language: { code: tpl.language },
    };
    if (components.length) tplPayload.components = components;

    const body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: tplPayload,
    };

    const result = await graph(`/${account.phone_number_id}/messages`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const providerMessageId = result.messages?.[0]?.id || null;
    const previewText = `[test: ${tpl.name}]`;
    
    const { ensureOutboundConversation } = await import("../../_lib/server/conversations");
    const { conversation, contact } = await ensureOutboundConversation(account, to, previewText, { name: tpl.name, language: tpl.language, variables: values });

    await supabase.from("wa_messages").insert({
      conversation_id: conversation?.id || null,
      contact_id: contact?.id || null,
      phone_number_id: account.id,
      provider_message_id: providerMessageId,
      direction: "outbound",
      message_type: "template",
      template_name: tpl.name,
      template_language: tpl.language,
      body: previewText,
      status: "sent",
      raw_payload: { ...result, sent_payload: body, variables: values },
      sent_at: new Date().toISOString(),
    });

    return { success: true, result };
  } catch (error) {
    console.error("[sendTestTemplate Action Error]", error);
    return { success: false, error: error.message };
  }
}
