'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const DeleteCategorySchema = z.object({
    id: z.string(),
});

const handler = async (data) => {
    const { id } = data;

    try {
        await db.category.delete({
            where: { id }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error('Action Error (deleteCategory):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const deleteCategory = createSafeAction(DeleteCategorySchema, handler);
