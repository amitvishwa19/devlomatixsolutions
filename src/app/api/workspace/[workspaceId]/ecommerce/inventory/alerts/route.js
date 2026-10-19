import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { workspaceId } = await params;
        const currentUserId = session.user.userId || session.user.id;

        const { searchParams } = new URL(req.url);
        const storeIdParam = searchParams.get("storeId") || "all";
        const limit = parseInt(searchParams.get("limit") || "8");

        const stores = await db.eCommerceStore.findMany({
            where: {
                OR: [
                    { userId: currentUserId },
                    { userId: workspaceId }
                ]
            },
            select: { id: true, name: true, platform: true, lowStockThreshold: true }
        });

        let targetStoreIds = stores.map(s => s.id);
        if (storeIdParam !== "all") {
            targetStoreIds = targetStoreIds.filter(id => id === storeIdParam);
        }

        if (targetStoreIds.length === 0) {
            return NextResponse.json({ success: true, alerts: [] });
        }

        // Fetch products with inventory count <= 5 or lowStockThreshold
        const lowStockProducts = await db.eCommerceProduct.findMany({
            where: {
                storeId: { in: targetStoreIds },
                inventoryCount: { lte: 10 }
            },
            include: {
                store: {
                    select: { name: true, platform: true }
                },
                variants: {
                    select: { id: true, name: true, inventoryCount: true }
                }
            },
            orderBy: { inventoryCount: "asc" },
            take: limit
        });

        return NextResponse.json({
            success: true,
            alerts: lowStockProducts
        });

    } catch (error) {
        console.error("[ECOMMERCE_INVENTORY_ALERTS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
