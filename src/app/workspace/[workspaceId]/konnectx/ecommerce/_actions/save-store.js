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

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const store = await db.eCommerceStore.create({
            data: {
                userId,
                name,
                slug,
                platform,
                storeUrl,
                apiKey,
                apiSecret,
                accessToken,
                status: "connected"
            }
        });

        try {
            const category = await db.category.create({
                data: {
                    name: name,
                    slug: `${slug}-category`,
                    type: "GENERAL",
                    color: "#3b82f6",
                    workspaceId,
                    storeId: store.id
                }
            });
            return { success: true, store, category };
        } catch (catError) {
            console.error("Category creation error:", catError);
            return { success: true, store, categoryError: catError.message };
        }
    } catch (error) {
        console.error("Store creation error:", error);
        return { error: error.message || "Failed to save store" };
    }
};

export const saveStore = createSafeAction(SaveStoreSchema, handler);
