import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const payload = await decrypt(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, columnId, title, content, type, priority, dueDate, assigneeId, coverUrl, checklists } = body;

    if (!workspaceId || !columnId || !title) {
      return NextResponse.json({ error: "workspaceId, columnId, and title are required" }, { status: 400 });
    }

    const maxOrder = await db.kanbanTask.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const task = await db.kanbanTask.create({
      data: {
        title,
        content: content || null,
        type: type || 'task',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        order: maxOrder ? maxOrder.order + 1 : 0,
        columnId,
        workspaceId,
        userId,
        assigneeId: assigneeId || null,
        coverUrl: coverUrl || null,
        checklists: checklists?.length
          ? { create: checklists.map((item, idx) => ({ title: item.title || item, order: idx })) }
          : undefined,
      },
      include: {
        assignee: { select: { id: true, displayName: true, email: true, avatar: true } },
        checklists: { orderBy: { order: 'asc' } },
      },
    });

    await db.kanbanActivity.create({
      data: {
        type: 'created',
        description: `Created task "${title}"`,
        taskId: task.id,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: { task } }, { status: 201 });
  } catch (error) {
    console.error("POST kanban task error:", error);
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 });
  }
}
