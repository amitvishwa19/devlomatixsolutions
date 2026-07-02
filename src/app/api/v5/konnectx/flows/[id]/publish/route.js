import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as cloudApi from "../../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const flow = await db.whatsAppFlow.findFirst({ where: { id, userId } });
    if (!flow) return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    if (!flow.flowId) return NextResponse.json({ error: "Flow must be pushed to Meta first" }, { status: 400 });

    const credential = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
    });

    if (!credential) return NextResponse.json({ error: "No default credential" }, { status: 400 });

    let cloudCreds = null;
    const stored = credential.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      cloudCreds = JSON.parse(symmetricDecrypt(stored));
    }
    if (cloudCreds?.enc) {
      cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
    }

    const result = await cloudApi.publishFlowMeta({ ...cloudCreds }, flow.flowId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await db.whatsAppFlow.update({ where: { id }, data: { status: 'PUBLISHED' } });

    return NextResponse.json({ success: true, message: "Flow published", data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to publish flow" }, { status: 500 });
  }
}
