import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { jid: rawJid } = await params;
    const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");
    const jid = decodeURIComponent(rawJid);
    const cleanPhone = jid.replace(/\D/g, '').split('@')[0];
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    const userId = searchParams.get("userId");

    const where = { ...(userId && { userId }), jid: { contains: last10 } };
    if (before) {
      where.timestamp = { lt: BigInt(before) };
    }

    const messages = await db.whatsAppMessage.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      data: {
        messages: messages.map(m => ({
          ...m,
          timestamp: m.timestamp.toString(),
        })).reverse(),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { jid: rawJid } = await params;
    const { searchParams } = new URL(request.url);
    const jid = decodeURIComponent(rawJid);
    const cleanPhone = jid.replace(/\D/g, '').split('@')[0];
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    const userId = searchParams.get("userId");

    const result = await db.whatsAppMessage.deleteMany({ where: { ...(userId && { userId }), jid: { contains: last10 } } });

    return NextResponse.json({ success: true, message: `Deleted ${result.count} messages` });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete conversation" }, { status: 500 });
  }
}
