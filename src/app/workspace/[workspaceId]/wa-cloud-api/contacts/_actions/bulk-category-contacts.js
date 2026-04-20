'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const BulkCategorySchema = z.object({
    ids: z.array(z.string()),
    categoryId: z.string().min(1, "Category ID is required"),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { ids, categoryId, workspaceId } = data;
    await ensureWorkspaceAccess(workspaceId);

    try {
        await db.contact.updateMany({
            where: {
                id: { in: ids },
                workspaceId
            },
            data: {
                categoryId: categoryId === 'none' ? null : categoryId
            }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error('[BULK_CATEGORY_CONTACTS]', error);
        return { error: "Failed to update category" };
    }
};

export const bulkCategoryContacts = createSafeAction(BulkCategorySchema, handler);
