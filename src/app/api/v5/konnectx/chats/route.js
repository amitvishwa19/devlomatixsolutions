import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const [messages, templates] = await Promise.all([
      db.whatsAppMessage.findMany({
        where: { ...(userId && { userId }) },
        orderBy: { timestamp: 'desc' },
        take: 200,
      }),
      db.messageTemplate.findMany({
        select: {
          id: true,
          name: true,
          templateName: true,
          type: true,
          header: true,
          body: true,
          footer: true,
          buttons: true,
          metadata: true,
        }
      }).catch(() => [])
    ]);

    const templateMap = new Map();
    (templates || []).forEach((t) => {
      if (t.name) templateMap.set(t.name.toLowerCase().trim(), t);
      if (t.templateName) templateMap.set(t.templateName.toLowerCase().trim(), t);
    });

    const conversationMap = new Map();

    for (const msg of messages) {
      const cleanPhone = msg.jid.replace(/\D/g, '').split('@')[0];
      const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
      const fullJid = cleanPhone.length === 10 ? `91${cleanPhone}@s.whatsapp.net` : `${cleanPhone}@s.whatsapp.net`;

      let meta = msg.metadata;
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
      }
      meta = meta || {};

      let msgText = msg.text || '';
      let templateDef = null;

      const isTemplate =
        meta.type === 'template' ||
        meta.type === 'TEMPLATE' ||
        Boolean(meta.templateName) ||
        Boolean(meta.originalPayload?.template?.name) ||
        (typeof msg.text === 'string' && msg.text.startsWith('[Template:'));

      if (isTemplate) {
        const templateName =
          meta.templateName ||
          meta.originalPayload?.template?.name ||
          meta.originalPayload?.name ||
          (typeof msg.text === 'string' && msg.text.startsWith('[Template:')
            ? msg.text.split('[Template:')[1]?.split(']')[0]?.trim()
            : null);

        if (templateName) {
          const tpl = templateMap.get(templateName.toLowerCase().trim());
          if (tpl) {
            templateDef = tpl;
            let bodyText = tpl.body || '';
            const payloadComponents =
              meta.originalPayload?.template?.components ||
              meta.originalPayload?.components ||
              meta.components ||
              [];
            const bodyComp = payloadComponents.find(
              (c) => (c.type || '').toLowerCase() === 'body'
            );
            const params = bodyComp?.parameters || meta.parameters || meta.vars || [];

            if (Array.isArray(params)) {
              params.forEach((p, idx) => {
                const val = typeof p === 'object' ? p.text || p.value || '' : String(p || '');
                if (val) {
                  bodyText = bodyText.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val);
                }
              });
            }

            if (meta.candidateName) bodyText = bodyText.replace(/\{\{1\}\}/g, meta.candidateName).replace(/\{\{name\}\}/gi, meta.candidateName);
            if (meta.jobTitle) bodyText = bodyText.replace(/\{\{2\}\}/g, meta.jobTitle).replace(/\{\{jobTitle\}\}/gi, meta.jobTitle);
            if (meta.companyName) bodyText = bodyText.replace(/\{\{3\}\}/g, meta.companyName).replace(/\{\{companyName\}\}/gi, meta.companyName);

            bodyText = bodyText.replace(/\{\{\d+\}\}/g, '').trim();

            if (bodyText) {
              msgText = bodyText;
            }
          }
        }

        if ((!msgText || msgText.startsWith('[Template:')) && typeof msg.text === 'string') {
          const clean = msg.text.replace(/^\[Template:[^\]]+\]\s*/, '').trim();
          if (clean) msgText = clean;
        }
      }

      if (!conversationMap.has(last10)) {
        const contact = await db.contact.findFirst({
          where: { phone: { contains: last10 }, ...(userId && { userId }) },
          select: { name: true },
        });

        conversationMap.set(last10, {
          jid: fullJid,
          name: contact?.name || cleanPhone,
          messages: [],
          timestamp: Number(msg.timestamp),
          lastMessage: msgText,
          fromMe: msg.fromMe,
        });
      } else {
        if (cleanPhone.length > 10) {
          conversationMap.get(last10).jid = fullJid;
        }
      }

      conversationMap.get(last10).messages.push({
        id: msg.id,
        waId: msg.waId,
        text: msgText,
        fromMe: msg.fromMe,
        timestamp: Number(msg.timestamp),
        status: msg.status,
        metadata: {
          ...meta,
          ...(isTemplate && {
            type: 'template',
            templateDefinition: templateDef || meta.templateDefinition,
          }),
        },
      });
    }

    const conversations = Array.from(conversationMap.values())
      .map(c => ({
        ...c,
        messages: c.messages.sort((a, b) => b.timestamp - a.timestamp),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ data: { conversations } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch conversations" }, { status: 500 });
  }
}
