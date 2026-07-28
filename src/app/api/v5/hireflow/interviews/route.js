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

    const interviews = await db.interview.findMany({
      where: { application: { workspaceId } },
      orderBy: { startTime: "desc" },
      include: {
        application: { include: { candidate: true, job: true } },
      },
    });

    return NextResponse.json({ data: interviews });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch interviews" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { applicationId, title, startTime, endTime, location, interviewers, status } = body;

    if (!applicationId || !title || !startTime) {
      return NextResponse.json({ error: "applicationId, title, and startTime are required" }, { status: 400 });
    }

    const interview = await db.interview.create({
      data: {
        applicationId,
        title,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : new Date(new Date(startTime).getTime() + 60 * 60 * 1000),
        location: location || null,
        interviewers: interviewers || [],
        status: status || "SCHEDULED",
      },
      include: { application: { include: { candidate: true, job: true } } },
    });

    return NextResponse.json({ success: true, data: interview }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create interview" }, { status: 500 });
  }
}