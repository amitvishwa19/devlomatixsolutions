import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req, { params }) {
    try {
        const { documentId } = await params;
        const { searchParams } = new URL(req.url);
        const force = searchParams.get("force");

        if (!documentId) {
            return new NextResponse("Document ID required", { status: 400 });
        }

        let document;
        if (force === "true") {
            document = await db.workspaceDocument.delete({
                where: { id: documentId }
            });
        } else {
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

export async function PATCH(req, { params }) {
    try {
        const { documentId } = await params;
        const body = await req.json();
        const { name, description, category, parentId, isStarred, status, tags } = body;

        if (!documentId) {
            return new NextResponse("Document ID required", { status: 400 });
        }

        const dataToUpdate = {};
        
        if (name !== undefined) dataToUpdate.name = name;
        if (description !== undefined) dataToUpdate.description = description;
        if (category !== undefined) dataToUpdate.category = category;
        if (isStarred !== undefined) dataToUpdate.isStarred = isStarred;
        if (status !== undefined) dataToUpdate.status = status;
        if (tags !== undefined) dataToUpdate.tags = tags;

        if (parentId !== undefined) {
            dataToUpdate.parentId = parentId === "root" ? null : parentId;
        }

        const document = await db.workspaceDocument.update({
            where: {
                id: documentId
            },
            data: dataToUpdate
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("[DOCUMENT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
