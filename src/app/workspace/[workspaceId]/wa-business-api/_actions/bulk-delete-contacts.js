'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const BulkDeleteSchema = z.object({
    ids: z.array(z.string()),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { ids, workspaceId } = data;

    try {
        const result = await db.contact.deleteMany({
            where: {
                id: { in: ids },
                workspaceId
            }
        });

        return { data: { success: true, count: result.count } };
    } catch (error) {
        console.error('[WA_BUSINESS_BULK_DELETE]', error);
        return { error: "Failed to delete contacts" };
    }
};

export const bulkDeleteContacts = createSafeAction(BulkDeleteSchema, handler);
