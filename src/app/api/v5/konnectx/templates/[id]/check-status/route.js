import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const template = await db.messageTemplate.findFirst({ where: { id, userId } });
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

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
    const templateIdToCheck = template.templateId;

    if (!templateIdToCheck) {
      return NextResponse.json({ error: "Template has not been submitted to Meta yet" }, { status: 400 });
    }

    const url = `https://graph.facebook.com/v25.0/${templateIdToCheck}?fields=id,name,status,quality_score`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${cloudCreds.accessToken}` }
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "Failed to check status" }, { status: 400 });
    }

    const newStatus = data.status || 'UNKNOWN';
    await db.messageTemplate.update({ where: { id }, data: { status: newStatus } });

    return NextResponse.json({ success: true, status: newStatus, qualityScore: data.quality_score });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to check template status" }, { status: 500 });
  }
}
