import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { documentId } = await params;
        if (!documentId) {
            return new NextResponse("Document ID required", { status: 400 });
        }

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId },
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
            return new NextResponse("Document not found", { status: 404 });
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error("[DOCUMENT_SHARE_GET]", error);
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

        const { documentId } = await params;
        const body = await req.json();
        const { userId, role } = body;

        if (!documentId || !userId) {
            return new NextResponse("Document ID and User ID required", { status: 400 });
        }

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId },
            include: { sharedWith: true }
        });

        if (!document) {
            return new NextResponse("Document not found", { status: 404 });
        }

        // Check if requester has rights to share
        const isOwner = document.userId === currentUserId;
        const userAccess = document.sharedWith?.find(s => s.userId === currentUserId);
        const canShare = isOwner || userAccess?.role === "EDITOR" || userAccess?.role === "ADMIN";

        if (!canShare) {
            return new NextResponse("Forbidden: You cannot modify sharing for this document", { status: 403 });
        }

        const access = await db.documentAccess.upsert({
            where: {
                documentId_userId: {
                    documentId,
                    userId
                }
            },
            update: {
                role: role || "VIEWER"
            },
            create: {
                documentId,
                userId,
                role: role || "VIEWER"
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

        return NextResponse.json(access);
    } catch (error) {
        console.error("[DOCUMENT_SHARE_POST]", error);
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
        const targetUserId = searchParams.get("userId");

        if (!documentId || !targetUserId) {
            return new NextResponse("Document ID and User ID required", { status: 400 });
        }

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId },
            include: { sharedWith: true }
        });

        if (!document) {
            return new NextResponse("Document not found", { status: 404 });
        }

        const isOwner = document.userId === currentUserId;
        const isSelf = targetUserId === currentUserId;
        const userAccess = document.sharedWith?.find(s => s.userId === currentUserId);
        const canRevoke = isOwner || isSelf || userAccess?.role === "EDITOR" || userAccess?.role === "ADMIN";

        if (!canRevoke) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await db.documentAccess.deleteMany({
            where: {
                documentId,
                userId: targetUserId
            }
        });

        return new NextResponse("Access revoked", { status: 200 });
    } catch (error) {
        console.error("[DOCUMENT_SHARE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
