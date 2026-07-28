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
    const { applicationId, candidateId, text, isPrivate } = body;

    if ((!applicationId && !candidateId) || !text) {
      return NextResponse.json({ error: "text and either applicationId or candidateId are required" }, { status: 400 });
    }

    const note = await db.atsNote.create({
      data: {
        applicationId: applicationId || null,
        candidateId: candidateId || applicationId ? undefined : null,
        userId,
        text,
        isPrivate: isPrivate || false,
      },
      include: { user: true, candidate: true, application: { include: { job: true } } },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create note" }, { status: 500 });
  }
}