'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetInventory = z.object({
    serverId: z.string(),
});

const handler = async (data) => {
    const { serverId } = data;
    try {
        const items = await db.inventoryItem.findMany({
            where: { serverId },
            include: {
                movements: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        return { data: { items } };
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return { message: "Failed to fetch inventory", error };
    }
};

export const getInventory = createSafeAction(GetInventory, handler);
