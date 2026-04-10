import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(req, { params }) {
    try {
        const { workspaceId, taskId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, type, content, priority, dueDate, columnId, order, assigneeId, coverUrl } = body;

        // Fetch original task to check for changes (e.g., column move)
        const oldTask = await db.kanbanTask.findUnique({
            where: { id: taskId }
        });

        const task = await db.kanbanTask.update({
            where: {
                id: taskId,
                workspaceId,
                OR: [
                    { userId: session.user.userId },
                    { assigneeId: session.user.userId }
                ]
            },
            data: {
                title: title !== undefined ? title : undefined,
                type: type !== undefined ? type : undefined,
                content: content !== undefined ? content : undefined,
                priority: priority !== undefined ? priority : undefined,
                dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
                order: order !== undefined ? order : undefined,
                columnId: columnId !== undefined ? columnId : undefined,
                assigneeId: assigneeId !== undefined ? assigneeId : undefined,
                coverUrl: coverUrl !== undefined ? coverUrl : undefined
            }
        });

        // Log Activity
        if (oldTask) {
            if (columnId !== undefined && oldTask.columnId !== columnId) {
                await db.kanbanActivity.create({
                    data: {
                        type: 'MOVE',
                        description: `moved task`,
                        taskId,
                        userId: session.user.userId
                    }
                });
            }
            
            if (title !== undefined && oldTask.title !== title) {
                await db.kanbanActivity.create({
                    data: {
                        type: 'UPDATE',
                        description: `renamed task to "${title}"`,
                        taskId,
                        userId: session.user.userId
                    }
                });
            }

            if (assigneeId !== undefined && oldTask.assigneeId !== assigneeId) {
                const assignee = assigneeId ? await db.user.findUnique({ where: { id: assigneeId }, select: { displayName: true } }) : null;
                await db.kanbanActivity.create({
                    data: {
                        type: 'UPDATE',
                        description: assignee ? `assigned task to ${assignee.displayName}` : `removed assignee from task`,
                        taskId,
                        userId: session.user.userId
                    }
                });
            }
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error("[KANBAN_TASK_PATCH]", error);
        return NextResponse.json({ 
            message: "Failed to update task", 
            error: error.message 
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, taskId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db.kanbanTask.delete({
            where: { 
                id: taskId, 
                workspaceId,
                OR: [
                    { userId: session.user.userId },
                    { assigneeId: session.user.userId }
                ]
            }
        });

        return NextResponse.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("[KANBAN_TASK_DELETE]", error);
        return NextResponse.json({ 
            message: "Failed to delete task", 
            error: error.message 
        }, { status: 500 });
    }
}
