'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetStoresSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const stores = await db.eCommerceStore.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { orders: true, products: true, abandonedCarts: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, stores };
    } catch (error) {
        return { error: error.message || "Failed to fetch stores" };
    }
};

export const getStores = createSafeAction(GetStoresSchema, handler);
