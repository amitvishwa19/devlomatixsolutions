import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const currentUserId = session.user.userId || session.user.id;

        const { documentId } = await params;
        if (!documentId) {
            return new NextResponse("Document ID required", { status: 400 });
        }

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId },
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
                        children: true
                    }
                }
            }
        });

        if (!document) {
            return new NextResponse("Document not found", { status: 404 });
        }

        const isOwner = document.userId === currentUserId;
        const userAccess = document.sharedWith?.find(s => s.userId === currentUserId);
        const userRole = isOwner ? "OWNER" : (userAccess?.role || "VIEWER");

        return NextResponse.json({
            ...document,
            isOwner,
            userRole,
            canEdit: isOwner || userRole === "EDITOR" || userRole === "ADMIN"
        });
    } catch (error) {
        console.error("[DOCUMENT_GET_BY_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const currentUserId = session.user.userId || session.user.id;

        const { documentId } = await params;
        const body = await req.json();
        const {
            name,
            description,
            content,
            category,
            parentId,
            isStarred,
            status,
            tags,
            deletedAt
        } = body;

        if (!documentId) {
            return new NextResponse("Document ID required", { status: 400 });
        }

        const existingDoc = await db.workspaceDocument.findUnique({
            where: { id: documentId },
            include: {
                sharedWith: true
            }
        });

        if (!existingDoc) {
            return new NextResponse("Document not found", { status: 404 });
        }

        const isOwner = existingDoc.userId === currentUserId;
        const userAccess = existingDoc.sharedWith?.find(s => s.userId === currentUserId);
        const canEdit = isOwner || userAccess?.role === "EDITOR" || userAccess?.role === "ADMIN";

        if (!canEdit) {
            return new NextResponse("Forbidden: You do not have edit permission for this document", { status: 403 });
        }

        const dataToUpdate = {};

        if (name !== undefined) dataToUpdate.name = name.trim();
        if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
        if (content !== undefined) {
            dataToUpdate.content = content;
            if (!existingDoc.fileUrl) {
                dataToUpdate.fileSize = Buffer.byteLength(content, "utf8");
            }
        }
        if (category !== undefined) dataToUpdate.category = category;
        if (isStarred !== undefined) dataToUpdate.isStarred = !!isStarred;
        if (status !== undefined) dataToUpdate.status = status;
        if (tags !== undefined && Array.isArray(tags)) dataToUpdate.tags = tags;
        if (deletedAt !== undefined) dataToUpdate.deletedAt = deletedAt;

        if (parentId !== undefined) {
            dataToUpdate.parentId = parentId === "root" || !parentId ? null : parentId;
        }

        const updatedDocument = await db.workspaceDocument.update({
            where: {
                id: documentId
            },
            data: dataToUpdate,
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

        return NextResponse.json(updatedDocument);
    } catch (error) {
        console.error("[DOCUMENT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const currentUserId = session.user.userId || session.user.id;

        const { documentId } = await params;
        const { searchParams } = new URL(req.url);
        const force = searchParams.get("force");

        if (!documentId) {
            return new NextResponse("Document ID required", { status: 400 });
        }

        const existingDoc = await db.workspaceDocument.findUnique({
            where: { id: documentId },
            include: { sharedWith: true }
        });

        if (!existingDoc) {
            return new NextResponse("Document not found", { status: 404 });
        }

        // Only owner or workspace admin can permanently delete
        const isOwner = existingDoc.userId === currentUserId;
        const userAccess = existingDoc.sharedWith?.find(s => s.userId === currentUserId);
        const canDelete = isOwner || userAccess?.role === "EDITOR" || userAccess?.role === "ADMIN";

        if (!canDelete) {
            return new NextResponse("Forbidden: You do not have permission to delete this document", { status: 403 });
        }

        let document;
        if (force === "true") {
            // Clean up Supabase storage file if it exists
            if (existingDoc.fileKey) {
                try {
                    await supabase.storage.from("devlomatix").remove([existingDoc.fileKey]);
                } catch (storageErr) {
                    console.error("Failed to delete file from Supabase storage:", storageErr);
                }
            }

            document = await db.workspaceDocument.delete({
                where: { id: documentId }
            });
        } else {
            // Soft delete
            document = await db.workspaceDocument.update({
                where: { id: documentId },
                data: { deletedAt: new Date() }
            });
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error("[DOCUMENT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
