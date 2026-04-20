'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { campaignEngine } from '../../_lib/campaign-engine';

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

        // Verify ownership
        const campaign = await db.campaign.findUnique({
            where: { id, userId }
        });

        if (!campaign) return { error: "Campaign not found" };

        if (action === 'start') {
            // Trigger engine (non-blocking)
            campaignEngine.startCampaign(id, userId).catch(err => {
                console.error(`[StartAction] Background error for campaign ${id}:`, err);
            });
            return { success: true, message: 'Campaign started' };
        } else {
            // Trigger engine stop
            await campaignEngine.stopCampaign(id);
            return { success: true, message: 'Campaign paused' };
        }
    } catch (error) {
        return { error: error.message || "Failed to trigger campaign" };
    }
};

export const triggerCampaign = createSafeAction(TriggerCampaignSchema, handler);
