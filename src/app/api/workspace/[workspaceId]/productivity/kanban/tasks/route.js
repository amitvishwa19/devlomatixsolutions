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

        const userId = session.user.userId;
        const body = await req.json();
        const { title, type, content, priority, dueDate, columnId, order, assigneeId, checklists } = body;

        if (!title || !columnId) {
            return NextResponse.json({ message: "Title and Column ID are required" }, { status: 400 });
        }

        const task = await db.kanbanTask.create({
            data: {
                title,
                type: type || "task",
                content: content || null,
                priority: priority || "medium",
                dueDate: dueDate ? new Date(dueDate) : null,
                order: order || 0,
                columnId,
                workspaceId,
                userId,
                assigneeId: assigneeId || null,
                checklists: checklists && checklists.length > 0 ? {
                    create: checklists.map((item, index) => ({
                        title: typeof item === 'string' ? item : item.title,
                        completed: typeof item === 'string' ? false : !!item.completed,
                        order: index
                    }))
                } : undefined
            },
            include: {
                checklists: true,
                activities: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[KANBAN_TASKS_POST]", error);
        return NextResponse.json({ 
            message: "Failed to create task", 
            error: error.message 
        }, { status: 500 });
    }
}
