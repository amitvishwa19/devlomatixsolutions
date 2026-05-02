'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const ToggleCampaignStatusSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
    status: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id, status } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const updated = await db.campaign.update({
            where: { id, userId },
            data: { status }
        });

        return { success: true, campaign: updated };
    } catch (error) {
        return { error: error.message || "Failed to toggle status" };
    }
};

export const toggleCampaignStatus = createSafeAction(ToggleCampaignStatusSchema, handler);
