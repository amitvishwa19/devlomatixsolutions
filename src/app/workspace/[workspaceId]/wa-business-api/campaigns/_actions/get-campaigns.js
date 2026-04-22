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
                },
                recipients: {
                    select: { status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map counts for the UI logic
        const formattedCampaigns = campaigns.map(c => {
            const total = c._count.recipients;
            const sent = c.recipients.filter(r => r.status === 'SENT').length;
            const failed = c.recipients.filter(r => r.status === 'FAILED').length;
            
            // Remove recipients from the object to keep payload small
            const { recipients, _count, ...rest } = c;
            
            return {
                ...rest,
                total,
                success: sent,
                failed,
                sent,
                successRate: total > 0 ? Math.round((sent / total) * 100) : 0
            };
        });

        return { data: { campaigns: formattedCampaigns } };
    } catch (error) {
        console.error("[GET_BUSINESS_CAMPAIGNS_ERROR]", error);
        return { error: error.message || "Failed to fetch campaigns" };
    }
};

export const getCampaigns = createSafeAction(GetCampaignsSchema, handler);
