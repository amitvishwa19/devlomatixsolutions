import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const cred = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD' },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    if (!cred) return NextResponse.json({ error: "No credentials found" }, { status: 404 });

    let stored = cred.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      try {
        const decrypted = symmetricDecrypt(stored);
        stored = JSON.parse(decrypted);
      } catch (e) {
        return NextResponse.json({ error: 'Failed to decrypt credentials' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        accessToken: stored?.accessToken || '',
        phoneNumberId: stored?.phoneNumberId || '',
        wabaId: stored?.wabaId || '',
        profile: cred.profile || 'Default Account',
        isDefault: cred.isDefault,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch credentials" }, { status: 500 });
  }
}
