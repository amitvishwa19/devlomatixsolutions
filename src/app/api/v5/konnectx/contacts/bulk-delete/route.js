import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids?.length) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const result = await db.contact.deleteMany({ where: { id: { in: ids }, userId } });

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete contacts" }, { status: 500 });
  }
}
