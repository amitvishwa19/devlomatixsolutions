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

    const { itemId } = params;
    const body = await request.json();

    const existing = await db.kanbanChecklist.findFirst({ where: { id: itemId } });
    if (!existing) {
      return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
    }

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.completed !== undefined) updateData.completed = body.completed;

    const item = await db.kanbanChecklist.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: { item } });
  } catch (error) {
    console.error("PATCH checklist error:", error);
    return NextResponse.json({ error: error.message || "Failed to update checklist item" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = params;

    const existing = await db.kanbanChecklist.findFirst({ where: { id: itemId } });
    if (!existing) {
      return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
    }

    await db.kanbanChecklist.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true, message: "Checklist item deleted" });
  } catch (error) {
    console.error("DELETE checklist error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete checklist item" }, { status: 500 });
  }
}
