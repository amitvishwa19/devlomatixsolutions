import { NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserId(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  const payload = await decrypt(token);
  return payload?.userId || null;
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { applicationId, salary, startDate } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
    }

    const offer = await db.offer.create({
      data: {
        applicationId,
        salary: salary || null,
        startDate: startDate ? new Date(startDate) : null,
        status: "DRAFT",
      },
      include: { application: { include: { candidate: true, job: true } } },
    });

    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create offer" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { offerId, salary, startDate, status, offerLetterUrl } = body;

    if (!offerId) {
      return NextResponse.json({ error: "offerId is required" }, { status: 400 });
    }

    const offer = await db.offer.update({
      where: { id: offerId },
      data: {
        ...(salary !== undefined && { salary }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(status !== undefined && { status }),
        ...(offerLetterUrl !== undefined && { offerLetterUrl }),
      },
      include: { application: { include: { candidate: true, job: true } } },
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update offer" }, { status: 500 });
  }
}