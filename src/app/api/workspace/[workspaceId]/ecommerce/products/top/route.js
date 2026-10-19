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
        const limit = parseInt(searchParams.get("limit") || "5");

        const stores = await db.eCommerceStore.findMany({
            where: {
                OR: [
                    { userId: currentUserId },
                    { userId: workspaceId }
                ]
            },
            select: { id: true, name: true, platform: true }
        });

        let targetStoreIds = stores.map(s => s.id);
        if (storeIdParam !== "all") {
            targetStoreIds = targetStoreIds.filter(id => id === storeIdParam);
        }

        if (targetStoreIds.length === 0) {
            return NextResponse.json({ success: true, products: [] });
        }

        const products = await db.eCommerceProduct.findMany({
            where: {
                storeId: { in: targetStoreIds }
            },
            include: {
                store: {
                    select: { name: true, platform: true, currency: true }
                },
                variants: {
                    select: { id: true, price: true, inventoryCount: true }
                },
                reviews: {
                    select: { rating: true }
                }
            },
            orderBy: [
                { createdAt: "desc" }
            ],
            take: limit
        });

        // Compute average rating and format images
        const formattedProducts = products.map(prod => {
            const reviewCount = prod.reviews?.length || 0;
            const avgRating = reviewCount > 0
                ? prod.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                : 5.0;

            let images = [];
            if (Array.isArray(prod.imageUrls)) {
                images = prod.imageUrls;
            } else if (typeof prod.imageUrls === 'string') {
                try { images = JSON.parse(prod.imageUrls); } catch (e) { images = [prod.imageUrls]; }
            }

            return {
                id: prod.id,
                title: prod.title,
                sku: prod.sku || 'N/A',
                price: prod.price,
                currency: prod.currency || prod.store?.currency || 'INR',
                inventoryCount: prod.inventoryCount ?? 0,
                rating: Number(avgRating.toFixed(1)),
                reviewCount,
                thumbnail: images[0] || null,
                storeName: prod.store?.name || 'Store',
                platform: prod.store?.platform || 'manual'
            };
        });

        return NextResponse.json({
            success: true,
            products: formattedProducts
        });

    } catch (error) {
        console.error("[ECOMMERCE_TOP_PRODUCTS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
