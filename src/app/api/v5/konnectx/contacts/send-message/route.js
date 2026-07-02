import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as cloudApi from "../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";

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
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isActive: true }
    });

    if (!credential) return NextResponse.json({ error: "No active WhatsApp Cloud API credential found" }, { status: 400 });

    const result = await cloudApi.sendTextMessage(credential, phone.replace(/\D/g, ''), message);

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
