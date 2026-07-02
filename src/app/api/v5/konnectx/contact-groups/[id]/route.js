import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const group = await db.contactGroup.findFirst({ where: { id } });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    await db.contactGroup.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Group deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete group" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;

    const group = await db.contactGroup.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update group" }, { status: 500 });
  }
}
