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
    const interview = await db.interview.findUnique({
      where: { id },
      include: { application: { include: { candidate: true, job: true } } },
    });

    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    return NextResponse.json({ data: interview });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch interview" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { title, startTime, endTime, location, interviewers, status, feedback } = body;

    const existing = await db.interview.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

    const interview = await db.interview.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(interviewers !== undefined && { interviewers }),
        ...(status !== undefined && { status }),
        ...(feedback !== undefined && { feedback }),
      },
      include: { application: { include: { candidate: true, job: true } } },
    });

    return NextResponse.json({ success: true, data: interview });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update interview" }, { status: 500 });
  }
}