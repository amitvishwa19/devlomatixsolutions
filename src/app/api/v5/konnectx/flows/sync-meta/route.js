import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as cloudApi from "../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

export async function POST(request) {
  try {
    const body = await request.json();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

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

    const result = await cloudApi.fetchFlowsMeta({ ...cloudCreds, wabaId });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const metaFlows = result.data || [];
    let synced = 0;

    for (const mf of metaFlows) {
      const existing = await db.whatsAppFlow.findFirst({
        where: { ...(userId && { userId }), flowId: mf.id }
      });

      if (!existing) {
        await db.whatsAppFlow.create({
          data: {
...(userId && { userId }),
            name: mf.name,
            flowId: mf.id,
            categories: mf.categories || [],
            status: mf.status || 'DRAFT',
            screens: [],
          },
        });
        synced++;
      }
    }

    return NextResponse.json({ success: true, message: `Synced ${synced} flows from Meta`, count: synced });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to sync flows" }, { status: 500 });
  }
}
