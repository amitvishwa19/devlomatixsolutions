import { NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserId(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  const payload = await decrypt(token);
  return payload?.userId || null;
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const existing = await db.department.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Department not found" }, { status: 404 });

    const department = await db.department.update({
      where: { id },
      data: { ...(name !== undefined && { name }), ...(description !== undefined && { description }) },
    });

    return NextResponse.json({ success: true, data: department });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await db.department.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Department not found" }, { status: 404 });

    await db.department.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Department deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete department" }, { status: 500 });
  }
}