import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const payload = await decrypt(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const quotation = await db.quotation.findFirst({
      where: { id, userId },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { quotation } }, { status: 200 });
  } catch (error) {
    console.error("GET quotation error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch quotation" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await db.quotation.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const body = await request.json();
    const { quotationNumber, clientName, total, status, data, workspaceId } = body;

    const quotation = await db.quotation.update({
      where: { id },
      data: {
        ...(quotationNumber && { quotationNumber }),
        ...(clientName !== undefined && { clientName }),
        ...(total !== undefined && { total }),
        ...(status && { status }),
        ...(data && { data }),
        ...(workspaceId !== undefined && { workspaceId }),
      },
    });

    return NextResponse.json({ success: true, data: { quotation } }, { status: 200 });
  } catch (error) {
    console.error("PUT quotation error:", error);
    return NextResponse.json({ error: error.message || "Failed to update quotation" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await db.quotation.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    await db.quotation.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Quotation deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE quotation error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete quotation" }, { status: 500 });
  }
}
