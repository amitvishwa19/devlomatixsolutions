import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const rules = await db.autoResponderRule.findMany({
            orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: { rules: rules || [] } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch auto-responder rules" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { trigger, response, matchType, isActive } = body;

    if (!trigger || !response) {
      return NextResponse.json({ error: "Trigger and response are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const rule = await db.autoResponderRule.create({
      data: { ...(userId && { userId }), trigger, response, matchType: matchType || 'exact', isActive: isActive ?? true },
    });

    return NextResponse.json({ success: true, data: { rule } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create auto-responder rule" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rule id is required" }, { status: 400 });
    }

    const existing = await db.autoResponderRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    const updateData = {};
    if (body.trigger !== undefined) updateData.trigger = body.trigger;
    if (body.response !== undefined) updateData.response = body.response;
    if (body.matchType !== undefined) updateData.matchType = body.matchType;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const rule = await db.autoResponderRule.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: { rule } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update auto-responder rule" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

    await db.autoResponderRule.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Rule deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete rule" }, { status: 500 });
  }
}
