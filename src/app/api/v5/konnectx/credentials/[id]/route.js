import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
        const { id } = params;

    const userId = searchParams.get("userId");

    const credential = await db.credentials.findFirst({ where: { id, userId } });
    if (!credential) return NextResponse.json({ error: "Credential not found" }, { status: 404 });

    await db.credentials.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Credential deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete credential" }, { status: 500 });
  }
}
