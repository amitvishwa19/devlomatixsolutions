import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricEncrypt } from "@/lib/encryption";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const { code } = body;

    const userId = searchParams.get("userId");
    
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/v5/konnectx/settings/oauth/callback`;

    if (!appId || !appSecret) {
      return NextResponse.json({ error: "Facebook App credentials not configured" }, { status: 500 });
    }

    const tokenUrl = `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${redirectUri}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json({ error: tokenData.error?.message || "Failed to exchange OAuth code" }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    const meRes = await fetch(`https://graph.facebook.com/v17.0/me?access_token=${accessToken}&fields=id,name`);
    const meData = await meRes.json();

    const encrypted = symmetricEncrypt(JSON.stringify({ accessToken, phoneNumberId: '', wabaId: '' }));

    await db.credentials.upsert({
      where: { userId_platform: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD' } },
      update: { profileName: meData.name || 'Facebook Account', credentials: encrypted, status: 'connected' },
      create: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', profileName: meData.name || 'Facebook Account', credentials: encrypted, status: 'connected' },
    });

    return NextResponse.json({ success: true, message: "WhatsApp Business account linked successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to process OAuth code" }, { status: 500 });
  }
}
