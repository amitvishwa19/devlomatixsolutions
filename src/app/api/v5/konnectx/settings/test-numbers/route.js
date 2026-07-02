import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const { testNumbers } = body;

    const userId = searchParams.get("userId");

    await db.workspaceMetadata.upsert({
            update: { testNumbers },
      create: { testNumbers },
    });

    return NextResponse.json({ success: true, message: "Test numbers updated" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update test numbers" }, { status: 500 });
  }
}
