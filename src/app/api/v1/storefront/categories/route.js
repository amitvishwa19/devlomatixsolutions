import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { 
    authenticateStorefrontRequest, 
    getStorefrontCorsHeaders, 
    handleStorefrontOptions 
} from "@/lib/ecommerce/storefront-auth";

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

    try {
        // Fetch explicit categories linked to this store
        const dbCategories = await db.category.findMany({
            where: { storeId: store.id },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
            },
            orderBy: { name: "asc" },
        });

        // Also fetch active products to compute item counts and discover implicit categories
        const products = await db.eCommerceProduct.findMany({
            where: {
                storeId: store.id,
                status: "active",
            },
            select: {
                id: true,
                imageUrls: true,
                metadata: true,
            },
        });

        // Map product counts per category
        const countMap = new Map();
        const implicitCategories = new Map();

        for (const prod of products) {
            let catList = [];
            if (Array.isArray(prod.metadata?.category)) {
                catList = prod.metadata.category;
            } else if (typeof prod.metadata?.category === "string" && prod.metadata.category) {
                catList = [prod.metadata.category];
            }

            for (const catName of catList) {
                const normalized = catName.trim();
                countMap.set(normalized, (countMap.get(normalized) || 0) + 1);

                if (!dbCategories.some(c => c.name.toLowerCase() === normalized.toLowerCase())) {
                    if (!implicitCategories.has(normalized)) {
                        let sampleImg = null;
                        if (prod.imageUrls?.cover) sampleImg = prod.imageUrls.cover;
                        else if (Array.isArray(prod.imageUrls) && prod.imageUrls[0]) sampleImg = prod.imageUrls[0];
                        implicitCategories.set(normalized, {
                            id: `cat_${normalized.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                            name: normalized,
                            slug: normalized.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                            description: null,
                            imageUrl: sampleImg,
                        });
                    }
                }
            }
        }

        const merged = [
            ...dbCategories.map(c => ({
                ...c,
                count: countMap.get(c.name) || 0,
            })),
            ...Array.from(implicitCategories.values()).map(c => ({
                ...c,
                count: countMap.get(c.name) || 0,
            })),
        ];

        return NextResponse.json(
            {
                success: true,
                categories: merged,
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[STOREFRONT_CATEGORIES_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to load categories" },
            { status: 500, headers: corsHeaders }
        );
    }
}
