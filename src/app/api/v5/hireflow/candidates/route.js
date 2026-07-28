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

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

    const candidates = await db.candidate.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        applications: { include: { job: true }, orderBy: { appliedAt: "desc" }, take: 1 },
        scorecards: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ data: candidates });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, email, phone, location, skills, summary, source, resumeUrl, workspaceId } = body;

    if (!name || !email || !workspaceId) {
      return NextResponse.json({ error: "Name, email, and workspaceId are required" }, { status: 400 });
    }

    const existing = await db.candidate.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Candidate with this email already exists" }, { status: 409 });
    }

    const candidate = await db.candidate.create({
      data: { name, email, phone, location, skills: skills || [], summary, resumeUrl, workspaceId, userId },
    });

    return NextResponse.json({ success: true, data: candidate }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create candidate" }, { status: 500 });
  }
}