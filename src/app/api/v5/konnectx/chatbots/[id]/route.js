import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const existing = await db.botFlow.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.nodes !== undefined) updateData.nodes = body.nodes;
    if (body.edges !== undefined) updateData.edges = body.edges;

    const bot = await db.botFlow.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: { bot } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update bot" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const bot = await db.botFlow.findFirst({ where: { id, userId } });
    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    await db.botFlow.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Bot deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete bot" }, { status: 500 });
  }
}
