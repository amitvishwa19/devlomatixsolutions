'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Restore Document(s) from Trash
 */
export async function restoreDocuments(workspaceId, documentIds = [], restoreAll = false) {
    try {
        await getAuthUser();

        const whereClause = {
            workspaceId,
            deletedAt: { not: null }
        };

        if (!restoreAll && Array.isArray(documentIds) && documentIds.length > 0) {
            whereClause.id = { in: documentIds };
        }

        const result = await db.workspaceDocument.updateMany({
            where: whereClause,
            data: { deletedAt: null }
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, count: result.count };
    } catch (error) {
        console.error("[SERVER_ACTION_RESTORE_DOCUMENTS]", error);
        return { success: false, error: error.message || "Failed to restore documents" };
    }
}
