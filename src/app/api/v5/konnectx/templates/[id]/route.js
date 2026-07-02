import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.body !== undefined) updateData.body = body.body;
    if (body.footer !== undefined) updateData.footer = body.footer;
    if (body.buttons !== undefined) updateData.buttons = body.buttons;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    if (body.status !== undefined) updateData.status = body.status;

    const template = await db.messageTemplate.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: { template } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const { id } = params;

    await db.messageTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Template deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 });
  }
}
