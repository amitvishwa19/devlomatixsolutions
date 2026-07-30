import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const { id: categoryName } = await params;

    await db.contact.updateMany({
      where: { type: categoryName },
      data: { type: 'CONTACT' },
    });

    return NextResponse.json({ success: true, message: `Category "${categoryName}" removed from all contacts` });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
