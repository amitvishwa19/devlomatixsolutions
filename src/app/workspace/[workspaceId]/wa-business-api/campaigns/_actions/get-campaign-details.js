'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetCampaignDetailsSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const campaign = await db.campaign.findUnique({
            where: { id, userId, platform: "WHATSAPP_BUSINESS" },
            include: {
                recipients: true
            }
        });

        if (!campaign) return { error: "Campaign not found" };

        return { data: { campaign } };
    } catch (error) {
        console.error("[GET_BUSINESS_CAMPAIGN_DETAILS_ERROR]", error);
        return { error: error.message || "Failed to fetch campaign details" };
    }
};

export const getCampaignDetails = createSafeAction(GetCampaignDetailsSchema, handler);
