import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const { id } = await params;

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.screens !== undefined) updateData.screens = body.screens;
    if (body.definition !== undefined) updateData.definition = body.definition;
    if (body.categories !== undefined) updateData.categories = body.categories;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.flowId !== undefined) updateData.flowId = body.flowId;

    const flow = await db.whatsAppFlow.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: { flow } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update flow" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const { id } = await params;

    await db.whatsAppFlow.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Flow deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete flow" }, { status: 500 });
  }
}
