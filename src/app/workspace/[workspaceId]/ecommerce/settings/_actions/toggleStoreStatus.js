"use server"

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function toggleStoreStatus({ workspaceId, storeId, newStatus }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
        return { error: "Unauthorized" };
    }

    try {
        // Ensure the store belongs to the user
        const store = await db.eCommerceStore.findFirst({
            where: {
                id: storeId,
                userId: session.user.userId
            }
        });

        if (!store) {
            return { error: "Store not found or unauthorized" };
        }

        const updatedStore = await db.eCommerceStore.update({
            where: { id: storeId },
            data: { status: newStatus }
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/settings`);

        return { success: true, store: updatedStore };
    } catch (error) {
        console.error("[TOGGLE_STORE_STATUS_ERROR]", error);
        return { error: "Failed to update store status" };
    }
}
