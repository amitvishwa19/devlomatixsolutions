import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req, { params }) {
    try {
        const { workspaceId, taskId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, order } = body;

        const checklistItem = await db.kanbanChecklist.create({
            data: {
                title,
                order: order || 0,
                taskId
            }
        });

        // Log Activity
        await db.kanbanActivity.create({
            data: {
                type: 'UPDATE',
                description: `added checklist item: ${title}`,
                taskId,
                userId: session.user.userId
            }
        });

        return NextResponse.json(checklistItem);
    } catch (error) {
        console.error("[KANBAN_CHECKLIST_POST]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
