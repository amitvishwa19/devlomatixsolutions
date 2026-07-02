import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as cloudApi from "../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and message are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const credential = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
    });

    if (!credential) return NextResponse.json({ error: "No active credential" }, { status: 400 });

    let cloudCreds = null;
    const stored = credential.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      cloudCreds = JSON.parse(symmetricDecrypt(stored));
    }
    if (cloudCreds?.enc) {
      cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
    }

    const result = await cloudApi.sendTextMessage(cloudCreds, phone.replace(/\D/g, ''), message);

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to send quick message" }, { status: 500 });
  }
}
