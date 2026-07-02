import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const contact = await db.contact.findUnique({ where: { id }, include: { groups: true } });
    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    return NextResponse.json({ data: contact });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const contact = await db.contact.findFirst({ where: { id, userId } });
    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.info !== undefined) updateData.info = body.info;
    if (body.tags !== undefined) updateData.tags = body.tags;

    if (body.groupIds) {
      await db.contact.update({ where: { id }, data: { groups: { set: body.groupIds.map(gid => ({ id: gid })) } } });
    }

    const updated = await db.contact.update({ where: { id }, data: updateData, include: { groups: true } });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const contact = await db.contact.findFirst({ where: { id, userId } });
    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    await db.contact.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Contact deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete contact" }, { status: 500 });
  }
}
