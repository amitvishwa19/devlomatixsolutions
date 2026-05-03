'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const GetStores = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { error: "Unauthorized" };
        }

        const { workspaceId } = data;
        const userId = session.user.userId;

        const stores = await db.eCommerceStore.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return { data: { stores } };
    } catch (error) {
        console.error("[GET_STORES_ERROR]", error);
        return { error: "Failed to fetch stores" };
    }
};

export const getStores = createSafeAction(GetStores, handler);