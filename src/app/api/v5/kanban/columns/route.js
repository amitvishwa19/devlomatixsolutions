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
    const { workspaceId, title, order } = body;

    if (!workspaceId || !title) {
      return NextResponse.json({ error: "workspaceId and title are required" }, { status: 400 });
    }

    const maxOrder = await db.kanbanColumn.findFirst({
      where: { workspaceId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const column = await db.kanbanColumn.create({
      data: {
        title,
        workspaceId,
        order: order ?? (maxOrder ? maxOrder.order + 1 : 0),
      },
    });

    return NextResponse.json({ success: true, data: { column } }, { status: 201 });
  } catch (error) {
    console.error("POST kanban column error:", error);
    return NextResponse.json({ error: error.message || "Failed to create column" }, { status: 500 });
  }
}
