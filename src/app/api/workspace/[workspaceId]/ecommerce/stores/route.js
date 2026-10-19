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

    // Create or find Ecommerce category hierarchy
    let storeCategory = null;
    try {
      let ecommerceCategory = await db.category.findFirst({
        where: {
          workspaceId,
          OR: [
            { name: { equals: "Ecommerce", mode: "insensitive" } },
            { slug: "ecommerce" }
          ]
        }
      });

      if (!ecommerceCategory) {
        ecommerceCategory = await db.category.create({
          data: {
            name: "Ecommerce",
            slug: "ecommerce",
            type: "ECOMMERCE",
            color: "#3b82f6",
            workspaceId,
            parentId: null
          }
        });
      }

      let storeSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const existingCatByName = await db.category.findUnique({
        where: {
          workspaceId_name: {
            workspaceId,
            name
          }
        }
      });

      if (existingCatByName) {
        storeCategory = await db.category.update({
          where: { id: existingCatByName.id },
          data: {
            parentId: ecommerceCategory.id,
            storeId: store.id,
            type: "STORE"
          }
        });
      } else {
        const existingSlug = await db.category.findUnique({
          where: {
            workspaceId_slug: {
              workspaceId,
              slug: storeSlug
            }
          }
        });

        if (existingSlug) {
          storeSlug = `${storeSlug}-${store.id.slice(-4)}`;
        }

        storeCategory = await db.category.create({
          data: {
            name,
            slug: storeSlug,
            type: "STORE",
            color: "#10b981",
            parentId: ecommerceCategory.id,
            workspaceId,
            storeId: store.id
          }
        });
      }
    } catch (catError) {
      console.error("[CREATE_ECOMMERCE_CATEGORY_ERROR]", catError);
    }

    return NextResponse.json({ success: true, store, category: storeCategory });
  } catch (error) {
    console.error("[CREATE_STORE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}