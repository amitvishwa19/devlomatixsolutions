import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const groupId = searchParams.get("groupId");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const userId = searchParams.get("userId");

    const where = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (groupId) {
      where.groups = { some: { id: groupId } };
    }

    const skip = (page - 1) * limit;
    const [contacts, total] = await Promise.all([
      db.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { groups: true } }),
      db.contact.count({ where }),
    ]);

    return NextResponse.json({ data: contacts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, type, groupIds, info, tags, userId: bodyUserId } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || bodyUserId;

    const existing = await db.contact.findFirst({
      where: { phone, userId },
    });

    const contact = await db.contact.create({
      data: {
        ...(userId && { userId }),
        name,
        phone,
        email: email || null,
        type: type || 'CONTACT',
        info: info || {},
        tags: tags || [],
        groups: groupIds?.length ? { connect: groupIds.map(id => ({ id })) } : undefined,
      },
      include: { groups: true },
    });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create contact" }, { status: 500 });
  }
}
