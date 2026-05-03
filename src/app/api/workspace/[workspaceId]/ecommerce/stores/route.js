import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  const { workspaceId } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const stores = await db.eCommerceStore.findMany({
      where: { userId: session.user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, stores });
  } catch (error) {
    console.error("[GET_STORES_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { workspaceId } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, platform, storeUrl, logo, currency, timezone, accessToken, apiKey, apiSecret } = body;

    if (!name || !platform || !storeUrl) {
      return NextResponse.json({ success: false, message: "Name, platform and store URL are required" }, { status: 400 });
    }

    const existingDefault = await db.eCommerceStore.findFirst({
      where: { userId: session.user.userId, isDefault: true }
    });

    const store = await db.eCommerceStore.create({
      data: {
        userId: session.user.userId,
        name,
        description,
        platform,
        storeUrl,
        logo,
        currency: currency || "INR",
        timezone: timezone || "Asia/Kolkata",
        isDefault: !existingDefault,
        accessToken,
        apiKey,
        apiSecret,
        status: "connected"
      }
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error("[CREATE_STORE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}