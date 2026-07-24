import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req) {
  try {
    const headersList = await headers();
    const accessToken = headersList.get("Authorization");
    const { userId } = (await decrypt(accessToken)) || {};

    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const [users, roles, permissions] = await Promise.all([
      db.user.findMany({
        include: {
          roles: true,
          profile: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.role.findMany({
        include: {
          permissions: true,
          _count: { select: { users: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.permission.findMany({
        orderBy: [{ category: "asc" }, { value: "asc" }],
      }),
    ]);

    const mappedUsers = users.map((u) => ({
      id: u.id,
      name: u.displayName || u.email?.split("@")[0] || "Unknown",
      email: u.email || "",
      status: u.isVerified ? "active" : "pending",
      color: u.roles?.[0]?.color || "#6b7280",
      roles: u.roles?.map((r) => r.title) || [],
      roleIds: u.roles?.map((r) => r.id) || [],
      lastActive: u.lastActive,
    }));

    const mappedRoles = roles.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      color: r.color || "#6b7280",
      status: r.status,
      permissionCount: r.permissions?.length || 0,
      userCount: r._count?.users || 0,
      permissions: r.permissions?.map((p) => p.id) || [],
      parentId: r.parentId,
    }));

    const groupedPermissions = {};
    permissions.forEach((p) => {
      const cat = p.category || "general";
      if (!groupedPermissions[cat]) {
        groupedPermissions[cat] = {
          module: p.title?.split(".")[0] || cat,
          category: cat,
          color: p.color || "#6b7280",
          actions: {},
        };
      }
      const action = p.value?.split(".").pop() || p.value;
      groupedPermissions[cat].actions[action] = p.status;
    });

    return NextResponse.json({
      status: 200,
      data: {
        users: mappedUsers,
        roles: mappedRoles,
        permissions: Object.values(groupedPermissions),
        stats: {
          totalUsers: mappedUsers.length,
          totalRoles: mappedRoles.length,
          totalPermissions: permissions.length,
          activePermissions: permissions.filter((p) => p.status).length,
        },
      },
    });
  } catch (error) {
    console.error("[ACCESS_MANAGEMENT_GET]", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}
