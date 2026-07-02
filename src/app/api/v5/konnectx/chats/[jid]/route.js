import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");
    const jid = decodeURIComponent(params.jid);

    const userId = searchParams.get("userId");

    const where = { userId, jid };
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
    const { searchParams } = new URL(request.url);
        const jid = decodeURIComponent(params.jid);

    const userId = searchParams.get("userId");

    const result = await db.whatsAppMessage.deleteMany({ where: { ...(userId && { userId }), jid } });

    return NextResponse.json({ success: true, message: `Deleted ${result.count} messages` });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete conversation" }, { status: 500 });
  }
}
