import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(req, { params }) {
    try {
        const { workspaceId, columnId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, order } = body;

        const column = await db.kanbanColumn.update({
            where: { id: columnId, workspaceId },
            data: {
                title: title !== undefined ? title : undefined,
                order: order !== undefined ? order : undefined
            }
        });

        return NextResponse.json(column);
    } catch (error) {
        console.error("[KANBAN_COLUMN_PATCH]", error);
        return NextResponse.json({ 
            message: "Failed to update column", 
            error: error.message 
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, columnId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // KanbanColumn relation has onDelete: Cascade for tasks in schema
        await db.kanbanColumn.delete({
            where: { id: columnId, workspaceId }
        });

        return NextResponse.json({ message: "Column deleted successfully" });
    } catch (error) {
        console.error("[KANBAN_COLUMN_DELETE]", error);
        return NextResponse.json({ 
            message: "Failed to delete column", 
            error: error.message 
        }, { status: 500 });
    }
}
