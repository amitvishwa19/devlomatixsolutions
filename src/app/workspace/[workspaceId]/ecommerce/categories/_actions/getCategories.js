'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const GetCategories = z.object({
    workspaceId: z.string(),
    storeId: z.string().optional().nullable(),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized" };

        const { workspaceId, storeId } = data;

        // 1. Locate the root "Ecommerce" category in this workspace
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

        // 2. Query all categories in this workspace
        const allWorkspaceCats = await db.category.findMany({
            where: {
                workspaceId
            },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Collect only the subcategories that descend from the "Ecommerce" category
        const childrenMap = new Map();
        for (const cat of allWorkspaceCats) {
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

        let subCategories = allWorkspaceCats.filter(c => descendantIds.has(c.id));
        if (storeId) {
            subCategories = subCategories.filter(c => c.storeId === storeId);
        }

        const categories = subCategories;

        // Compute product count for each category
        const products = await db.eCommerceProduct.findMany({
            where: { userId: session.user.userId },
            select: { metadata: true }
        });

        const categoriesWithCount = categories.map(cat => {
            const count = products.filter(p => {
                const pCats = p.metadata?.category;
                if (Array.isArray(pCats)) return pCats.includes(cat.name);
                if (typeof pCats === 'string') return pCats === cat.name;
                return false;
            }).length;
            return { ...cat, productCount: count };
        });

        return { data: { categories: categoriesWithCount } };
    } catch (error) {
        console.error("[GET_CATEGORIES_ERROR]", error);
        return { error: "Failed to fetch categories" };
    }
};

export const getCategories = createSafeAction(GetCategories, handler);
