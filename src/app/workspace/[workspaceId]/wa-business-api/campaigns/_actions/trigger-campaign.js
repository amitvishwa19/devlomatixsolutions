'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { campaignEngine } from "../../_lib/campaign-engine";

const TriggerCampaignSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
    action: z.enum(['start', 'stop']),
});

const handler = async (data) => {
    const { workspaceId, id, action } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const campaign = await db.campaign.findFirst({
            where: { id, userId, platform: "WHATSAPP_BUSINESS" }
        });

        if (!campaign) return { error: "Campaign not found" };

        if (action === 'start') {
            await campaignEngine.startCampaign(id, userId);
            return { data: { message: "Campaign broadcast started." } };
        } else {
            await campaignEngine.stopCampaign(id);
            return { data: { message: "Campaign broadcast paused." } };
        }

    } catch (error) {
        console.error("[TRIGGER_BUSINESS_CAMPAIGN_ERROR]", error);
        return { error: error.message || "Failed to trigger campaign" };
    }
};

export const triggerCampaign = createSafeAction(TriggerCampaignSchema, handler);
