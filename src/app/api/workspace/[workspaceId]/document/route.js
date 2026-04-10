import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";
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

        const whereClause = {
            workspaceId: workspaceId,
            OR: [
                { userId: currentUserId },
                { sharedWith: { some: { userId: currentUserId } } }
            ]
        };

        if (isTrash === "true") {
            whereClause.deletedAt = { not: null };
        } else {
            whereClause.deletedAt = null;
        }

        if (parentId) {
            whereClause.parentId = parentId === "root" ? null : parentId;
        }

        if (isFolder !== null) {
            whereClause.isFolder = isFolder === "true";
        }

        const documents = await db.workspaceDocument.findMany({
            where: whereClause,
            take: limit ? parseInt(limit) : undefined,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: true,
                sharedWith: {
                    include: {
                        user: true
                    }
                },
                _count: {
                    select: {
                        children: true
                    }
                }
            }
        })

        console.log("documents", documents);

        return NextResponse.json(documents);
    } catch (error) {
        console.error("[DOCUMENT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const body = await req.json();
        const { name, description, fileUrl, fileKey, fileType: clientFileType, fileSize, category, userId, isFolder, parentId } = body;




        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        if (!name && !isFolder) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        console.log("create body", body);

        // Server-side MIME type detection and extension extraction
        let detectedMimeType = null;
        let detectedExtension = null;

        if (isFolder) {
            detectedMimeType = "folder";
            detectedExtension = null;
        } else if (name) {
            detectedMimeType = mime.lookup(name) || clientFileType || 'application/octet-stream';
            detectedExtension = path.extname(name).toLowerCase();
        }

        const document = await db.workspaceDocument.create({
            data: {
                name,
                description,
                fileUrl,
                fileKey,
                fileType: detectedMimeType || clientFileType,
                extension: detectedExtension,
                fileSize,
                category,
                workspaceId,
                userId,
                isFolder: !!isFolder,
                parentId: parentId || null,
                sharedWith: {
                    create: {
                        userId: userId,
                        role: "EDITOR"
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
