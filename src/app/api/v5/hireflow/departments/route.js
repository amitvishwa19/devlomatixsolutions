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

    const departments = await db.department.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: departments });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, description, workspaceId } = body;

    if (!name || !workspaceId) {
      return NextResponse.json({ error: "Name and workspaceId are required" }, { status: 400 });
    }

    const existing = await db.department.findUnique({
      where: { workspaceId_name: { workspaceId, name } },
    });
    if (existing) {
      return NextResponse.json({ error: "Department already exists" }, { status: 409 });
    }

    const department = await db.department.create({
      data: { name, description, workspaceId, userId },
    });

    return NextResponse.json({ success: true, data: department }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create department" }, { status: 500 });
  }
}