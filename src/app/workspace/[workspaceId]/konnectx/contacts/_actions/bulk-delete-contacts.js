'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const BulkDeleteSchema = z.object({
    ids: z.array(z.string()),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { ids, workspaceId } = data;
    const session = await ensureWorkspaceAccess(workspaceId);
    const userId = session?.user?.userId || session?.user?.id;

    try {
        await db.contact.deleteMany({
            where: {
                id: { in: ids },
                userId,  // Only owner can delete
                workspaceId
            }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error('[BULK_DELETE_CONTACTS]', error);
        return { error: "Failed to delete contacts" };
    }
};

export const bulkDeleteContacts = createSafeAction(BulkDeleteSchema, handler);
