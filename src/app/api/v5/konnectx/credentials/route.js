import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricEncrypt } from "@/lib/encryption";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const credentials = await db.credentials.findMany({
      where: { ...(userId && { userId }), platform: { in: ['WHATSAPP', 'WHATSAPP_CLOUD'] } },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ data: { success: true, credentials: JSON.parse(JSON.stringify(credentials)) } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch credentials" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const { profileName, credentials } = body;

        if (!profileName || !credentials?.accessToken) return NextResponse.json({ error: "profileName and credentials.accessToken are required" }, { status: 400 });

    const userId = searchParams.get("userId");
    
    const encrypted = symmetricEncrypt(JSON.stringify(credentials));

    const account = await db.credentials.upsert({
      where: { userId_platform: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD' } },
      update: { profileName, credentials: encrypted, status: 'connected' },
      create: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', profileName, credentials: encrypted, status: 'connected' }
    });

    return NextResponse.json({ success: true, accountId: account.id });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to save cloud credentials" }, { status: 500 });
  }
}
