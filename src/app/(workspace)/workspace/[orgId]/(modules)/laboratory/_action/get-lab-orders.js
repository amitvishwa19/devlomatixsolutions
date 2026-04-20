'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetLabOrders = z.object({
    serverId: z.string(),
});

const handler = async (data) => {
    const { serverId } = data;
    try {
        const orders = await db.labOrder.findMany({
            where: { serverId },
            include: {
                patient: true,
                requester: true,
                results: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return { data: { orders } };
    } catch (error) {
        console.error('Error fetching lab orders:', error);
        return { message: "Failed to fetch lab orders", error };
    }
};

export const getLabOrders = createSafeAction(GetLabOrders, handler);
