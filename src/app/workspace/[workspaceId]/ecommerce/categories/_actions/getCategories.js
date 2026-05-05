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

        const whereClause = { 
            workspaceId,
            parentId: { not: null }
        };
        if (storeId) {
            whereClause.storeId = storeId;
        }

        const categories = await db.category.findMany({
            where: whereClause,
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
