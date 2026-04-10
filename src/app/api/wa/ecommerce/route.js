import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session.user.userId || session.user.id;
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const stores = await db.eCommerceStore.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { orders: true, products: true, abandonedCarts: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: stores });
    } catch (error) {
        console.error("[ECOMMERCE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { name, platform, storeUrl, apiKey, apiSecret, accessToken } = body;

        if (!name || !platform || !storeUrl) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const store = await db.eCommerceStore.create({
            data: {
                userId: user.id,
                name,
                platform,
                storeUrl,
                apiKey,
                apiSecret,
                accessToken,
                status: "connected"
            }
        });

        return NextResponse.json({ success: true, data: store });
    } catch (error) {
        console.error("[ECOMMERCE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
