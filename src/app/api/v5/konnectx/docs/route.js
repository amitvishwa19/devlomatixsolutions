import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

    const where = {};
    if (category) where.category = category;

    const documents = await db.workspaceDocument.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: { documents: documents || [] } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const doc = await db.workspaceDocument.create({
      data: { ...(userId && { userId }), title, content, category: category || 'GENERAL' },
    });

    return NextResponse.json({ success: true, data: { document: doc } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create document" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

    await db.workspaceDocument.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete document" }, { status: 500 });
  }
}
