'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Empty Recycle Bin / Permanent Batch Purge
 */
export async function emptyTrash(workspaceId, documentIds = [], emptyAll = false) {
    try {
        await getAuthUser();

        const whereClause = {
            workspaceId,
            deletedAt: { not: null }
        };

        if (!emptyAll && Array.isArray(documentIds) && documentIds.length > 0) {
            whereClause.id = { in: documentIds };
        }

        const result = await db.workspaceDocument.deleteMany({
            where: whereClause
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, count: result.count };
    } catch (error) {
        console.error("[SERVER_ACTION_EMPTY_TRASH]", error);
        return { success: false, error: error.message || "Failed to empty recycle bin" };
    }
}
