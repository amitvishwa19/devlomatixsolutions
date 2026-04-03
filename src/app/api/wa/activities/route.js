import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;

        // 1. Fetch Recent Activity from WhatsApp Messages
        const recentMessages = await db.whatsAppMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                jid: true,
                text: true,
                fromMe: true,
                status: true,
                createdAt: true,
                waId: true
            }
        });

        // 2. Fetch Recent Template Status Changes
        const templateActivities = await db.messageTemplate.findMany({
            where: { userId, updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            orderBy: { updatedAt: 'desc' },
            take: 5
        });

        // 3. Merge and Map to Activity Format
        const activities = [];

        recentMessages.forEach(msg => {
            if (!msg.fromMe) {
                activities.push({
                    id: `msg-${msg.id}`,
                    type: "message",
                    title: `New reply from ${msg.jid}`,
                    description: msg.text.substring(0, 50),
                    time: msg.createdAt,
                    status: 'unread'
                });
            } else if (msg.status === 'FAILED') {
                activities.push({
                    id: `fail-${msg.id}`,
                    type: "alert",
                    title: `Message delivery failed to ${msg.jid}`,
                    description: "Meta API error or invalid number.",
                    time: msg.createdAt,
                    status: 'error'
                });
            } else if (msg.status === 'READ') {
                 // Optional: Tracking read events in activity feed
            }
        });

        templateActivities.forEach(tmpl => {
            if (tmpl.status === 'APPROVED') {
                activities.push({
                    id: `tmpl-app-${tmpl.id}`,
                    type: "success",
                    title: `Template Approved: ${tmpl.name}`,
                    description: `Ready to send in ${tmpl.language}.`,
                    time: tmpl.updatedAt,
                    status: 'done'
                });
            } else if (tmpl.status === 'REJECTED') {
                activities.push({
                    id: `tmpl-rej-${tmpl.id}`,
                    type: "alert",
                    title: `Template Rejected: ${tmpl.name}`,
                    description: "Check Meta for policy violations.",
                    time: tmpl.updatedAt,
                    status: 'error'
                });
            }
        });

        // Sort by time
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({
            success: true,
            activities: activities.slice(0, 10) // Limit to top 10
        });

    } catch (error) {
        console.error("[WA_ACTIVITIES_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}
