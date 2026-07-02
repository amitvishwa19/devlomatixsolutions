import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { contactIds, groupId } = body;

    if (!contactIds?.length || !groupId) {
      return NextResponse.json({ error: "Contact IDs and group ID are required" }, { status: 400 });
    }

    await Promise.all(contactIds.map(id =>
      db.contact.update({ where: { id }, data: { groups: { connect: { id: groupId } } } })
    ));

    return NextResponse.json({ success: true, count: contactIds.length });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to add contacts to group" }, { status: 500 });
  }
}
