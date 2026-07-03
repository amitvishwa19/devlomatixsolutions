import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.warn('[getUserIdFromRequest] No authorization header found');
      return null;
    }
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const payload = await decrypt(token);
    return payload?.userId || null;
  } catch (error) {
    console.error('[getUserIdFromRequest] Error decrypting token:', error);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contact = await db.contact.findFirst({ where: { id, userId }, include: { groups: true } });
    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    return NextResponse.json({ data: contact });
  } catch (error) {
    console.error('[GET_CONTACT_ERROR]', error);
    return NextResponse.json({ error: error.message || "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);

    console.log('[PATCH_CONTACT_DEBUG]', { id, userId, body });

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contact = await db.contact.findFirst({ where: { id, userId } });
    if (!contact) {
      console.warn('[PATCH_CONTACT] Contact not found or mismatch:', { id, userId });
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.info !== undefined) updateData.info = body.info;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.category !== undefined) updateData.category = body.category;

    if (body.groupIds) {
      await db.contact.update({ where: { id }, data: { groups: { set: body.groupIds.map(gid => ({ id: gid })) } } });
    }

    const updated = await db.contact.update({ where: { id }, data: updateData, include: { groups: true } });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[PATCH_CONTACT_ERROR]', error);
    return NextResponse.json({ error: error.message || "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contact = await db.contact.findFirst({ where: { id, userId } });
    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    await db.contact.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Contact deleted" });
  } catch (error) {
    console.error('[DELETE_CONTACT_ERROR]', error);
    return NextResponse.json({ error: error.message || "Failed to delete contact" }, { status: 500 });
  }
}
