import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import mime from "mime-types";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const currentUserId = session.user.userId || session.user.id;

        const { workspaceId } = await params;
        const { searchParams } = new URL(req.url);
        const parentId = searchParams.get("parentId");
        const limit = searchParams.get("limit");
        const isFolder = searchParams.get("isFolder");
        const isTrash = searchParams.get("isTrash");
        const filter = searchParams.get("filter") || "all"; // all, mine, shared, starred, recent
        const type = searchParams.get("type"); // folder, note, image, pdf, video, audio, document
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const status = searchParams.get("status");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const whereClause = {
            workspaceId: workspaceId,
        };

        // Trash status
        if (isTrash === "true") {
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
            whereClause.isFolder = isFolder === "true";
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

        // Dynamic sorting
        const validSortFields = ["name", "createdAt", "updatedAt", "fileSize", "status"];
        const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
        const orderDirection = sortOrder === "asc" ? "asc" : "desc";

        const documents = await db.workspaceDocument.findMany({
            where: whereClause,
            take: limit ? parseInt(limit) : undefined,
            orderBy: {
                [orderField]: orderDirection
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatar: true,
                        role: true,
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
                _count: {
                    select: {
                        children: true
                    }
                }
            }
        });

        // Compute helper flags for client consumption
        const formattedDocs = documents.map(doc => {
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

        return NextResponse.json(formattedDocs);
    } catch (error) {
        console.error("[DOCUMENT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const currentUserId = session.user.userId || session.user.id;

        const { workspaceId } = await params;
        const body = await req.json();
        const {
            name,
            description,
            fileUrl,
            fileKey,
            fileType: clientFileType,
            fileSize,
            category,
            content,
            isFolder,
            parentId,
            tags = [],
            status = "APPROVED"
        } = body;

        if (!name && !isFolder) {
            return new NextResponse("Document name is required", { status: 400 });
        }

        // Server-side MIME type detection and extension extraction
        let detectedMimeType = clientFileType;
        let detectedExtension = null;

        if (isFolder) {
            detectedMimeType = "folder";
            detectedExtension = null;
        } else if (content !== undefined && !fileUrl) {
            // Native Rich Note / Doc
            detectedMimeType = "application/vnd.devlomatix.note";
            detectedExtension = ".doc";
        } else if (name) {
            detectedMimeType = mime.lookup(name) || clientFileType || "application/octet-stream";
            detectedExtension = path.extname(name).toLowerCase();
        }

        const document = await db.workspaceDocument.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                fileUrl: fileUrl || null,
                fileKey: fileKey || null,
                fileType: detectedMimeType,
                extension: detectedExtension,
                fileSize: fileSize || (content ? Buffer.byteLength(content, "utf8") : 0),
                content: content || null,
                category: category || "GENERAL",
                workspaceId,
                userId: currentUserId,
                isFolder: !!isFolder,
                parentId: parentId || null,
                status: status || "APPROVED",
                tags: Array.isArray(tags) ? tags : [],
                sharedWith: {
                    create: {
                        userId: currentUserId,
                        role: "EDITOR"
                    }
                }
            },
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
                _count: {
                    select: {
                        children: true
                    }
                }
            }
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("[DOCUMENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
