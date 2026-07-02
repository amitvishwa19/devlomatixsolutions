import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const flows = await db.whatsAppFlow.findMany({
            orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: { flows: flows || [] } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch flows" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, screens, definition, categories } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const flow = await db.whatsAppFlow.create({
      data: {
...(userId && { userId }),
        name,
        screens: screens || [],
        definition: definition || null,
        categories: categories || ['OTHER'],
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ success: true, data: { flow } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create flow" }, { status: 500 });
  }
}
