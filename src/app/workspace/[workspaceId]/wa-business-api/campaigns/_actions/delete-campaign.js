'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const DeleteCampaignSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const existing = await db.campaign.findUnique({
            where: { id, userId, platform: "WHATSAPP_BUSINESS" }
        });

        if (!existing) return { error: "Campaign not found" };

        await db.campaign.delete({
            where: { id, userId }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error("[DELETE_BUSINESS_CAMPAIGN_ERROR]", error);
        return { error: error.message || "Failed to delete campaign" };
    }
};

export const deleteCampaign = createSafeAction(DeleteCampaignSchema, handler);
