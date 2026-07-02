import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const original = await db.whatsAppFlow.findFirst({ where: { id, userId } });
    if (!original) return NextResponse.json({ error: "Flow not found" }, { status: 404 });

    const clone = await db.whatsAppFlow.create({
      data: {
...(userId && { userId }),
        name: `${original.name} (Copy)`,
        screens: original.screens || [],
        definition: original.definition || null,
        categories: original.categories || ['OTHER'],
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ success: true, data: { flow: clone }, message: "Flow cloned" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to clone flow" }, { status: 500 });
  }
}
