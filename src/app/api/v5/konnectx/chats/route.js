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
      const cleanPhone = msg.jid.replace(/\D/g, '').split('@')[0];
      const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
      const fullJid = cleanPhone.length === 10 ? `91${cleanPhone}@s.whatsapp.net` : `${cleanPhone}@s.whatsapp.net`;

      if (!conversationMap.has(last10)) {
        const contact = await db.contact.findFirst({
          where: { phone: { contains: last10 }, ...(userId && { userId }) },
          select: { name: true },
        });

        conversationMap.set(last10, {
          jid: fullJid,
          name: contact?.name || cleanPhone,
          messages: [],
          timestamp: Number(msg.timestamp),
          lastMessage: msg.text,
          fromMe: msg.fromMe,
        });
      } else {
        if (cleanPhone.length > 10) {
          conversationMap.get(last10).jid = fullJid;
        }
      }

      conversationMap.get(last10).messages.push({
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
