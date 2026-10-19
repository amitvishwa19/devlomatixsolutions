import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { format, subDays, startOfDay, eachDayOfInterval, eachHourOfInterval, subHours } from "date-fns";

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

        // Find relevant stores
        const stores = await db.eCommerceStore.findMany({
            where: {
                OR: [
                    { userId: currentUserId },
                    { userId: workspaceId }
                ]
            },
            select: { id: true }
        });

        let targetStoreIds = stores.map(s => s.id);
        if (storeIdParam !== "all") {
            targetStoreIds = targetStoreIds.filter(id => id === storeIdParam);
        }

        const now = new Date();
        let startDate;
        let intervals = [];
        let intervalType = "day"; // "hour" or "day"

        if (period === "today") {
            startDate = startOfDay(now);
            intervalType = "hour";
            intervals = eachHourOfInterval({ start: startDate, end: now });
        } else if (period === "7d") {
            startDate = startOfDay(subDays(now, 6));
            intervals = eachDayOfInterval({ start: startDate, end: now });
        } else if (period === "90d") {
            startDate = startOfDay(subDays(now, 89));
            intervals = eachDayOfInterval({ start: startDate, end: now });
        } else {
            // default 30d
            startDate = startOfDay(subDays(now, 29));
            intervals = eachDayOfInterval({ start: startDate, end: now });
        }

        if (targetStoreIds.length === 0) {
            // Return empty zero-filled timeline
            const emptyData = intervals.map(item => ({
                label: intervalType === "hour" ? format(item, "ha") : format(item, "MMM dd"),
                date: item.toISOString(),
                revenue: 0,
                orders: 0
            }));
            return NextResponse.json({ success: true, data: emptyData });
        }

        // Fetch all orders within the time range
        const orders = await db.eCommerceOrder.findMany({
            where: {
                storeId: { in: targetStoreIds },
                status: { not: "cancelled" },
                createdAt: { gte: startDate }
            },
            select: {
                totalAmount: true,
                createdAt: true
            }
        });

        // Group orders into intervals
        const aggregatedMap = new Map();

        // Initialize all intervals with 0
        intervals.forEach(intervalDate => {
            const key = intervalType === "hour" 
                ? format(intervalDate, "yyyy-MM-dd HH")
                : format(intervalDate, "yyyy-MM-dd");
            const label = intervalType === "hour"
                ? format(intervalDate, "ha")
                : format(intervalDate, "MMM dd");
            
            aggregatedMap.set(key, {
                date: intervalDate.toISOString(),
                label,
                revenue: 0,
                orders: 0
            });
        });

        // Sum up orders
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const key = intervalType === "hour"
                ? format(orderDate, "yyyy-MM-dd HH")
                : format(orderDate, "yyyy-MM-dd");
            
            if (aggregatedMap.has(key)) {
                const entry = aggregatedMap.get(key);
                entry.revenue += (order.totalAmount || 0);
                entry.orders += 1;
            }
        });

        const chartData = Array.from(aggregatedMap.values()).map(item => ({
            ...item,
            revenue: Math.round(item.revenue)
        }));

        return NextResponse.json({
            success: true,
            data: chartData
        });

    } catch (error) {
        console.error("[ECOMMERCE_CHART_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
