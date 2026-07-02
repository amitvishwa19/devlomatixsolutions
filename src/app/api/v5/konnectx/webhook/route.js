import { NextResponse } from "next/server";
import * as cloudApi from "../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || process.env.WA_WEBHOOK_VERIFY_TOKEN || 'devlomatix_wa_verify';

    const result = cloudApi.verifyWebhook(
      { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge },
      verifyToken
    );

    if (result.success) {
      return new NextResponse(result.challenge, { status: 200 });
    }

    return NextResponse.json({ error: result.error }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const parsed = cloudApi.parseIncomingMessage(body);
    if (!parsed) {
      return NextResponse.json({ status: "ignored" });
    }

    console.log("[WEBHOOK] Incoming message:", parsed);

    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[WEBHOOK] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
