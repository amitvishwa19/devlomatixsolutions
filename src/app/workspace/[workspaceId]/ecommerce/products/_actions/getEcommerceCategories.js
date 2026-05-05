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

        const categories = await db.category.findMany({
            where: {
                workspaceId,
                parentId: { not: null },
                storeId: { not: null }
            },
            orderBy: { name: 'asc' },
        });

        // Build hierarchical tree
        const catIds = new Set(categories.map(c => c.id));
        const catMap = {};
        categories.forEach(c => {
            catMap[c.id] = { ...c, children: [] };
        });

        const topLevel = [];
        categories.forEach(c => {
            if (!catIds.has(c.parentId)) {
                topLevel.push(catMap[c.id]);
            } else {
                if (catMap[c.parentId]) {
                    catMap[c.parentId].children.push(catMap[c.id]);
                }
            }
        });

        // Flatten with depth
        const flattenedCategories = [];
        const flatten = (cats, depth) => {
            cats.forEach(c => {
                const { children, ...rest } = c;
                flattenedCategories.push({ ...rest, depth, displayName: c.name });
                if (children.length > 0) {
                    flatten(children, depth + 1);
                }
            });
        };
        flatten(topLevel, 0);

        return { data: { categories: flattenedCategories } };
    } catch (error) {
        console.error("[GET_ECOMMERCE_CATEGORIES_ERROR]", error);
        return { error: "Failed to fetch categories" };
    }
};

export const getEcommerceCategories = createSafeAction(GetEcommerceCategories, handler);