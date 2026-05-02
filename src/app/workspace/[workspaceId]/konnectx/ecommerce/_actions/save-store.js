'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveStoreSchema = z.object({
    workspaceId: z.string(),
    name: z.string(),
    platform: z.enum(['shopify', 'woocommerce']),
    storeUrl: z.string(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, name, platform, storeUrl, apiKey, apiSecret, accessToken } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const store = await db.eCommerceStore.create({
            data: {
                userId,
                name,
                platform,
                storeUrl,
                apiKey,
                apiSecret,
                accessToken,
                status: "connected"
            }
        });

        return { success: true, store };
    } catch (error) {
        return { error: error.message || "Failed to save store" };
    }
};

export const saveStore = createSafeAction(SaveStoreSchema, handler);
