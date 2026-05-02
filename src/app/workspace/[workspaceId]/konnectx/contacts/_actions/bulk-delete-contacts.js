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
    await ensureWorkspaceAccess(workspaceId);

    try {
        await db.contact.deleteMany({
            where: {
                id: { in: ids },
                workspaceId // Ensure we only delete from this workspace
            }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error('[BULK_DELETE_CONTACTS]', error);
        return { error: "Failed to delete contacts" };
    }
};

export const bulkDeleteContacts = createSafeAction(BulkDeleteSchema, handler);
