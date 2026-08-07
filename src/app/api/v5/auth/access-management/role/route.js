import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { slug } from "@/utils/functions";

export async function POST(req) {
  try {
    const headersList = await headers();
    const accessToken = headersList.get("Authorization");
    const { userId } = (await decrypt(accessToken)) || {};

    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const body = await req.json();
    const { id, title, description, color, permissions, parentId } = body;

    if (!title) {
      return NextResponse.json(
        { status: 400, message: "Title is required" },
        { status: 400 }
      );
    }

    const roleData = {
      title,
      slug: slug(title),
      description: description || "",
      color: color || "#6b7280",
      status: true,
    };

    if (parentId) {
      roleData.parentId = parentId;
    }

    const permissionIds = Array.isArray(permissions)
      ? permissions
          .map((p) => (typeof p === "string" ? p : p.id || p))
          .filter(Boolean)
      : [];

    const role = await db.role.upsert({
      where: { id: id || "__new__" },
      update: {
        ...roleData,
        permissions: {
          set: permissionIds.map((pid) => ({ id: pid })),
        },
      },
      create: {
        ...roleData,
        permissions: {
          connect: permissionIds.map((pid) => ({ id: pid })),
        },
      },
      include: { permissions: true, _count: { select: { users: true } } },
    });

    return NextResponse.json({ status: 200, role });
  } catch (error) {
    console.error("[ACCESS_MANAGEMENT_ROLE_UPSERT]", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}
