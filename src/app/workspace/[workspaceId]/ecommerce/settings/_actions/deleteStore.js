'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const DeleteStore = z.object({
    workspaceId: z.string(),
    storeId: z.string(),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { error: "Unauthorized" };
        }

        const { workspaceId, storeId } = data;
        const userId = session.user.userId;
        console.log("[DELETE_STORE] storeId:", storeId, "userId:", userId);

        const existingStore = await db.eCommerceStore.findFirst({
            where: { id: storeId, userId }
        });

        if (!existingStore) {
            return { error: "Store not found" };
        }

        await db.eCommerceStore.delete({
            where: { id: storeId }
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/settings`);
        return { data: { message: "Store deleted" } };
    } catch (error) {
        console.error("[DELETE_STORE_ERROR]", error);
        return { error: error.message || "Failed to delete store" };
    }
};

export const deleteStore = createSafeAction(DeleteStore, handler);