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

export async function GET(req) {
    const corsHeaders = getStorefrontCorsHeaders();

    const auth = await authenticateStorefrontRequest(req);
    if (auth.error) {
        return NextResponse.json(
            { success: false, error: auth.error },
            { status: auth.status, headers: corsHeaders }
        );
    }

    const { store } = auth;
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const inStockOnly = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24")));

    try {
        const where = {
            storeId: store.id,
            status: "active",
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
            ];
        }

        if (minPrice > 0 || maxPrice > 0) {
            where.price = {};
            if (minPrice > 0) where.price.gte = minPrice;
            if (maxPrice > 0) where.price.lte = maxPrice;
        }

        if (inStockOnly) {
            where.inventoryCount = { gt: 0 };
        }

        let orderBy = [{ createdAt: "desc" }];
        switch (sort) {
            case "price-asc":
                orderBy = [{ price: "asc" }];
                break;
            case "price-desc":
                orderBy = [{ price: "desc" }];
                break;
            case "newest":
                orderBy = [{ createdAt: "desc" }];
                break;
            case "featured":
            default:
                orderBy = [{ createdAt: "desc" }];
                break;
        }

        const [total, rawProducts] = await Promise.all([
            db.eCommerceProduct.count({ where }),
            db.eCommerceProduct.findMany({
                where,
                include: {
                    variants: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            price: true,
                            inventoryCount: true,
                            weight: true,
                        },
                    },
                    reviews: {
                        where: { status: "approved" },
                        select: { rating: true },
                    },
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        let formatted = rawProducts.map(formatStorefrontProduct);

        // Filter category if specified (supports slug and name matching)
        if (category && category !== "all") {
            const cleanTarget = category.toLowerCase().replace(/-/g, " ");
            formatted = formatted.filter(p => {
                const matchCategory = p.category.toLowerCase().replace(/-/g, " ") === cleanTarget;
                const matchCategories = (p.categories || []).some(
                    c => c.toLowerCase().replace(/-/g, " ") === cleanTarget ||
                         c.toLowerCase().replace(/[^a-z0-9]+/g, "-") === category.toLowerCase()
                );
                return matchCategory || matchCategories;
            });
        }

        // Handle rating sort in memory if requested
        if (sort === "rating") {
            formatted.sort((a, b) => b.rating - a.rating);
        }

        return NextResponse.json(
            {
                success: true,
                products: formatted,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[STOREFRONT_PRODUCTS_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to load products" },
            { status: 500, headers: corsHeaders }
        );
    }
}
