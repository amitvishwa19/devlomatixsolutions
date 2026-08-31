import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import * as cloudApi from "../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";

async function resolveCloudCreds(userId) {
  const credential = await db.credentials.findFirst({
    where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
  });

  if (!credential) {
    return { error: "No default WhatsApp Cloud API credential" };
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

  if (!cloudCreds?.accessToken) {
    return { error: "Credential is missing an access token" };
  }

  return { cloudCreds };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const resolved = await resolveCloudCreds(userId);
    if (resolved.error) return NextResponse.json({ error: resolved.error }, { status: 400 });

    const result = await cloudApi.getWhatsAppBusinessProfile(resolved.cloudCreds);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to fetch business profile" }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch business profile" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const body = await request.json();
    const allow = ['about', 'address', 'description', 'email', 'websites', 'vertical'];
    const profileData = {};
    for (const key of allow) {
      if (body[key] !== undefined) profileData[key] = body[key];
    }

    if (Object.keys(profileData).length === 0) {
      return NextResponse.json({ error: "No profile fields provided" }, { status: 400 });
    }

    const resolved = await resolveCloudCreds(userId);
    if (resolved.error) return NextResponse.json({ error: resolved.error }, { status: 400 });

    const result = await cloudApi.updateWhatsAppBusinessProfile(resolved.cloudCreds, profileData);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to update business profile" }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update business profile" }, { status: 500 });
  }
}