import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizePhone(phone) {
  return String(phone || "").replace(/[\s().-]/g, "");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids?.length) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 });
    }

    const contacts = await db.contact.findMany({ where: { id: { in: ids } } });
    let formatted = 0;

    await Promise.all(contacts.map(c => {
      const clean = normalizePhone(c.phone);
      if (clean !== c.phone) {
        formatted++;
        return db.contact.update({ where: { id: c.id }, data: { phone: clean } });
      }
      return Promise.resolve();
    }));

    return NextResponse.json({ success: true, message: `${formatted} contacts formatted`, count: formatted });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to format contacts" }, { status: 500 });
  }
}
