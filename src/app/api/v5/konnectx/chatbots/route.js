import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const bots = await db.botFlow.findMany({
      where: { ...(userId && { userId }) },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: { bots: bots || [] } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch bots" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, active, nodes, edges } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const bot = await db.botFlow.create({
      data: {
...(userId && { userId }),
        name,
        description: description || '',
        active: active ?? true,
        nodes: nodes || [],
        edges: edges || [],
      },
    });

    return NextResponse.json({ success: true, data: { bot } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create bot" }, { status: 500 });
  }
}
