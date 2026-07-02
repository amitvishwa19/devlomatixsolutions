import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const groups = await db.contactGroup.findMany({
            include: { _count: { select: { contacts: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: groups || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

        
    const group = await db.contactGroup.create({
      data: { ...(userId && { userId }), name, description },
    });

    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create group" }, { status: 500 });
  }
}
