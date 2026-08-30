import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as cloudApi from "../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, type, body: messageBody, template } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const credential = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
    });

    if (!credential) {
      return NextResponse.json({ error: "No default WhatsApp Cloud API credential" }, { status: 400 });
    }

    let cloudCreds = null;
    const stored = credential.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      cloudCreds = JSON.parse(symmetricDecrypt(stored));
    } else if (typeof stored === 'string') {
      cloudCreds = JSON.parse(stored);
    } else {
      cloudCreds = stored;
    }
    if (cloudCreds?.enc) {
      cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
    }

    let result;
    const cleanTo = to.replace(/\D/g, '');

    let storedText = messageBody || '';
    let storedMetadata = { type: type || 'text', phone_number_id: cloudCreds?.phoneNumberId || '' };

    if (type === 'template' && template) {
      result = await cloudApi.sendTemplateMessage(
        cloudCreds,
        cleanTo,
        template.name,
        template.language?.code || 'en_US',
        template.components || []
      );

      // Enrich stored message: interpolated preview text + templateName/media/header
      try {
        const dbTemplate = await db.messageTemplate.findFirst({
          where: {
            ...(userId && { userId }),
            OR: [{ name: template.name }, { templateName: template.name }]
          }
        });

        let previewText = `[Template: ${template.name}]`;
        let mediaUrl = '';

        if (dbTemplate?.body) {
          let fullText = dbTemplate.body || '';
          const bodyComp = template.components?.find((c) => c.type?.toLowerCase() === 'body');
          if (bodyComp?.parameters) {
            bodyComp.parameters.forEach((param, idx) => {
              fullText = fullText.replace(`{{${idx + 1}}}`, param.text || '');
            });
          }
          fullText = fullText.replace(/\{\{\d+\}\}/g, '').trim();
          if (fullText) previewText = fullText;

          const headerComp = template.components?.find((c) => c.type?.toLowerCase() === 'header');
          const mediaParam = headerComp?.parameters?.[0];
          if (mediaParam && ['image', 'video', 'document'].includes(mediaParam.type)) {
            mediaUrl = mediaParam[mediaParam.type]?.link || '';
          }
        }

        storedText = previewText;
        storedMetadata = {
          type: 'template',
          templateName: template.name,
          ...(mediaUrl && { mediaUrl }),
          originalPayload: { type: 'template', template },
          phone_number_id: cloudCreds?.phoneNumberId || ''
        };
      } catch (enrichErr) {
        console.error('[Chats Send] Template enrich failed:', enrichErr);
      }
    } else {
      result = await cloudApi.sendTextMessage(cloudCreds, cleanTo, messageBody || '');
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await db.whatsAppMessage.create({
      data: {
...(userId && { userId }),
        waId: result.data?.messages?.[0]?.id || `msg_${Date.now()}`,
        jid: cleanTo + '@s.whatsapp.net',
        text: storedText,
        fromMe: true,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        status: 'SENT',
        metadata: storedMetadata,
      },
    });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
