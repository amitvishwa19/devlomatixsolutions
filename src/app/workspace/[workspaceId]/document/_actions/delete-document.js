'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Delete Document (Soft delete or permanent purge)
 */
export async function deleteDocument(workspaceId, documentId, force = false) {
    try {
        const currentUserId = await getAuthUser();
        if (!documentId) throw new Error("Document ID required");

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId, workspaceId },
            include: { sharedWith: true }
        });

        if (!document) {
            throw new Error("Document not found");
        }

        const isOwner = document.userId === currentUserId;
        const userAccess = document.sharedWith?.find(s => s.userId === currentUserId);
        const canDelete = isOwner || userAccess?.role === "ADMIN";

        if (!canDelete) {
            throw new Error("Forbidden: You do not have permission to delete this document");
        }

        if (force || document.deletedAt !== null) {
            // Permanent Purge
            await db.workspaceDocument.delete({
                where: { id: documentId }
            });
        } else {
            // Soft Delete to Recycle Bin
            await db.workspaceDocument.update({
                where: { id: documentId },
                data: { deletedAt: new Date() }
            });
        }

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, message: "Document deleted successfully" };
    } catch (error) {
        console.error("[SERVER_ACTION_DELETE_DOCUMENT]", error);
        return { success: false, error: error.message || "Failed to delete document" };
    }
}
