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

        const { content } = await req.json();

        const assignments = await db.emailAssignment.findMany({
            where: { workspaceId, templateName: filename }
        });

        if (assignments.length === 0) {
            return NextResponse.json({ message: "Template not found" }, { status: 404 });
        }

        // Update all assignments that share this template name
        await db.emailAssignment.updateMany({
            where: { workspaceId, templateName: filename },
            data: { content }
        });

        return NextResponse.json({ message: "Template updated successfully" });
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
