import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || 'CONTACT';
    const userId = searchParams.get("userId");

    const where = { type };
    if (userId) where.userId = userId;

    const categories = await db.contact.findMany({
      where,
      select: { type: true, tags: true },
    });

    const uniqueTypes = [...new Set(categories.map(c => c.type).filter(Boolean))];
    const uniqueTags = [...new Set(categories.flatMap(c => c.tags || []))];

    return NextResponse.json({ data: { types: uniqueTypes, tags: uniqueTags } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}
