import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { contactsData, userId: bodyUserId } = body;

    if (!contactsData?.length) {
      return NextResponse.json({ error: "Contacts data is required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let created = 0;
    const errors = [];

    for (const contact of contactsData) {
      try {
    const { searchParams } = new URL(request.url);
        const phone = String(contact.phone || "").replace(/[\s().-]/g, "");
        if (!phone) continue;

        const existing = await db.contact.findUnique({ where: { phone } });
        if (existing) continue;

        const tags = contact.tags ? String(contact.tags).split("|").map(t => t.trim()).filter(Boolean) : [];

        await db.contact.create({
          data: {
...(userId && { userId }),
            name: contact.name || phone,
            phone,
            email: contact.email || null,
            type: contact.category || 'CONTACT',
            tags,
          },
        });
        created++;
      } catch (e) {
        errors.push({ phone: contact.phone, error: e.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${created} contacts`,
      created,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to import contacts" }, { status: 500 });
  }
}
