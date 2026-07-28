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
    const candidate = await db.candidate.findUnique({
      where: { id },
      include: {
        applications: { include: { job: true, scorecards: { include: { interviewer: true } }, interviews: true, notes: { include: { user: true } }, offers: true }, orderBy: { appliedAt: "desc" } },
        scorecards: { include: { application: { include: { job: true } }, interviewer: true }, orderBy: { createdAt: "desc" } },
        notes: { include: { user: true, application: { include: { job: true } } }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    return NextResponse.json({ data: candidate });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch candidate" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, location, skills, summary, resumeUrl } = body;

    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    const candidate = await db.candidate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(skills !== undefined && { skills }),
        ...(summary !== undefined && { summary }),
        ...(resumeUrl !== undefined && { resumeUrl }),
      },
    });

    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update candidate" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    await db.candidate.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Candidate deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete candidate" }, { status: 500 });
  }
}