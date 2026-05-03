import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

export async function POST(request) {
  try {
    const body = await request.json();
    const { apiKey, action } = body;

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: "API key is required" 
      }, { status: 400 });
    }

    const stores = await db.eCommerceStore.findMany({
      where: { status: "connected" }
    });

    let matchedStore = null;
    for (const store of stores) {
      if (store.apiKey) {
        try {
          const decryptedKey = symmetricDecrypt(store.apiKey);
          if (decryptedKey === apiKey) {
            matchedStore = store;
            break;
          }
        } catch (e) {
          console.error("Decryption error for store:", store.id, e.message);
        }
      }
    }

    if (!matchedStore) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid API key" 
      }, { status: 401 });
    }

    const response = {
      success: true,
      store: {
        id: matchedStore.id,
        name: matchedStore.name,
        platform: matchedStore.platform,
        storeUrl: matchedStore.storeUrl,
        logo: matchedStore.logo,
        currency: matchedStore.currency,
      }
    };

    if (action === 'validate') {
      return NextResponse.json(response);
    }

    if (action === 'products') {
      const products = await db.eCommerceProduct.findMany({
        where: { storeId: matchedStore.id },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      return NextResponse.json({ success: true, products });
    }

    if (action === 'orders') {
      const orders = await db.eCommerceOrder.findMany({
        where: { storeId: matchedStore.id },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      return NextResponse.json({ success: true, orders });
    }

    if (action === 'stats') {
      const totalProducts = await db.eCommerceProduct.count({
        where: { storeId: matchedStore.id }
      });
      const totalOrders = await db.eCommerceOrder.count({
        where: { storeId: matchedStore.id }
      });
      const totalRevenue = await db.eCommerceOrder.aggregate({
        where: { storeId: matchedStore.id },
        _sum: { totalAmount: true }
      });
      
      return NextResponse.json({
        success: true,
        stats: {
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0
        }
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("[API_AUTH_ERROR]", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
}