'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";

/**
 * Fetch Document Summary Stats
 */
export async function getDocumentStats(workspaceId) {
    try {
        await getAuthUser();

        const [totalCount, starredCount, sizeAgg, uniqueCollaborators] = await Promise.all([
            db.workspaceDocument.count({
                where: { workspaceId, deletedAt: null, isFolder: false }
            }),
            db.workspaceDocument.count({
                where: { workspaceId, deletedAt: null, isStarred: true }
            }),
            db.workspaceDocument.aggregate({
                where: { workspaceId, deletedAt: null, isFolder: false },
                _sum: { fileSize: true }
            }),
            db.documentAccess.groupBy({
                by: ['userId'],
                where: {
                    document: {
                        workspaceId,
                        deletedAt: null
                    }
                }
            })
        ]);

        return {
            success: true,
            data: {
                totalCount,
                totalSizeBytes: sizeAgg._sum.fileSize || 0,
                starredCount,
                collaboratorCount: uniqueCollaborators.length
            }
        };
    } catch (error) {
        console.error("[SERVER_ACTION_DOCUMENT_STATS]", error);
        return { success: false, error: error.message || "Failed to calculate stats" };
    }
}
