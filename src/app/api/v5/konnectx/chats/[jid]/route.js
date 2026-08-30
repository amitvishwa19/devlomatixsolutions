import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { jid: rawJid } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");
    const jid = decodeURIComponent(rawJid);
    const cleanPhone = jid.replace(/\D/g, '').split('@')[0];
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    const userId = searchParams.get("userId");

    const where = { ...(userId && { userId }), jid: { contains: last10 } };
    if (before) {
      where.timestamp = { lt: BigInt(before) };
    }

    const [messages, templates] = await Promise.all([
      db.whatsAppMessage.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
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

    const enrichedMessages = messages.map((m) => {
      let meta = m.metadata;
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
      }
      meta = meta || {};

      const isTemplate =
        meta.type === 'template' ||
        meta.type === 'TEMPLATE' ||
        Boolean(meta.templateName) ||
        Boolean(meta.originalPayload?.template?.name) ||
        (typeof m.text === 'string' && m.text.startsWith('[Template:'));

      if (!isTemplate) {
        return {
          ...m,
          metadata: meta,
          timestamp: m.timestamp.toString(),
        };
      }

      const templateName =
        meta.templateName ||
        meta.originalPayload?.template?.name ||
        meta.originalPayload?.name ||
        (typeof m.text === 'string' && m.text.startsWith('[Template:')
          ? m.text.split('[Template:')[1]?.split(']')[0]?.trim()
          : null);

      let fullText = m.text || '';
      let templateDef = null;

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
            fullText = bodyText;
          }
        }
      }

      if ((!fullText || fullText.startsWith('[Template:')) && typeof m.text === 'string') {
        const clean = m.text.replace(/^\[Template:[^\]]+\]\s*/, '').trim();
        if (clean) fullText = clean;
      }

      return {
        ...m,
        text: fullText || m.text,
        timestamp: m.timestamp.toString(),
        metadata: {
          ...meta,
          type: 'template',
          templateName: templateName || meta.templateName,
          templateDefinition: templateDef || meta.templateDefinition,
        },
      };
    }).reverse();

    return NextResponse.json({
      data: {
        messages: enrichedMessages,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { jid: rawJid } = await params;
    const { searchParams } = new URL(request.url);
    const jid = decodeURIComponent(rawJid);
    const cleanPhone = jid.replace(/\D/g, '').split('@')[0];
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    const userId = searchParams.get("userId");

    const result = await db.whatsAppMessage.deleteMany({ where: { ...(userId && { userId }), jid: { contains: last10 } } });

    return NextResponse.json({ success: true, message: `Deleted ${result.count} messages` });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete conversation" }, { status: 500 });
  }
}
