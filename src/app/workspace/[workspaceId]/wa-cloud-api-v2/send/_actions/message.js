"use server";

import { supabase } from "@/lib/supabase";
import { graph, phoneNum, required, withRetry } from "../../_lib/server/meta";
import { resolveAccount } from "../../_lib/server/credentials";
import { buildTemplateComponents } from "../../_lib/server/templates";
import { ensureOutboundConversation, logSendAttempts } from "../../_lib/server/conversations";

/**
 * Ported from konnectx_reference_delete/supabase/functions/wa-cloud-api/index.ts
 */
export async function sendMessage(payload) {
  try {
    const { account, token } = await resolveAccount(payload);
    const to = phoneNum(payload.to);
    let body;
    let templateData = null;

    if (payload.kind === "template") {
      const { data: template, error } = await supabase
        .from("wa_templates")
        .select("*")
        .eq("id", required(payload.template_id, "Template"))
        .single();
      if (error) throw error;
      templateData = template;

      const { components } = buildTemplateComponents(template, payload);
      const tplPayload = { 
        name: template.name, 
        language: { code: template.language } 
      };
      if (components.length) tplPayload.components = components;
      body = { 
        messaging_product: "whatsapp", 
        to, 
        type: "template", 
        template: tplPayload 
      };
    } else if (payload.kind === "media") {
      const type = ["image", "document", "audio", "video"].includes(payload.type) ? payload.type : "image";
      body = {
        messaging_product: "whatsapp", 
        to, 
        type,
        [type]: { 
          link: required(payload.media_url, "Media URL"), 
          caption: String(payload.caption || "").slice(0, 1024) 
        },
      };
    } else {
      body = { 
        messaging_product: "whatsapp", 
        to, 
        type: "text", 
        text: { 
          preview_url: true, 
          body: required(payload.body, "Message").slice(0, 4096) 
        } 
      };
    }

    const { result, attempts } = await withRetry(async () => {
      return await graph(`/${account.phone_number_id}/messages`, token, {
        method: "POST",
        body: JSON.stringify(body),
      });
    });

    const providerMessageId = result.messages?.[0]?.id || null;
    const previewText = payload.body || payload.caption || `[${payload.kind || "text"}]`;
    const isTemplate = payload.kind === "template";
    const tplMeta = isTemplate
      ? { 
          name: body.template?.name, 
          language: body.template?.language?.code, 
          variables: Array.isArray(payload.variables) ? payload.variables : [] 
        }
      : null;

    const { conversation, contact } = await ensureOutboundConversation(account, to, previewText, tplMeta);

    const { data: insertedMsg } = await supabase.from("wa_messages").insert({
      conversation_id: conversation?.id || null,
      contact_id: contact?.id || null,
      phone_number_id: account.id,
      provider_message_id: providerMessageId,
      direction: "outbound",
      message_type: String(payload.kind || "text"),
      body: payload.body || payload.caption || null,
      template_name: isTemplate ? body.template?.name || null : null,
      template_language: isTemplate ? body.template?.language?.code || null : null,
      status: "sent",
      raw_payload: { 
        ...result, 
        sent_payload: body, 
        variables: isTemplate ? (Array.isArray(payload.variables) ? payload.variables : []) : undefined 
      },
      sent_at: new Date().toISOString(),
    }).select().single();

    await logSendAttempts(attempts, {
      stage: "send",
      kind: payload.kind || "text",
      phone_number_id: account.id,
      template_id: templateData?.id || null,
      template_name: templateData?.name || null,
      recipient_phone: to,
      message_id: insertedMsg?.id || null,
      provider_message_id: providerMessageId,
      request_payload: body,
    });

    return { success: true, result, messageId: insertedMsg?.id };
  } catch (error) {
    console.error("[sendMessage Action Error]", error);
    return { success: false, error: error.message };
  }
}
