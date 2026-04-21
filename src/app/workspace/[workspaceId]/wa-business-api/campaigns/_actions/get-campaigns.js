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

        const campaigns = await db.campaign.findMany({
            where: { 
                userId, 
                platform: "WHATSAPP_BUSINESS" 
            },
            include: {
                _count: {
                    select: { recipients: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map counts for the UI logic
        const formattedCampaigns = campaigns.map(c => ({
            ...c,
            total: c._count.recipients,
            sent: 0, // Placeholder
            successRate: 0 // Placeholder
        }));

        return { data: { campaigns: formattedCampaigns } };
    } catch (error) {
        console.error("[GET_BUSINESS_CAMPAIGNS_ERROR]", error);
        return { error: error.message || "Failed to fetch campaigns" };
    }
};

export const getCampaigns = createSafeAction(GetCampaignsSchema, handler);
