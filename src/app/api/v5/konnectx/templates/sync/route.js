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

    if (!credential) return NextResponse.json({ error: "No default credential found" }, { status: 400 });

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

    const wabaId = cloudCreds?.wabaId;
    if (!wabaId) return NextResponse.json({ error: "Missing wabaId in credentials" }, { status: 400 });

    const result = await cloudApi.fetchTemplates({ ...cloudCreds, wabaId });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    const metaTemplates = result.data || [];
    let synced = 0;

    for (const mt of metaTemplates) {
      const existing = await db.messageTemplate.findFirst({
        where: { ...(userId && { userId }), templateName: mt.name }
      });

      if (!existing) {
        await db.messageTemplate.create({
          data: {
...(userId && { userId }),
            name: mt.name,
            templateName: mt.name,
            category: mt.category || 'UTILITY',
            language: mt.language || 'en_US',
            type: (mt.components?.find(c => c.type === 'HEADER')?.format || 'text').toLowerCase(),
            body: mt.components?.find(c => c.type === 'BODY')?.text || '',
            status: mt.status || 'APPROVED',
            platform: 'WHATSAPP_CLOUD',
          },
        });
        synced++;
      }
    }

    return NextResponse.json({ success: true, message: `Synced ${synced} new templates from Meta`, count: synced });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to sync templates" }, { status: 500 });
  }
}
