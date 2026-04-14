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

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");

        let where = { userId: session.user.userId };
        if (status && status !== 'ALL') {
            where.status = status;
        }

        const orders = await db.eCommerceOrder.findMany({
            where,
            include: {
                store: {
                    select: { name: true, platform: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("[ECOMMERCE_ORDERS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
