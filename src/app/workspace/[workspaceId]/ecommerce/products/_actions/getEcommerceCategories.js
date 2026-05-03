'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";

const GetEcommerceCategories = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    try {
        const { workspaceId } = data;

        const ecommerceParent = await db.category.findFirst({
            where: {
                workspaceId,
                slug: {
                    equals: "ecommerce",
                    mode: "insensitive",
                },
            },
        });

        if (!ecommerceParent) {
            return { data: { categories: [] } };
        }

        const categories = await db.category.findMany({
            where: {
                workspaceId,
                parentId: ecommerceParent.id,
            },
            orderBy: { name: 'asc' },
            include: {
                children: {
                    orderBy: { name: 'asc' },
                },
            },
        });

        return { data: { categories } };
    } catch (error) {
        console.error("[GET_ECOMMERCE_CATEGORIES_ERROR]", error);
        return { error: "Failed to fetch categories" };
    }
};

export const getEcommerceCategories = createSafeAction(GetEcommerceCategories, handler);