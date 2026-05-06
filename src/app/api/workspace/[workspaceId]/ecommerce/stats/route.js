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

        // Fetch all stores in the workspace first
        const stores = await db.eCommerceStore.findMany({
            where: { userId: workspaceId },
            select: { id: true }
        });
        const storeIds = stores.map(s => s.id);

        if (storeIds.length === 0) {
            return NextResponse.json({
                success: true,
                stats: {
                    totalRevenue: 0,
                    totalOrders: 0,
                    averageOrderValue: 0,
                    totalProducts: 0
                }
            });
        }

        // Fetch aggregated stats
        const [ordersAgg, totalProducts] = await Promise.all([
            db.eCommerceOrder.aggregate({
                where: {
                    storeId: { in: storeIds },
                    status: { not: 'cancelled' } // only count non-cancelled
                },
                _sum: {
                    totalAmount: true
                },
                _count: {
                    id: true
                }
            }),
            db.eCommerceProduct.count({
                where: { storeId: { in: storeIds } }
            })
        ]);

        const totalRevenue = ordersAgg._sum.totalAmount || 0;
        const totalOrders = ordersAgg._count.id || 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                averageOrderValue,
                totalProducts
            }
        });

    } catch (error) {
        console.error("[ECOMMERCE_STATS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
