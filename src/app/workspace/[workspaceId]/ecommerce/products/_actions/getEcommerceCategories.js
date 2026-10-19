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

        const ecommerceCategory = await db.category.findFirst({
            where: {
                workspaceId,
                OR: [
                    { name: { equals: "Ecommerce", mode: "insensitive" } },
                    { slug: "ecommerce" }
                ]
            }
        });

        if (!ecommerceCategory) {
            return { data: { categories: [] } };
        }

        const allCategories = await db.category.findMany({
            where: {
                workspaceId,
                parentId: { not: null },
                storeId: { not: null }
            },
            orderBy: { name: 'asc' },
        });

        const childrenMap = new Map();
        for (const cat of allCategories) {
            if (cat.parentId) {
                if (!childrenMap.has(cat.parentId)) {
                    childrenMap.set(cat.parentId, []);
                }
                childrenMap.get(cat.parentId).push(cat);
            }
        }

        const descendantIds = new Set();
        function collectDescendants(parentId) {
            const children = childrenMap.get(parentId) || [];
            for (const child of children) {
                descendantIds.add(child.id);
                collectDescendants(child.id);
            }
        }
        collectDescendants(ecommerceCategory.id);

        const categories = allCategories.filter(c => descendantIds.has(c.id));

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