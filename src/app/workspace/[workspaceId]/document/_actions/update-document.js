'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Update Document
 */
export async function updateDocument(workspaceId, documentId, data) {
    try {
        const currentUserId = await getAuthUser();
        if (!documentId) throw new Error("Document ID required");

        const existing = await db.workspaceDocument.findUnique({
            where: { id: documentId, workspaceId },
            include: { sharedWith: true }
        });

        if (!existing) {
            throw new Error("Document not found");
        }

        const isOwner = existing.userId === currentUserId;
        const userAccess = existing.sharedWith?.find(s => s.userId === currentUserId);
        const canEdit = isOwner || userAccess?.role === "EDITOR" || userAccess?.role === "ADMIN";

        if (!canEdit) {
            throw new Error("Forbidden: You do not have permission to edit this document");
        }

        const updateData = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description ? data.description.trim() : null;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.tags !== undefined) updateData.tags = Array.isArray(data.tags) ? data.tags : [];
        if (data.isStarred !== undefined) updateData.isStarred = Boolean(data.isStarred);
        if (data.deletedAt !== undefined) updateData.deletedAt = data.deletedAt;

        if (data.parentId !== undefined) {
            if (data.parentId === "root" || data.parentId === null) {
                updateData.parentId = null;
            } else {
                updateData.parentId = data.parentId;
            }
        }

        const updated = await db.workspaceDocument.update({
            where: { id: documentId },
            data: updateData,
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, data: updated };
    } catch (error) {
        console.error("[SERVER_ACTION_UPDATE_DOCUMENT]", error);
        return { success: false, error: error.message || "Failed to update document" };
    }
}
