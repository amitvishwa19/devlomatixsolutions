import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const credential = await db.credentials.findFirst({ where: { id, userId } });
    if (!credential) return NextResponse.json({ error: "Credential not found" }, { status: 404 });

    await db.credentials.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Credential deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete credential" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const { id } = params;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const body = await request.url ? await request.json() : {};
    const { isDefault } = body;

    if (isDefault) {
      await db.credentials.updateMany({
        where: { userId, platform: 'WHATSAPP_CLOUD' },
        data: { isDefault: false }
      });

      const account = await db.credentials.update({
        where: { id, userId },
        data: { isDefault: true }
      });

      return NextResponse.json({ success: true, credentialId: account.id });
    }

    return NextResponse.json({ error: "Only isDefault: true is supported" }, { status: 400 });
  } catch (error) {
    console.error("PATCH credentials error:", error);
    return NextResponse.json({ error: error.message || "Failed to update default credential" }, { status: 500 });
  }
}
