import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { contactIds, category } = body;

    if (!contactIds?.length) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 });
    }

    const result = await db.contact.updateMany({
      where: { id: { in: contactIds } },
      data: { type: category }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}
