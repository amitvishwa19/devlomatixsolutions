'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetCategoriesSchema = z.object({
    workspaceId: z.string(),
    type: z.enum(['CONTACT', 'TAG', 'GENERAL']).default('CONTACT'),
});

const handler = async (data) => {
    const { workspaceId, type } = data;

    try {
        const categories = await db.category.findMany({
            where: { 
                workspaceId,
                type: type.toUpperCase()
            },
            orderBy: { name: 'asc' }
        });

        return { data: categories };
    } catch (error) {
        console.error('Action Error (getCategories):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const getCategories = createSafeAction(GetCategoriesSchema, handler);
