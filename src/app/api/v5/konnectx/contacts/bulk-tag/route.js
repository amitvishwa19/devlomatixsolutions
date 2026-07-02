import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { ids, tag } = body;

    if (!ids?.length || !tag) {
      return NextResponse.json({ error: "Contact IDs and tag are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const contacts = await db.contact.findMany({ where: { id: { in: ids }, userId } });

    await Promise.all(contacts.map(c => {
      const existingTags = c.tags || [];
      if (existingTags.includes(tag)) return Promise.resolve();
      return db.contact.update({ where: { id: c.id }, data: { tags: [...existingTags, tag] } });
    }));

    return NextResponse.json({ success: true, count: contacts.length });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to tag contacts" }, { status: 500 });
  }
}
