'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Share document with a workspace user
 */
export async function shareDocumentWithUser(workspaceId, documentId, { userId, role = "VIEWER" }) {
    try {
        const currentUserId = await getAuthUser();
        if (!documentId || !userId) throw new Error("Document ID and User ID required");

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId, workspaceId },
            include: { sharedWith: true }
        });

        if (!document) throw new Error("Document not found");

        const isOwner = document.userId === currentUserId;
        const userAccess = document.sharedWith?.find(s => s.userId === currentUserId);
        const canShare = isOwner || userAccess?.role === "EDITOR" || userAccess?.role === "ADMIN";

        if (!canShare) {
            throw new Error("Forbidden: You cannot modify sharing permissions for this document");
        }

        const access = await db.documentAccess.upsert({
            where: {
                documentId_userId: {
                    documentId,
                    userId
                }
            },
            update: {
                role: role.toUpperCase()
            },
            create: {
                documentId,
                userId,
                role: role.toUpperCase()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatar: true,
                    }
                }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, data: access };
    } catch (error) {
        console.error("[SERVER_ACTION_SHARE_DOCUMENT]", error);
        return { success: false, error: error.message || "Failed to share document" };
    }
}
