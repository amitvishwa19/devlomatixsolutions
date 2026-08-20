'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";

/**
 * Fetch document collaborator access information
 */
export async function getDocumentShareInfo(workspaceId, documentId) {
    try {
        await getAuthUser();
        if (!documentId) throw new Error("Document ID required");

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId, workspaceId },
            select: {
                id: true,
                name: true,
                userId: true,
                isFolder: true,
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
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        });

        if (!document) {
            throw new Error("Document not found");
        }

        return { success: true, data: document };
    } catch (error) {
        console.error("[SERVER_ACTION_GET_SHARE_INFO]", error);
        return { success: false, error: error.message || "Failed to fetch share info" };
    }
}
