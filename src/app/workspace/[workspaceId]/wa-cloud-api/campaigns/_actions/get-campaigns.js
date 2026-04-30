'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetCampaignsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            return { data: { campaigns: [] } };
        }

        const campaigns = await db.campaign.findMany({
            where: { 
                userId,
                credentialId: defaultCredential.id
            },
            include: {
                _count: {
                    select: { recipients: true }
                },
                recipients: {
                    where: { status: 'SENT' }
                },
                template: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = campaigns.map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            templateName: campaign.template?.name || 'Custom',
            messageTemplate: JSON.parse(JSON.stringify(campaign.messageTemplate || {})),
            total: Number(campaign._count.recipients),
            sent: Number(campaign.recipients.length),
            scheduledAt: campaign.scheduledAt ? campaign.scheduledAt.toISOString() : null,
            createdAt: campaign.createdAt.toISOString(),
            successRate: campaign._count.recipients > 0 ? Math.round((campaign.recipients.length / campaign._count.recipients) * 100) : 0
        }));

        return { data: { campaigns: JSON.parse(JSON.stringify(formatted)) } };
    } catch (error) {
        return { error: error.message || "Failed to fetch campaigns" };
    }
};

export const getCampaigns = createSafeAction(GetCampaignsSchema, handler);
