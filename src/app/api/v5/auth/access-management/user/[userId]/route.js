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

    const { userId: targetId } = await params;

    if (!targetId) {
      return NextResponse.json(
        { status: 400, message: "User ID is required" },
        { status: 400 }
      );
    }

    await db.user.delete({ where: { id: targetId } });

    return NextResponse.json({ status: 200, message: "User deleted" });
  } catch (error) {
    console.error("[ACCESS_MANAGEMENT_USER_DELETE]", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}
