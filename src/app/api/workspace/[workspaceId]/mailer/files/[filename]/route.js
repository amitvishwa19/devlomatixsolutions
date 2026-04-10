import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET /api/workspace/[workspaceId]/mailer/files/[filename]
// Read template file content from DB
export async function GET(req, { params }) {
    try {
        const { workspaceId, filename } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const assignment = await db.emailAssignment.findFirst({
            where: { workspaceId, templateName: filename }
        });

        if (!assignment || !assignment.content) {
            return NextResponse.json({ message: "Template not found" }, { status: 404 });
        }

        return NextResponse.json({ content: assignment.content });
    } catch (error) {
        console.error("[MAILER_FILE_GET]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PATCH /api/workspace/[workspaceId]/mailer/files/[filename]
// Update template file content in DB
export async function PATCH(req, { params }) {
    try {
        const { workspaceId, filename } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { content, newName } = await req.json();

        // 1. If renaming is requested
        if (newName) {
            const normalizedNewName = newName.endsWith(".html") ? newName : (newName.endsWith(".jsx") ? newName : `${newName}.html`);
            
            // Check if new name already exists
            const existing = await db.emailAssignment.findFirst({
                where: { workspaceId, templateName: normalizedNewName }
            });

            if (existing) {
                return NextResponse.json({ message: "A template with this name already exists" }, { status: 400 });
            }

            await db.emailAssignment.updateMany({
                where: { workspaceId, templateName: filename },
                data: { templateName: normalizedNewName }
            });

            return NextResponse.json({ message: "Template renamed successfully", newName: normalizedNewName });
        }

        // 2. If content update is requested
        if (content !== undefined) {
            await db.emailAssignment.updateMany({
                where: { workspaceId, templateName: filename },
                data: { content }
            });
            return NextResponse.json({ message: "Template content updated successfully" });
        }

        return NextResponse.json({ message: "No changes provided" }, { status: 400 });
    } catch (error) {
        console.error("[MAILER_FILE_PATCH]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE /api/workspace/[workspaceId]/mailer/files/[filename]
export async function DELETE(req, { params }) {
    try {
        const { workspaceId, filename } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Delete all assignments associated with this template
        await db.emailAssignment.deleteMany({
            where: { workspaceId, templateName: filename }
        });

        return NextResponse.json({ message: "Template deleted successfully" });
    } catch (error) {
        console.error("[MAILER_FILE_DELETE]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
