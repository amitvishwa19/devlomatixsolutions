import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, order } = body;

        if (!title) {
            return NextResponse.json({ message: "Title is required" }, { status: 400 });
        }

        const column = await db.kanbanColumn.create({
            data: {
                title,
                order: order || 0,
                workspaceId
            }
        });

        return NextResponse.json(column);
    } catch (error) {
        console.error("[KANBAN_COLUMNS_POST]", error);
        return NextResponse.json({ 
            message: "Failed to create column", 
            error: error.message 
        }, { status: 500 });
    }
}
