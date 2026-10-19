import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { 
    authenticateStorefrontRequest, 
    getStorefrontCorsHeaders, 
    handleStorefrontOptions 
} from "@/lib/ecommerce/storefront-auth";
import { formatStorefrontProduct } from "@/lib/ecommerce/storefront-transformer";

export async function OPTIONS() {
    return handleStorefrontOptions();
}

export async function GET(req, { params }) {
    const corsHeaders = getStorefrontCorsHeaders();

    const auth = await authenticateStorefrontRequest(req);
    if (auth.error) {
        return NextResponse.json(
            { success: false, error: auth.error },
            { status: auth.status, headers: corsHeaders }
        );
    }

    const { store } = auth;
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json(
            { success: false, error: "Product slug or ID is required" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const product = await db.eCommerceProduct.findFirst({
            where: {
                storeId: store.id,
                status: "active",
                OR: [
                    { slug: slug },
                    { id: slug },
                ],
            },
            include: {
                variants: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        price: true,
                        inventoryCount: true,
                        weight: true,
                        imageUrls: true,
                    },
                },
                reviews: {
                    where: { status: "approved" },
                    select: {
                        id: true,
                        rating: true,
                        title: true,
                        comment: true,
                        customerName: true,
                        isVerified: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        const formatted = formatStorefrontProduct(product);

        // Fetch related products in the same category
        let relatedProducts = [];
        if (formatted.category) {
            const rawRelated = await db.eCommerceProduct.findMany({
                where: {
                    storeId: store.id,
                    status: "active",
                    id: { not: product.id },
                },
                include: {
                    variants: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            price: true,
                            inventoryCount: true,
                        },
                    },
                    reviews: {
                        where: { status: "approved" },
                        select: { rating: true },
                    },
                },
                take: 4,
            });

            relatedProducts = rawRelated
                .map(formatStorefrontProduct)
                .filter(p => p.category === formatted.category || (p.categories || []).includes(formatted.category))
                .slice(0, 4);
        }

        return NextResponse.json(
            {
                success: true,
                product: {
                    ...formatted,
                    reviewsList: product.reviews || [],
                    relatedProducts,
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[STOREFRONT_PRODUCT_DETAIL_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to load product details" },
            { status: 500, headers: corsHeaders }
        );
    }
}
