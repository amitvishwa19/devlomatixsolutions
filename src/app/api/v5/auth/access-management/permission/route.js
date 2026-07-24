import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const headersList = await headers();
    const accessToken = headersList.get("Authorization");
    const { userId } = (await decrypt(accessToken)) || {};

    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { status: 400, message: "Items array is required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const item of items) {
      const { id, value, title, description, category, color, type, url, status } = item;

      if (!value) continue;

      const perm = await db.permission.upsert({
        where: { id: id || "__new__" },
        update: {
          title: title || value,
          description: description || "",
          category: category || "general",
          color: color || "#FFFF",
          type: type || "ACTION",
          url: url || null,
          status: status ?? true,
        },
        create: {
          title: title || value,
          value,
          description: description || "",
          category: category || "general",
          color: color || "#FFFF",
          type: type || "ACTION",
          url: url || null,
          status: status ?? true,
        },
      });

      results.push(perm);
    }

    return NextResponse.json({ status: 200, permissions: results });
  } catch (error) {
    console.error("[ACCESS_MANAGEMENT_PERMISSION_UPSERT]", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error" },
      { status: 500 }
    );
  }
}
