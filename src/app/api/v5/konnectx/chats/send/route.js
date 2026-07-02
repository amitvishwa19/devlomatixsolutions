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

    if (type === 'template' && template) {
      result = await cloudApi.sendTemplateMessage(
        cloudCreds,
        cleanTo,
        template.name,
        template.language?.code || 'en_US',
        template.components || []
      );
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
        text: messageBody || '',
        fromMe: true,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        status: 'SENT',
        metadata: { type: type || 'text', phone_number_id: cloudCreds?.phoneNumberId || '' },
      },
    });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
