import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(req, { params }) {
    try {
        const { workspaceId, taskId, itemId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, completed, order } = body;

        const checklistItem = await db.kanbanChecklist.update({
            where: {
                id: itemId,
                taskId
            },
            data: {
                title: title !== undefined ? title : undefined,
                completed: completed !== undefined ? completed : undefined,
                order: order !== undefined ? order : undefined
            }
        });

        // Log Activity if completed status changed
        if (completed !== undefined) {
            await db.kanbanActivity.create({
                data: {
                    type: 'CHECKLIST_TOGGLE',
                    description: `${completed ? 'completed' : 'uncompleted'} item: ${checklistItem.title}`,
                    taskId,
                    userId: session.user.userId
                }
            });
        }

        return NextResponse.json(checklistItem);
    } catch (error) {
        console.error("[KANBAN_CHECKLIST_PATCH]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, taskId, itemId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db.kanbanChecklist.delete({
            where: {
                id: itemId,
                taskId
            }
        });

        return NextResponse.json({ message: "Item deleted" });
    } catch (error) {
        console.error("[KANBAN_CHECKLIST_DELETE]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
