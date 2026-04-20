'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetStatsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
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

        // 6. Job Stats (Latest Batch)
        const latestJob = await db.whatsAppJob.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { logs: true }
                }
            }
        });

        // Calculate rates
        const successRate = sentMessages > 0 ? (((sentMessages - failedMessages) / sentMessages) * 100).toFixed(1) : 0;
        const readRate = sentMessages > 0 ? ((readMessages / sentMessages) * 100).toFixed(1) : 0;

        return {
            data: {
                stats: {
                    campaigns: {
                        total: Number(totalCampaigns),
                        active: Number(activeCampaigns)
                    },
                    messages: {
                        sent: Number(sentMessages),
                        read: Number(readMessages),
                        delivered: Number(deliveredMessages),
                        failed: Number(failedMessages),
                        successRate: String(successRate),
                        readRate: String(readRate)
                    },
                    contacts: {
                        total: Number(totalContacts)
                    },
                    templates: {
                        approved: Number(approvedTemplates),
                        pending: Number(pendingTemplates)
                    },
                    latestJob: latestJob ? {
                        id: latestJob.id,
                        status: latestJob.status,
                        total: Number(latestJob._count.logs),
                        completedAt: latestJob.completedAt ? new Date(latestJob.completedAt).toISOString() : null
                    } : null
                }
            }
        };

    } catch (error) {
        return { error: error.message || "Failed to fetch stats" };
    }
};

export const getStats = createSafeAction(GetStatsSchema, handler);
