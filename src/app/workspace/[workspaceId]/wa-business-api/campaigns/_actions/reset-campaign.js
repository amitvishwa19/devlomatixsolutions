'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const ResetCampaignSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const campaign = await db.campaign.findFirst({
            where: { id, userId, platform: "WHATSAPP_BUSINESS" }
        });

        if (!campaign) return { error: "Campaign not found" };

        // Reset all recipients to PENDING and clear error logs
        await db.campaignRecipient.updateMany({
            where: { campaignId: id },
            data: { 
                status: 'PENDING',
                errorLog: null,
                sentAt: null
            }
        });

        // Set campaign status back to DRAFT or READY
        const updated = await db.campaign.update({
            where: { id },
            data: { status: 'DRAFT' }
        });

        return { data: { success: true, campaign: updated } };

    } catch (error) {
        console.error("[RESET_BUSINESS_CAMPAIGN_ERROR]", error);
        return { error: error.message || "Failed to reset campaign" };
    }
};

export const resetCampaign = createSafeAction(ResetCampaignSchema, handler);
