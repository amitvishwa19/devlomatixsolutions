'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Duplicate Document (Clone)
 */
export async function duplicateDocument(workspaceId, documentId) {
    try {
        const currentUserId = await getAuthUser();
        if (!documentId) throw new Error("Document ID required");

        const original = await db.workspaceDocument.findUnique({
            where: { id: documentId, workspaceId }
        });

        if (!original) {
            throw new Error("Document not found");
        }

        const duplicate = await db.workspaceDocument.create({
            data: {
                name: `${original.name} (Copy)`,
                description: original.description,
                fileUrl: original.fileUrl,
                fileKey: original.fileKey,
                fileType: original.fileType,
                extension: original.extension,
                fileSize: original.fileSize,
                category: original.category,
                content: original.content,
                isFolder: original.isFolder,
                parentId: original.parentId,
                workspaceId: original.workspaceId,
                userId: currentUserId,
                tags: original.tags,
                status: "DRAFT",
            }
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, data: duplicate };
    } catch (error) {
        console.error("[SERVER_ACTION_DUPLICATE_DOCUMENT]", error);
        return { success: false, error: error.message || "Failed to duplicate document" };
    }
}
