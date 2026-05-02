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
        const limit = parseInt(searchParams.get("limit") || "100");

        // Use workspaceId directly for products
        const products = await db.eCommerceProduct.findMany({
            where: { userId: workspaceId },
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
            products
        });

    } catch (error) {
        console.error("[ECOMMERCE_PRODUCTS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, sku, price, discount, quantity, status, category, imageUrl } = body;

        const product = await db.eCommerceProduct.create({
            data: {
                title,
                description,
                sku,
                price: parseFloat(price),
                discount: parseFloat(discount || 0),
                inventoryCount: parseInt(quantity || 0),
                status: status || "active",
                imageUrl,
                userId: session.user.userId,
                // Optional: Store category in metadata or another field if available
                metadata: { category }
            }
        });

        return NextResponse.json({
            success: true,
            product
        });

    } catch (error) {
        console.error("[ECOMMERCE_PRODUCT_CREATE_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
