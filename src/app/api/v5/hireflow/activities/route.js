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
    const candidateId = searchParams.get("candidateId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

    const where = { candidate: { workspaceId }, ...(candidateId && { candidateId }) };

    const scorecards = await db.scorecard.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { candidate: true, interviewer: true, application: { include: { job: true } } },
    });

    const notes = await db.atsNote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: true, application: { include: { job: true } } },
    });

    const activities = [
      ...scorecards.map((s) => ({
        id: `sc-${s.id}`,
        type: "scorecard",
        action: `Scorecard submitted: ${s.score ? `${s.score}/5` : "N/A"}`,
        date: s.createdAt.toISOString(),
        user: s.interviewer?.name || "System",
      })),
      ...notes.map((n) => ({
        id: `note-${n.id}`,
        type: "note",
        action: `Note added: ${n.text.substring(0, 60)}${n.text.length > 60 ? "..." : ""}`,
        date: n.createdAt.toISOString(),
        user: n.user?.name || "System",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

    return NextResponse.json({ data: activities });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch activities" }, { status: 500 });
  }
}