import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function DELETE(req, { params }) {
  try {
    const headersList = await headers();
    const accessToken = headersList.get("Authorization");
    const { userId } = (await decrypt(accessToken)) || {};

    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const { roleId } = await params;

    if (!roleId) {
      return NextResponse.json(
        { status: 400, message: "Role ID is required" },
        { status: 400 }
      );
    }

    await db.role.delete({ where: { id: roleId } });

    return NextResponse.json({ status: 200, message: "Role deleted" });
  } catch (error) {
    console.error("[ACCESS_MANAGEMENT_ROLE_DELETE]", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}
