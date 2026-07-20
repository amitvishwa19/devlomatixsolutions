'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const ResetCampaignSchema = z.object({
    workspaceId: z.string(),
    id: z.string()
});

const handler = async (data) => {
    const { workspaceId, id } = data;
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const campaign = await db.campaign.findUnique({ where: { id, userId } });
        if (!campaign) return { error: "Campaign not found" };

        if (campaign.status === 'RUNNING' || campaign.status === 'QUEUED') {
            return { error: "Cannot reset a running campaign. Please pause it first." };
        }

        const updated = await db.campaign.update({
            where: { id },
            data: {
                status: 'DRAFT'
            }
        });

        await db.campaignRecipient.updateMany({
            where: { campaignId: id },
            data: {
                status: 'PENDING',
                errorLog: null,
                sentAt: null
            }
        });

        return { success: true, message: "Campaign reset to DRAFT successfully" };
    } catch (error) {
        console.error("Reset Campaign Error:", error);
        return { error: error.message || "Failed to reset campaign" };
    }
};

export const resetCampaign = createSafeAction(ResetCampaignSchema, handler);
