import { NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveEffectiveWorkspaceId } from "@/app/api/v5/_lib/workspace-resolver";

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

    const workspaceId = await resolveEffectiveWorkspaceId(userId, request);
    if (!workspaceId) return NextResponse.json({ error: "Could not resolve workspace" }, { status: 400 });

    const jobs = await db.job.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } }, category: true },
    });

    return NextResponse.json({ data: jobs });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, department, location, type, salaryRange, status, requirements } = body;
    const workspaceId = await resolveEffectiveWorkspaceId(userId, request, body);

    if (!title || !workspaceId) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const job = await db.job.create({
      data: {
        title,
        description: description || "",
        department: department || null,
        location: location || null,
        type: type || "FULL_TIME",
        salaryRange: salaryRange || null,
        status: status || "DRAFT",
        requirements: requirements || [],
        workspaceId,
        userId,
        category: department ? {
          connectOrCreate: {
            where: { workspaceId_name: { workspaceId, name: department } },
            create: { name: department, slug: department.toLowerCase().replace(/\s+/g, "-"), workspaceId },
          },
        } : undefined,
      },
      include: { _count: { select: { applications: true } }, category: true },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}