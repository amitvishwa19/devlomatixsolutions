'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Batch Move Documents to Destination Folder
 */
export async function moveDocuments(workspaceId, documentIds, targetFolderId) {
    try {
        await getAuthUser();
        if (!Array.isArray(documentIds) || documentIds.length === 0) {
            throw new Error("Document IDs required");
        }

        let validParentId = null;
        if (targetFolderId && targetFolderId !== "root") {
            const folder = await db.workspaceDocument.findUnique({
                where: { id: targetFolderId, workspaceId, isFolder: true, deletedAt: null }
            });
            if (folder) {
                validParentId = folder.id;
            }
        }

        // Prevent moving a folder into itself
        const safeDocIds = documentIds.filter(id => id !== validParentId);

        await db.workspaceDocument.updateMany({
            where: {
                id: { in: safeDocIds },
                workspaceId
            },
            data: {
                parentId: validParentId
            }
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, count: safeDocIds.length };
    } catch (error) {
        console.error("[SERVER_ACTION_MOVE_DOCUMENTS]", error);
        return { success: false, error: error.message || "Failed to move documents" };
    }
}
