'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const UpdateStore = z.object({
    workspaceId: z.string(),
    storeId: z.string(),
    formData: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        platform: z.string().optional(),
        storeUrl: z.string().optional(),
        logo: z.string().optional(),
        currency: z.string().optional(),
        timezone: z.string().optional(),
        isDefault: z.boolean().optional(),
        accessToken: z.string().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        status: z.string().optional(),
    }),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { error: "Unauthorized" };
        }

        const { workspaceId, storeId, formData } = data;
        const userId = session.user.userId;

        const existingStore = await db.eCommerceStore.findFirst({
            where: { id: storeId, userId }
        });

        if (!existingStore) {
            return { error: "Store not found" };
        }

        if (formData.isDefault) {
            await db.eCommerceStore.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updateData = {};
        if (formData.name !== undefined) updateData.name = formData.name;
        if (formData.description !== undefined) updateData.description = formData.description || null;
        if (formData.platform !== undefined) updateData.platform = formData.platform;
        if (formData.storeUrl !== undefined) updateData.storeUrl = formData.storeUrl;
        if (formData.logo !== undefined) updateData.logo = formData.logo || null;
        if (formData.currency !== undefined) updateData.currency = formData.currency;
        if (formData.timezone !== undefined) updateData.timezone = formData.timezone;
        if (formData.isDefault !== undefined) updateData.isDefault = formData.isDefault;
        if (formData.accessToken !== undefined) updateData.accessToken = formData.accessToken || null;
        if (formData.apiKey !== undefined) updateData.apiKey = formData.apiKey || null;
        if (formData.apiSecret !== undefined) updateData.apiSecret = formData.apiSecret || null;
        if (formData.status !== undefined) updateData.status = formData.status;

        const store = await db.eCommerceStore.update({
            where: { id: storeId },
            data: updateData
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/settings`);
        return { data: { store } };
    } catch (error) {
        console.error("[UPDATE_STORE_ERROR]", error);
        return { error: error.message || "Failed to update store" };
    }
};

export const updateStore = createSafeAction(UpdateStore, handler);