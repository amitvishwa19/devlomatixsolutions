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

    const wabaId = cloudCreds?.wabaId;
    if (!wabaId) return NextResponse.json({ error: "Missing wabaId" }, { status: 400 });

    let metaResult;
    if (flow.flowId) {
      metaResult = await cloudApi.updateFlowAssetMeta({ ...cloudCreds, wabaId }, flow.flowId, flow.definition || flow.screens);
    } else {
      metaResult = await cloudApi.createFlowMeta({ ...cloudCreds, wabaId }, flow.name, flow.categories);
      if (metaResult.success && metaResult.data?.id) {
        await db.whatsAppFlow.update({ where: { id }, data: { flowId: metaResult.data.id } });
        await cloudApi.updateFlowAssetMeta({ ...cloudCreds, wabaId }, metaResult.data.id, flow.definition || flow.screens);
      }
    }

    if (!metaResult.success) {
      return NextResponse.json({ error: metaResult.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Flow pushed to Meta", data: metaResult.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to push flow" }, { status: 500 });
  }
}
