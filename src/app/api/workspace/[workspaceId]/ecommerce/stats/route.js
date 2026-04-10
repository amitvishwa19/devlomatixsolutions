import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Get Orders Stats
        const orderStats = await db.eCommerceOrder.aggregate({
            where: { userId: session.user.userId },
            _sum: { totalAmount: true },
            _count: { id: true }
        });

        // Get Abandoned Cart Stats
        const abandonedStats = await db.eCommerceAbandonedCart.aggregate({
            where: { userId: session.user.userId },
            _sum: { totalAmount: true },
            _count: { id: true }
        });

        // Get Store Connections
        const stores = await db.eCommerceStore.count({
            where: { userId: session.user.userId, status: 'connected' }
        });

        // Get recent items for trending data (last 30 days vs previous 30 days could be added later)
        
        return NextResponse.json({
            success: true,
            stats: {
                revenue: {
                    total: orderStats._sum.totalAmount || 0,
                    count: orderStats._count.id || 0
                },
                abandoned: {
                    total: abandonedStats._sum.totalAmount || 0,
                    count: abandonedStats._count.id || 0
                },
                stores: {
                    active: stores
                },
                conversion: {
                    rate: orderStats._count.id > 0 ? ((orderStats._count.id / (orderStats._count.id + abandonedStats._count.id)) * 100).toFixed(1) : 0
                }
            }
        });

    } catch (error) {
        console.error("[ECOMMERCE_STATS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
