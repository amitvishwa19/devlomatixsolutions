'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";

/**
 * Fetch Documents with filtering, search, and hierarchy support
 */
export async function getDocuments(workspaceId, options = {}) {
    try {
        const currentUserId = await getAuthUser();
        const {
            parentId,
            limit,
            isFolder,
            isTrash,
            filter = "all", // all, mine, shared, starred, recent
            type, // folder, note, image, pdf, video, audio, document
            search,
            category,
            status,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = options;

        const whereClause = {
            workspaceId: workspaceId,
        };

        // Trash status
        if (isTrash === true || isTrash === "true") {
            whereClause.deletedAt = { not: null };
        } else {
            whereClause.deletedAt = null;
        }

        // Ownership / Sharing Filters
        if (filter === "mine") {
            whereClause.userId = currentUserId;
        } else if (filter === "shared") {
            whereClause.AND = [
                { userId: { not: currentUserId } },
                { sharedWith: { some: { userId: currentUserId } } }
            ];
        } else if (filter === "starred") {
            whereClause.isStarred = true;
            whereClause.OR = [
                { userId: currentUserId },
                { sharedWith: { some: { userId: currentUserId } } }
            ];
        } else {
            // "all" or "recent"
            whereClause.OR = [
                { userId: currentUserId },
                { sharedWith: { some: { userId: currentUserId } } }
            ];
        }

        // Folder drill-down
        if (parentId !== null && parentId !== undefined) {
            whereClause.parentId = parentId === "root" ? null : parentId;
        }

        // isFolder filter
        if (isFolder !== null && isFolder !== undefined) {
            whereClause.isFolder = isFolder === true || isFolder === "true";
        }

        // File type filtering
        if (type) {
            if (type === "folder") {
                whereClause.isFolder = true;
            } else if (type === "note") {
                whereClause.isFolder = false;
                whereClause.OR = [
                    { fileType: "application/vnd.devlomatix.note" },
                    { content: { not: null }, fileUrl: null }
                ];
            } else if (type === "image") {
                whereClause.isFolder = false;
                whereClause.fileType = { startsWith: "image/" };
            } else if (type === "pdf") {
                whereClause.isFolder = false;
                whereClause.fileType = "application/pdf";
            } else if (type === "video") {
                whereClause.isFolder = false;
                whereClause.fileType = { startsWith: "video/" };
            } else if (type === "audio") {
                whereClause.isFolder = false;
                whereClause.fileType = { startsWith: "audio/" };
            } else if (type === "document" || type === "files") {
                whereClause.isFolder = false;
            }
        }

        // Category filter
        if (category && category !== "All" && category !== "ALL") {
            whereClause.category = category;
        }

        // Status filter
        if (status && status !== "ALL") {
            whereClause.status = status.toUpperCase();
        }

        // Search term
        if (search && search.trim()) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                {
                    OR: [
                        { name: { contains: search.trim(), mode: "insensitive" } },
                        { description: { contains: search.trim(), mode: "insensitive" } },
                        { tags: { hasSome: [search.trim()] } }
                    ]
                }
            ];
        }

        // Sorting
        const validSortFields = ["name", "createdAt", "updatedAt", "fileSize"];
        const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
        const orderDirection = sortOrder?.toLowerCase() === "asc" ? "asc" : "desc";

        const documents = await db.workspaceDocument.findMany({
            where: whereClause,
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
                _count: {
                    select: {
                        children: {
                            where: { deletedAt: null }
                        }
                    }
                }
            },
            orderBy: {
                [orderField]: orderDirection
            },
            ...(limit ? { take: parseInt(limit, 10) } : {})
        });

        // Format and return
        const formatted = documents.map(doc => {
            const isOwner = doc.userId === currentUserId;
            const userAccess = doc.sharedWith?.find(s => s.userId === currentUserId);
            const userRole = isOwner ? "OWNER" : (userAccess?.role || "VIEWER");

            return {
                ...doc,
                isOwner,
                userRole,
                canEdit: isOwner || userRole === "EDITOR" || userRole === "ADMIN",
                sharedCount: doc.sharedWith?.length || 0,
            };
        });

        return { success: true, data: formatted };
    } catch (error) {
        console.error("[SERVER_ACTION_GET_DOCUMENTS]", error);
        return { success: false, error: error.message || "Failed to fetch documents" };
    }
}
