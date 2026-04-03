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

        // 1. Fetch Campaign Stats
        const totalCampaigns = await db.campaign.count({ where: { userId } });
        const activeCampaigns = await db.campaign.count({ where: { userId, status: 'active' } });

        // 2. Message Stats (Last 30 Days)
        const sentMessages = await db.whatsAppMessage.count({
            where: { userId, fromMe: true }
        });

        // 3. Status Breakdown
        const readMessages = await db.whatsAppMessage.count({
            where: { userId, status: 'READ', fromMe: true }
        });

        const failedMessages = await db.whatsAppMessage.count({
            where: { userId, status: 'FAILED', fromMe: true }
        });

        const deliveredMessages = await db.whatsAppMessage.count({
            where: { userId, status: 'DELIVERED', fromMe: true }
        });

        // 4. Contact Stats
        const totalContacts = await db.contact.count({ where: { userId } });

        // 5. Template Stats
        const approvedTemplates = await db.messageTemplate.count({
            where: { userId, status: 'APPROVED' }
        });

        const pendingTemplates = await db.messageTemplate.count({
            where: { userId, status: 'PENDING_APPROVAL' }
        });

        // Calculate rates
        const successRate = sentMessages > 0 ? (((sentMessages - failedMessages) / sentMessages) * 100).toFixed(1) : 0;
        const readRate = sentMessages > 0 ? ((readMessages / sentMessages) * 100).toFixed(1) : 0;

        return NextResponse.json({
            success: true,
            stats: {
                campaigns: {
                    total: totalCampaigns,
                    active: activeCampaigns
                },
                messages: {
                    sent: sentMessages,
                    read: readMessages,
                    delivered: deliveredMessages,
                    failed: failedMessages,
                    successRate,
                    readRate
                },
                contacts: {
                    total: totalContacts
                },
                templates: {
                    approved: approvedTemplates,
                    pending: pendingTemplates
                }
            }
        });

    } catch (error) {
        console.error("[WA_STATS_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
