import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcryptjs from "bcryptjs";

export async function POST(req) {
  try {
    const headersList = await headers();
    const accessToken = headersList.get("Authorization");
    const { userId } = (await decrypt(accessToken)) || {};

    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const body = await req.json();
    const { id, name, email, password, roles, status } = body;

    if (!email) {
      return NextResponse.json(
        { status: 400, message: "Email is required" },
        { status: 400 }
      );
    }

    const updateData = {
      displayName: name || email.split("@")[0],
      email,
      isVerified: status === "active",
      isActive: true,
    };

    if (password) {
      updateData.password = await bcryptjs.hash(password, 10);
    }

    const roleIds = Array.isArray(roles)
      ? roles
          .map((r) => (typeof r === "string" ? r : r.id || r))
          .filter(Boolean)
      : [];

    const user = await db.user.upsert({
      where: { id: id || "__new__" },
      update: {
        ...updateData,
        roles: {
          set: roleIds.map((rid) => ({ id: rid })),
        },
      },
      create: {
        displayName: name || email.split("@")[0],
        email,
        password: password
          ? await bcryptjs.hash(password, 10)
          : undefined,
        isVerified: status === "active",
        isActive: true,
        roles: {
          connect: roleIds.map((rid) => ({ id: rid })),
        },
      },
      include: { roles: true, profile: true },
    });

    return NextResponse.json({ status: 200, user });
  } catch (error) {
    console.error("[ACCESS_MANAGEMENT_USER_UPSERT]", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}
