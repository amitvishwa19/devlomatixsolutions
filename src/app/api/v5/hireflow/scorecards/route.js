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
    const { applicationId, candidateId, stage, score, feedback, recommendation, attributes } = body;

    if (!candidateId) {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }

    const scorecard = await db.scorecard.create({
      data: {
        applicationId: applicationId || null,
        candidateId,
        interviewerId: userId,
        stage: stage || null,
        score: score || 0,
        feedback: feedback || null,
        recommendation: recommendation || null,
        attributes: attributes || null,
      },
      include: { candidate: true, interviewer: true, application: { include: { job: true } } },
    });

    return NextResponse.json({ success: true, data: scorecard }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create scorecard" }, { status: 500 });
  }
}