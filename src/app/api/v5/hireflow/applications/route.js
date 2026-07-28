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
    const jobId = searchParams.get("jobId");

    if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

    const where = { workspaceId, ...(jobId && { jobId }) };

    const applications = await db.jobApplication.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        candidate: true,
        job: true,
        interviews: { orderBy: { startTime: "asc" } },
        scorecards: { orderBy: { createdAt: "desc" } },
        notes: { include: { user: true }, orderBy: { createdAt: "desc" } },
        offers: true,
      },
    });

    return NextResponse.json({ data: applications });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { jobId, candidateId, stage, source, workspaceId } = body;

    if (!jobId || !candidateId || !workspaceId) {
      return NextResponse.json({ error: "jobId, candidateId, and workspaceId are required" }, { status: 400 });
    }

    const existing = await db.jobApplication.findFirst({
      where: { jobId, candidateId, workspaceId },
    });
    if (existing) {
      return NextResponse.json({ error: "Candidate already applied to this job" }, { status: 409 });
    }

    const application = await db.jobApplication.create({
      data: { jobId, candidateId, stage: stage || "APPLIED", source, workspaceId },
      include: { candidate: true, job: true },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create application" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { applicationId, stage } = body;

    if (!applicationId || !stage) {
      return NextResponse.json({ error: "applicationId and stage are required" }, { status: 400 });
    }

    const application = await db.jobApplication.update({
      where: { id: applicationId },
      data: { stage },
      include: { candidate: true, job: true },
    });

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update application stage" }, { status: 500 });
  }
}