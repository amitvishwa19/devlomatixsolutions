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

export async function GET(request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where = { userId };
    if (workspaceId) where.workspaceId = workspaceId;

    const [quotations, total] = await Promise.all([
      db.quotation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          quotationNumber: true,
          clientName: true,
          total: true,
          status: true,
          data: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.quotation.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { quotations, total, page, limit } }, { status: 200 });
  } catch (error) {
    console.error("GET quotations error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { quotationNumber, clientName, total, status, data, workspaceId } = body;

    if (!quotationNumber) {
      return NextResponse.json({ error: "quotationNumber is required" }, { status: 400 });
    }

    const quotation = await db.quotation.create({
      data: {
        userId,
        workspaceId: workspaceId || null,
        quotationNumber,
        clientName: clientName || null,
        total: total || 0,
        status: status || "draft",
        data: data || {},
      },
    });

    return NextResponse.json({ success: true, data: { quotation } }, { status: 201 });
  } catch (error) {
    console.error("POST quotation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create quotation" }, { status: 500 });
  }
}
