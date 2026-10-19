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
        const period = searchParams.get("period") || "30d";

        // Calculate Date Ranges for Current and Previous Comparison Periods
        const now = new Date();
        let currentStartDate = new Date();
        let prevStartDate = new Date();
        let prevEndDate = new Date();

        switch (period) {
            case "today":
                currentStartDate.setHours(0, 0, 0, 0);
                prevStartDate = new Date(currentStartDate);
                prevStartDate.setDate(prevStartDate.getDate() - 1);
                prevEndDate = new Date(currentStartDate);
                break;
            case "7d":
                currentStartDate.setDate(now.getDate() - 7);
                prevStartDate.setDate(now.getDate() - 14);
                prevEndDate = new Date(currentStartDate);
                break;
            case "90d":
                currentStartDate.setDate(now.getDate() - 90);
                prevStartDate.setDate(now.getDate() - 180);
                prevEndDate = new Date(currentStartDate);
                break;
            case "30d":
            default:
                currentStartDate.setDate(now.getDate() - 30);
                prevStartDate.setDate(now.getDate() - 60);
                prevEndDate = new Date(currentStartDate);
                break;
        }

        // Fetch stores owned by user or associated with workspace
        const stores = await db.eCommerceStore.findMany({
            where: {
                OR: [
                    { userId: currentUserId },
                    { userId: workspaceId }
                ]
            },
            select: { id: true, name: true, platform: true, currency: true, lowStockThreshold: true }
        });

        let targetStoreIds = stores.map(s => s.id);
        if (storeIdParam !== "all") {
            targetStoreIds = targetStoreIds.filter(id => id === storeIdParam);
        }

        if (targetStoreIds.length === 0) {
            return NextResponse.json({
                success: true,
                stats: {
                    totalRevenue: 0,
                    revenueDelta: 0,
                    totalOrders: 0,
                    ordersDelta: 0,
                    averageOrderValue: 0,
                    aovDelta: 0,
                    totalProducts: 0,
                    lowStockProducts: 0,
                    unfulfilledOrders: 0,
                    recoverableRevenue: 0,
                    abandonedCartsCount: 0,
                    primaryCurrency: stores[0]?.currency || "INR"
                }
            });
        }

        // Parallel Aggregations: Current Period vs Previous Period
        const [
            currentOrdersAgg,
            prevOrdersAgg,
            unfulfilledCount,
            totalProducts,
            lowStockCount,
            abandonedCartsAgg
        ] = await Promise.all([
            // 1. Current Period Orders & Revenue
            db.eCommerceOrder.aggregate({
                where: {
                    storeId: { in: targetStoreIds },
                    status: { not: 'cancelled' },
                    createdAt: { gte: currentStartDate }
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            }),

            // 2. Previous Period Orders & Revenue (for Delta %)
            db.eCommerceOrder.aggregate({
                where: {
                    storeId: { in: targetStoreIds },
                    status: { not: 'cancelled' },
                    createdAt: { gte: prevStartDate, lt: prevEndDate }
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            }),

            // 3. Unfulfilled Orders Needing Action (All-time pending)
            db.eCommerceOrder.count({
                where: {
                    storeId: { in: targetStoreIds },
                    status: { notIn: ['cancelled', 'completed', 'fulfilled'] },
                    OR: [
                        { fulfillmentStatus: null },
                        { fulfillmentStatus: 'unfulfilled' },
                        { fulfillmentStatus: 'pending' },
                        { fulfillmentStatus: 'processing' }
                    ]
                }
            }),

            // 4. Total Active Products
            db.eCommerceProduct.count({
                where: { storeId: { in: targetStoreIds } }
            }),

            // 5. Low Stock / Stockout alerts (inventory <= 5)
            db.eCommerceProduct.count({
                where: {
                    storeId: { in: targetStoreIds },
                    inventoryCount: { lte: 5 }
                }
            }),

            // 6. Abandoned Carts (Recoverable Revenue)
            db.eCommerceAbandonedCart.aggregate({
                where: {
                    storeId: { in: targetStoreIds },
                    recovered: false
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            })
        ]);

        const currentRevenue = currentOrdersAgg._sum.totalAmount || 0;
        const currentOrders = currentOrdersAgg._count.id || 0;
        const currentAov = currentOrders > 0 ? currentRevenue / currentOrders : 0;

        const prevRevenue = prevOrdersAgg._sum.totalAmount || 0;
        const prevOrders = prevOrdersAgg._count.id || 0;
        const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

        // Calculate Delta Percentages
        const calcDelta = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Number((((curr - prev) / prev) * 100).toFixed(1));
        };

        const revenueDelta = calcDelta(currentRevenue, prevRevenue);
        const ordersDelta = calcDelta(currentOrders, prevOrders);
        const aovDelta = calcDelta(currentAov, prevAov);

        const recoverableRevenue = abandonedCartsAgg._sum.totalAmount || 0;
        const abandonedCartsCount = abandonedCartsAgg._count.id || 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalRevenue: currentRevenue,
                revenueDelta,
                totalOrders: currentOrders,
                ordersDelta,
                averageOrderValue: currentAov,
                aovDelta,
                totalProducts,
                lowStockProducts: lowStockCount,
                unfulfilledOrders: unfulfilledCount,
                recoverableRevenue,
                abandonedCartsCount,
                primaryCurrency: stores[0]?.currency || "INR"
            }
        });

    } catch (error) {
        console.error("[ECOMMERCE_STATS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
