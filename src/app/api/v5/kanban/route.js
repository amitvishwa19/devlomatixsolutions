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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const userId = await getUserIdFromRequest(request);

    const columns = await db.kanbanColumn.findMany({
      where: { workspaceId },
      include: {
        tasks: {
          where: userId ? {
            OR: [
              { userId },
              { assigneeId: userId }
            ]
          } : undefined,
          include: {
            assignee: { select: { id: true, displayName: true, email: true, avatar: true } },
            checklists: { orderBy: { order: 'asc' } },
            activities: {
              include: { user: { select: { id: true, displayName: true, avatar: true } } },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: { columns } });
  } catch (error) {
    console.error("GET kanban error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch board" }, { status: 500 });
  }
}
