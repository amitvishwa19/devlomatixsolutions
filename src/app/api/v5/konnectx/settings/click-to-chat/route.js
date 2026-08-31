import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import * as cloudApi from "../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";

export async function GET(request) {
  try {
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

    const result = await cloudApi.testCloudConnection(cloudCreds);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to verify WhatsApp number" }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch click-to-chat info" }, { status: 500 });
  }
}