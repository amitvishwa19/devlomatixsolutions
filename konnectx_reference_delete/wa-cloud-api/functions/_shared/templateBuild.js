// Port of getTemplateHeaderDefinition / countTemplateTextVariables /
// getTemplateButtonsDefinition / isDynamicUrlButton / buildTemplateComponents
// from the edge function. Must produce byte-identical Meta payloads.

export function getTemplateHeaderDefinition(template) {
  const tplComponents = Array.isArray(template?.components) ? template.components : [];
  return tplComponents.find((c) => String(c?.type || "").toUpperCase() === "HEADER") || null;
}

export function countTemplateTextVariables(text) {
  if (typeof text !== "string") return 0;
  const matches = Array.from(text.matchAll(/\{\{\s*(\d+)\s*\}\}/g));
  return matches.reduce((max, match) => Math.max(max, Number(match[1] || 0)), 0);
}

export function getTemplateButtonsDefinition(template) {
  const tplComponents = Array.isArray(template?.components) ? template.components : [];
  return tplComponents.find((c) => String(c?.type || "").toUpperCase() === "BUTTONS") || null;
}

export function isDynamicUrlButton(button) {
  return String(button?.type || "").toUpperCase() === "URL" && /\{\{\s*1\s*\}\}/.test(String(button?.url || ""));
}

export function buildTemplateComponents(template, body) {
  const values = Array.isArray(body.variables) ? body.variables : [];
  const components = [];
  const headerDef = getTemplateHeaderDefinition(template);
  const buttonsDef = getTemplateButtonsDefinition(template);

  if (headerDef) {
    const fmt = String(headerDef.format || "TEXT").toUpperCase();
    const headerMediaUrl = typeof body.header_media_url === "string" ? body.header_media_url.trim() : "";
    const headerMediaId = typeof body.header_media_id === "string" ? body.header_media_id.trim() : "";
    if (fmt === "IMAGE" || fmt === "VIDEO" || fmt === "DOCUMENT") {
      if (!headerMediaUrl && !headerMediaId) {
        throw new Error(`Template "${template.name}" requires a ${fmt.toLowerCase()} header. Provide header_media_url or header_media_id.`);
      }
      const mediaKey = fmt.toLowerCase();
      const mediaObject = headerMediaId ? { id: headerMediaId } : { link: headerMediaUrl };
      components.push({ type: "header", parameters: [{ type: mediaKey, [mediaKey]: mediaObject }] });
    } else if (fmt === "TEXT") {
      const headerVarCount = countTemplateTextVariables(headerDef.text);
      if (headerVarCount > 0) {
        const headerValues = Array.isArray(body.header_variables) ? body.header_variables : [];
        if (headerValues.length < headerVarCount || headerValues.some((value) => String(value ?? "").trim() === "")) {
          throw new Error(`Template "${template.name}" requires ${headerVarCount} header variable${headerVarCount === 1 ? "" : "s"}.`);
        }
        components.push({
          type: "header",
          parameters: headerValues.slice(0, headerVarCount).map((text) => ({ type: "text", text: String(text).slice(0, 60) })),
        });
      }
    }
  }

  if (values.length) {
    components.push({
      type: "body",
      parameters: values.map((text) => ({ type: "text", text: String(text).slice(0, 512) })),
    });
  }

  if (buttonsDef?.buttons && Array.isArray(buttonsDef.buttons)) {
    const buttonPayloadValues = Array.isArray(body.button_payloads) ? body.button_payloads : [];
    const buttonUrlValues = Array.isArray(body.button_url_suffixes) ? body.button_url_suffixes : [];
    buttonsDef.buttons.forEach((button, index) => {
      const buttonType = String(button?.type || "").toUpperCase();
      if (buttonType === "QUICK_REPLY") {
        components.push({
          type: "button", sub_type: "quick_reply", index: String(index),
          parameters: [{ type: "payload", payload: String(buttonPayloadValues[index] || button.text || `button_${index + 1}`).slice(0, 128) }],
        });
        return;
      }
      if (buttonType === "FLOW") {
        const action = { flow_token: typeof body.flow_token === "string" && body.flow_token.trim() ? body.flow_token.trim().slice(0, 256) : "unused" };
        if (body.flow_action_data && typeof body.flow_action_data === "object" && !Array.isArray(body.flow_action_data)) {
          action.flow_action_data = body.flow_action_data;
        }
        components.push({ type: "button", sub_type: "flow", index: String(index), parameters: [{ type: "action", action }] });
        return;
      }
      if (buttonType === "URL" && isDynamicUrlButton(button)) {
        const suffix = String(buttonUrlValues[index] || "").trim();
        if (!suffix) throw new Error(`Template "${template.name}" requires a value for URL button ${index + 1}.`);
        components.push({
          type: "button", sub_type: "url", index: String(index),
          parameters: [{ type: "text", text: suffix.slice(0, 2000) }],
        });
      }
    });
  }

  return { components, values, headerDef, buttonsDef };
}

export async function ensureOutboundConversation(supabase, account, to, preview, templateMeta = null) {
  const { data: contact } = await supabase
    .from("wa_contacts")
    .upsert({ phone_number: to, name: to, source: "outbound", last_message_at: new Date().toISOString() }, { onConflict: "phone_number" })
    .select()
    .single();
  const { data: existing } = await supabase
    .from("wa_conversations")
    .select("metadata")
    .eq("phone_number_id", account.id)
    .eq("external_contact_phone", to)
    .maybeSingle();
  const baseMeta = (existing?.metadata && typeof existing.metadata === "object") ? existing.metadata : {};
  const nextMeta = templateMeta?.name
    ? { ...baseMeta, last_template: { name: templateMeta.name, language: templateMeta.language || null, variables: Array.isArray(templateMeta.variables) ? templateMeta.variables : [] } }
    : baseMeta;
  const { data: conversation } = await supabase
    .from("wa_conversations")
    .upsert(
      {
        phone_number_id: account.id,
        contact_id: contact?.id || null,
        external_contact_phone: to,
        last_message_preview: String(preview || "").slice(0, 500),
        last_message_at: new Date().toISOString(),
        metadata: nextMeta,
      },
      { onConflict: "phone_number_id,external_contact_phone" }
    )
    .select()
    .single();
  return { conversation, contact };
}