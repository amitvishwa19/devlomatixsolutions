'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ManageInventory = z.object({
    id: z.string().optional(),
    serverId: z.string(),
    type: z.enum(["UPSERT", "STOCK_ADJUSTMENT"]),
    itemData: z.object({
        sku: z.string().optional(),
        name: z.string(),
        genericName: z.string().optional(),
        category: z.string().optional(),
        quantity: z.number().optional(),
        reorderLevel: z.number().optional(),
        unit: z.string().optional(),
        costPrice: z.number().optional(),
        sellingPrice: z.number().optional(),
        expiryDate: z.date().optional(),
        batchNumber: z.string().optional(),
    }).optional(),
    adjustment: z.object({
        type: z.enum(["IN", "OUT", "ADJUSTMENT", "RETURN"]),
        quantity: z.number(),
        notes: z.string().optional(),
        performedBy: z.string().optional(),
    }).optional(),
});

const handler = async (data) => {
    const { id, serverId, type, itemData, adjustment } = data;

    try {
        if (type === "UPSERT") {
            if (id) {
                const item = await db.inventoryItem.update({
                    where: { id },
                    data: itemData,
                });
                return { data: { item } };
            } else {
                const item = await db.inventoryItem.create({
                    data: { ...itemData, serverId },
                });
                return { data: { item } };
            }
        } else if (type === "STOCK_ADJUSTMENT" && id) {
            const currentItem = await db.inventoryItem.findUnique({ where: { id } });
            if (!currentItem) throw new Error("Item not found");

            const previousQty = currentItem.quantity;
            let newQty = previousQty;

            if (adjustment.type === "IN" || adjustment.type === "RETURN") {
                newQty += adjustment.quantity;
            } else if (adjustment.type === "OUT") {
                newQty -= adjustment.quantity;
            } else if (adjustment.type === "ADJUSTMENT") {
                newQty = adjustment.quantity; // Direct set for adjustment
            }

            const item = await db.inventoryItem.update({
                where: { id },
                data: { quantity: newQty },
            });

            await db.stockMovement.create({
                data: {
                    itemId: id,
                    type: adjustment.type,
                    quantity: adjustment.quantity,
                    previousQty,
                    newQty,
                    notes: adjustment.notes,
                    performedBy: adjustment.performedBy,
                },
            });

            revalidatePath(`/workspace/${serverId}/inventory`);
            revalidatePath(`/workspace/${serverId}/pharmacy`);
            return { data: { item } };
        }
    } catch (error) {
        console.error('Error managing inventory:', error);
        return { message: "Failed to manage inventory", error };
    }
};

export const manageInventory = createSafeAction(ManageInventory, handler);
