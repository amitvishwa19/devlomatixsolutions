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

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const column = await db.kanbanColumn.findFirst({ where: { id } });
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    await db.kanbanColumn.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Column deleted" });
  } catch (error) {
    console.error("DELETE kanban column error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete column" }, { status: 500 });
  }
}
