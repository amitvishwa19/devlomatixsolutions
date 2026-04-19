'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const DeleteGroupSchema = z.object({
    id: z.string(),
    userId: z.string(),
});

const handler = async (data) => {
    const { id, userId } = data;

    try {
        await db.contactGroup.delete({
            where: { id, userId }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error('Action Error (deleteGroup):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const deleteGroup = createSafeAction(DeleteGroupSchema, handler);
