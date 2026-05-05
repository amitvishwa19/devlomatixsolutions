'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const CreateCategory = z.object({
    workspaceId: z.string(),
    formData: z.object({
        name: z.string().min(1, "Name is required"),
        slug: z.string().min(1, "Slug is required"),
        description: z.string().optional(),
        color: z.string().optional(),
        type: z.string().min(1, "Type is required"),
        storeId: z.string().optional().nullable(),
        parentCategoryId: z.string().optional().nullable(),
    }),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized" };

        const { workspaceId, formData } = data;
        const cleanSlug = formData.slug.toLowerCase().trim();

        if (!formData.storeId) {
            return { error: "You must assign this category to a specific store." };
        }

        let assignedParentId = null;

        if (formData.parentCategoryId) {
            assignedParentId = formData.parentCategoryId;
        } else {
            // Find the main category for this store (the one with parentId: null)
            const mainCategory = await db.category.findFirst({
                where: { 
                    storeId: formData.storeId, 
                    parentId: null 
                }
            });

            if (!mainCategory) {
                return { error: "Main category for this store not found. Please ensure the store was created correctly." };
            }
            assignedParentId = mainCategory.id;
        }

        // Check unique constraints: workspaceId + name
        const existingName = await db.category.findFirst({
            where: { workspaceId, name: formData.name }
        });

        if (existingName) {
            return { error: "A category with this name already exists in this workspace" };
        }

        // Check unique constraints: workspaceId + slug
        const existingSlug = await db.category.findFirst({
            where: { workspaceId, slug: cleanSlug }
        });

        if (existingSlug) {
            return { error: "A category with this slug already exists in this workspace" };
        }

        const category = await db.category.create({
            data: {
                workspaceId,
                name: formData.name,
                slug: cleanSlug,
                description: formData.description || null,
                color: formData.color || "#3b82f6",
                type: formData.type || "GENERAL",
                storeId: formData.storeId,
                parentId: assignedParentId,
            }
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/categories`);
        return { data: { category } };
    } catch (error) {
        console.error("[CREATE_CATEGORY_ERROR]", error);
        return { error: "Failed to create category" };
    }
};

export const createCategory = createSafeAction(CreateCategory, handler);
