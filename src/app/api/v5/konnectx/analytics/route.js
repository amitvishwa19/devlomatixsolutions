import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");

    const userId = searchParams.get("userId");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalMessages = await db.whatsAppMessage.count({ where: { ...(userId && { userId }), createdAt: { gte: since } } });
    const sentMessages = await db.whatsAppMessage.count({ where: { ...(userId && { userId }), fromMe: true, createdAt: { gte: since } } });
    const receivedMessages = await db.whatsAppMessage.count({ where: { ...(userId && { userId }), fromMe: false, createdAt: { gte: since } } });
    const failedMessages = await db.whatsAppMessage.count({ where: { ...(userId && { userId }), status: 'FAILED', createdAt: { gte: since } } });

    const messagesByDay = await db.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM whats_app_messages
      WHERE user_id = ${userId} AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const campaignsCompleted = await db.campaign.count({ where: { ...(userId && { userId }), status: 'COMPLETED', createdAt: { gte: since } } });

    return NextResponse.json({
      data: {
        summary: { totalMessages, sentMessages, receivedMessages, failedMessages, successRate: totalMessages > 0 ? ((totalMessages - failedMessages) / totalMessages * 100).toFixed(1) : 0 },
        messagesByDay: messagesByDay || [],
        campaignsCompleted,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
