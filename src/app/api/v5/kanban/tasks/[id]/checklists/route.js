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

export async function POST(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const task = await db.kanbanTask.findFirst({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const maxOrder = await db.kanbanChecklist.findFirst({
      where: { taskId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const item = await db.kanbanChecklist.create({
      data: {
        title,
        taskId,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
    });

    return NextResponse.json({ success: true, data: { item } }, { status: 201 });
  } catch (error) {
    console.error("POST checklist error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checklist item" }, { status: 500 });
  }
}
