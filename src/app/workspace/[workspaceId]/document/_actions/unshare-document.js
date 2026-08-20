'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Revoke document share access for a user
 */
export async function unshareDocumentWithUser(workspaceId, documentId, { userId }) {
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
        const canShare = isOwner || userAccess?.role === "ADMIN";

        if (!canShare) {
            throw new Error("Forbidden: You cannot revoke sharing permissions");
        }

        await db.documentAccess.deleteMany({
            where: {
                documentId,
                userId
            }
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, message: "User access revoked" };
    } catch (error) {
        console.error("[SERVER_ACTION_UNSHARE_DOCUMENT]", error);
        return { success: false, error: error.message || "Failed to unshare document" };
    }
}
