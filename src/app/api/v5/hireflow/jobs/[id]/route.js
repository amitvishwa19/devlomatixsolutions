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

export async function GET(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } }, category: true },
    });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json({ data: job });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { title, description, department, location, type, salaryRange, status, requirements } = body;

    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const job = await db.job.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(department !== undefined && { department }),
        ...(location !== undefined && { location }),
        ...(type !== undefined && { type }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(status !== undefined && { status }),
        ...(requirements !== undefined && { requirements }),
      },
      include: { _count: { select: { applications: true } }, category: true },
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    await db.job.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete job" }, { status: 500 });
  }
}