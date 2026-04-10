import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const { documentId } = await params;
        const body = await req.json();
        const { userId, role } = body;

        if (!documentId || !userId) {
            return new NextResponse("Document ID and User ID required", { status: 400 });
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
        const { documentId } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!documentId || !userId) {
            return new NextResponse("Document ID and User ID required", { status: 400 });
        }

        await db.documentAccess.delete({
            where: {
                documentId_userId: {
                    documentId,
                    userId
                }
            }
        });

        return new NextResponse("Access revoked", { status: 200 });
    } catch (error) {
        console.error("[DOCUMENT_SHARE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
