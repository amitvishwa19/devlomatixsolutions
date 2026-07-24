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

    const { permissionId } = await params;

    if (!permissionId) {
      return NextResponse.json(
        { status: 400, message: "Permission ID is required" },
        { status: 400 }
      );
    }

    await db.permission.delete({ where: { id: permissionId } });

    return NextResponse.json({ status: 200, message: "Permission deleted" });
  } catch (error) {
    console.error("[ACCESS_MANAGEMENT_PERMISSION_DELETE]", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}
