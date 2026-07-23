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

export async function PATCH(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const existing = await db.kanbanTask.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId || null;
    if (body.coverUrl !== undefined) updateData.coverUrl = body.coverUrl || null;
    if (body.columnId !== undefined) updateData.columnId = body.columnId;
    if (body.order !== undefined) updateData.order = body.order;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const task = await db.kanbanTask.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, displayName: true, email: true, avatar: true } },
        checklists: { orderBy: { order: 'asc' } },
      },
    });

    await db.kanbanActivity.create({
      data: {
        type: 'updated',
        description: body.title
          ? `Renamed to "${body.title}"`
          : body.columnId
            ? `Moved to a different column`
            : `Task updated`,
        taskId: id,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: { task } });
  } catch (error) {
    console.error("PATCH kanban task error:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existing = await db.kanbanTask.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await db.kanbanTask.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("DELETE kanban task error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete task" }, { status: 500 });
  }
}
