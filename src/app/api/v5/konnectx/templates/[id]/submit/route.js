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
    if (!wabaId) return NextResponse.json({ error: "Missing wabaId" }, { status: 400 });

    const components = [
      { type: 'BODY', text: template.body },
    ];

    if (template.footer) {
      components.push({ type: 'FOOTER', text: template.footer });
    }

    const url = `https://graph.facebook.com/v25.0/${wabaId}/message_templates`;
    const payload = {
      name: template.templateName || template.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      language: template.language || 'en_US',
      category: template.category || 'UTILITY',
      components,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cloudCreds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "Failed to submit template" }, { status: 400 });
    }

    await db.messageTemplate.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL', templateId: data.id },
    });

    return NextResponse.json({ success: true, message: "Template submitted for review", templateId: data.id });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to submit template" }, { status: 500 });
  }
}
