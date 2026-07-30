import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const { id } = await params;
    const { active } = body;

    const userId = searchParams.get("userId");

    const bot = await db.botFlow.findFirst({ where: { id, userId } });
    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    const updated = await db.botFlow.update({
      where: { id },
      data: { active: active ?? !bot.active },
    });

    return NextResponse.json({ success: true, data: { bot: updated } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to toggle bot status" }, { status: 500 });
  }
}
