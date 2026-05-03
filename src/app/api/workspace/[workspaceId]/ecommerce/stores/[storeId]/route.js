import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  const { workspaceId, storeId } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await db.eCommerceStore.findFirst({
      where: { id: storeId, userId: session.user.userId }
    });

    if (!store) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error("[GET_STORE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { workspaceId, storeId } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, platform, storeUrl, logo, currency, timezone, isDefault, accessToken, apiKey, apiSecret, status } = body;

    const existingStore = await db.eCommerceStore.findFirst({
      where: { id: storeId, userId: session.user.userId }
    });

    if (!existingStore) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    if (isDefault) {
      await db.eCommerceStore.updateMany({
        where: { userId: session.user.userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const store = await db.eCommerceStore.update({
      where: { id: storeId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(platform && { platform }),
        ...(storeUrl && { storeUrl }),
        ...(logo !== undefined && { logo }),
        ...(currency && { currency }),
        ...(timezone && { timezone }),
        ...(isDefault !== undefined && { isDefault }),
        ...(accessToken !== undefined && { accessToken }),
        ...(apiKey !== undefined && { apiKey }),
        ...(apiSecret !== undefined && { apiSecret }),
        ...(status && { status })
      }
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error("[UPDATE_STORE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { workspaceId, storeId } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingStore = await db.eCommerceStore.findFirst({
      where: { id: storeId, userId: session.user.userId }
    });

    if (!existingStore) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    await db.eCommerceStore.delete({
      where: { id: storeId }
    });

    return NextResponse.json({ success: true, message: "Store deleted" });
  } catch (error) {
    console.error("[DELETE_STORE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}