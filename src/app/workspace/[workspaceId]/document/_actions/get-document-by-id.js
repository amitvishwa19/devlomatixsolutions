'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";

/**
 * Get Single Document by ID
 */
export async function getDocumentById(workspaceId, documentId) {
    try {
        const currentUserId = await getAuthUser();
        if (!documentId) throw new Error("Document ID is required");

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId, workspaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatar: true,
                    }
                },
                sharedWith: {
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
                },
                parent: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                children: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        name: true,
                        fileType: true,
                        isFolder: true,
                        fileSize: true,
                    }
                },
                _count: {
                    select: {
                        children: {
                            where: { deletedAt: null }
                        }
                    }
                }
            }
        });

        if (!document) {
            return { success: false, error: "Document not found" };
        }

        const isOwner = document.userId === currentUserId;
        const userAccess = document.sharedWith?.find(s => s.userId === currentUserId);
        const userRole = isOwner ? "OWNER" : (userAccess?.role || "VIEWER");

        return {
            success: true,
            data: {
                ...document,
                isOwner,
                userRole,
                canEdit: isOwner || userRole === "EDITOR" || userRole === "ADMIN",
                sharedCount: document.sharedWith?.length || 0
            }
        };
    } catch (error) {
        console.error("[SERVER_ACTION_GET_DOC_BY_ID]", error);
        return { success: false, error: error.message || "Failed to fetch document" };
    }
}
