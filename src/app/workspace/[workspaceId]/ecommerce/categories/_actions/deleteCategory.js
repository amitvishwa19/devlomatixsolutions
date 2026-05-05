'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const DeleteCategory = z.object({
    workspaceId: z.string(),
    categoryId: z.string(),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized" };

        const { workspaceId, categoryId } = data;

        const existingCategory = await db.category.findUnique({
            where: { id: categoryId }
        });

        if (!existingCategory) {
            return { error: "Category not found" };
        }

        if (existingCategory.workspaceId !== workspaceId) {
            return { error: "Unauthorized to delete this category" };
        }

        await db.category.delete({
            where: { id: categoryId }
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/categories`);
        return { data: { success: true } };
    } catch (error) {
        console.error("[DELETE_CATEGORY_ERROR]", error);
        return { error: "Failed to delete category" };
    }
};

export const deleteCategory = createSafeAction(DeleteCategory, handler);
