import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const messages = await db.whatsAppMessage.findMany({
      where: { ...(userId && { userId }) },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    const conversationMap = new Map();

    for (const msg of messages) {
      const jid = msg.jid;
      if (!conversationMap.has(jid)) {
        const contact = await db.contact.findFirst({
          where: { phone: { contains: jid.split('@')[0] }, userId },
          select: { name: true },
        });

        conversationMap.set(jid, {
          jid,
          name: contact?.name || jid.split('@')[0],
          messages: [],
          timestamp: Number(msg.timestamp),
          lastMessage: msg.text,
          fromMe: msg.fromMe,
        });
      }

      conversationMap.get(jid).messages.push({
        id: msg.id,
        waId: msg.waId,
        text: msg.text,
        fromMe: msg.fromMe,
        timestamp: Number(msg.timestamp),
        status: msg.status,
        metadata: msg.metadata,
      });
    }

    const conversations = Array.from(conversationMap.values())
      .map(c => ({
        ...c,
        messages: c.messages.sort((a, b) => b.timestamp - a.timestamp),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ data: { conversations } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch conversations" }, { status: 500 });
  }
}
