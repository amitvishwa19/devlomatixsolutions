'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { symmetricEncrypt } from "@/lib/encryption";
import crypto from "crypto";

function generateApiKey() {
    return 'eco_' + crypto.randomBytes(24).toString('hex');
}

const CreateStore = z.object({
    workspaceId: z.string(),
    formData: z.object({
        name: z.string().min(1, "Name is required"),
        slug: z.string().min(1, "Slug is required"),
        description: z.string().optional(),
        platform: z.string().min(1, "Platform is required"),
        storeUrl: z.string().min(1, "Store URL is required"),
        logo: z.string().optional(),
        currency: z.string().optional(),
        timezone: z.string().optional(),
        accessToken: z.string().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
    }),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { error: "Unauthorized" };
        }

        const { workspaceId, formData } = data;
        const userId = session.user.userId;

        const existingDefault = await db.eCommerceStore.findFirst({
            where: { userId, isDefault: true }
        });

        const apiKey = generateApiKey();
        const encryptedApiKey = symmetricEncrypt(apiKey);

        const store = await db.eCommerceStore.create({
            data: {
                userId,
                name: formData.name,
                slug: formData.slug.toLowerCase().trim(),
                description: formData.description || null,
                platform: formData.platform,
                storeUrl: formData.storeUrl,
                logo: formData.logo || null,
                currency: formData.currency || "INR",
                timezone: formData.timezone || "Asia/Kolkata",
                isDefault: !existingDefault,
                accessToken: formData.accessToken || null,
                apiKey: formData.apiKey || encryptedApiKey,
                apiSecret: formData.apiSecret || null,
                status: "connected",
                metadata: {
                    apiKeyPublic: apiKey.substring(0, 12) + '...',
                    createdAt: new Date().toISOString()
                }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/settings`);
        return { data: { store, apiKey } };
    } catch (error) {
        console.error("[CREATE_STORE_ERROR]", error);
        return { error: error.message || "Failed to create store" };
    }
};

export const createStore = createSafeAction(CreateStore, handler);