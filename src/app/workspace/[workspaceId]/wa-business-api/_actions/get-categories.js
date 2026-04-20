'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetCategoriesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const categories = await db.category.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' }
        });

        return { data: categories };
    } catch (error) {
        console.error('[WA_BUSINESS_GET_CATEGORIES]', error);
        return { error: "Failed to fetch categories" };
    }
};

export const getCategories = createSafeAction(GetCategoriesSchema, handler);
