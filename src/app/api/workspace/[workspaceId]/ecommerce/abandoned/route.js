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

        const currentUserId = session.user.userId || session.user.id;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        const storeIdParam = searchParams.get("storeId");

        let where = {
            OR: [
                { userId: currentUserId },
                { userId: workspaceId }
            ]
        };

        if (storeIdParam && storeIdParam !== 'all') {
            where.storeId = storeIdParam;
        }

        const abandonedCarts = await db.eCommerceAbandonedCart.findMany({
            where,
            include: {
                store: {
                    select: { id: true, name: true, platform: true, currency: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json({
            success: true,
            abandonedCarts
        });

    } catch (error) {
        console.error("[ECOMMERCE_ABANDONED_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
