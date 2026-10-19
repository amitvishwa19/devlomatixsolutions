import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { workspaceId } = await params;
        const currentUserId = session.user.userId || session.user.id;

        const body = await req.json();
        const { storeId, products = [], status = "active" } = body;

        if (!storeId) {
            return NextResponse.json({ message: "Target storeId is required" }, { status: 400 });
        }

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ message: "At least one product is required to import" }, { status: 400 });
        }

        // Validate store
        const store = await db.eCommerceStore.findFirst({
            where: {
                id: storeId,
                OR: [
                    { userId: currentUserId },
                    { userId: workspaceId }
                ]
            }
        });

        if (!store) {
            return NextResponse.json({ message: "Selected store not found or unauthorized" }, { status: 404 });
        }

        const importedResults = [];

        // Import products in a transaction
        for (const item of products) {
            const rawSlug = (item.title || "product")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            const uniqueSlug = `${rawSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
            const uniqueSku = item.sku || `SKU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

            const variants = Array.isArray(item.variants) && item.variants.length > 0 
                ? item.variants 
                : [{ name: "Standard", price: item.price || 0, inventoryCount: 20 }];

            const totalInventory = variants.reduce((sum, v) => sum + (v.inventoryCount || 0), 0);

            const createdProduct = await db.eCommerceProduct.create({
                data: {
                    storeId: store.id,
                    userId: currentUserId,
                    title: item.title || "Untitled Product",
                    slug: uniqueSlug,
                    sku: uniqueSku,
                    description: item.description || "",
                    price: parseFloat(item.price || 0),
                    discount: parseFloat(item.discount || 0),
                    currency: item.currency || store.currency || "INR",
                    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
                    status: status || "active",
                    inventoryCount: totalInventory,
                    metadata: {
                        specifications: item.specifications || {},
                        tags: item.tags || [],
                        importedVia: "AI_SCRAPER",
                        importedAt: new Date().toISOString()
                    },
                    variants: {
                        create: variants.map((v, idx) => ({
                            name: v.name || `Variant ${idx + 1}`,
                            price: parseFloat(v.price ?? item.price ?? 0),
                            sku: v.sku || `${uniqueSku}-V${idx + 1}`,
                            inventoryCount: v.inventoryCount || 20
                        }))
                    }
                },
                include: {
                    variants: true
                }
            });

            importedResults.push(createdProduct);
        }

        return NextResponse.json({
            success: true,
            importedCount: importedResults.length,
            storeName: store.name,
            products: importedResults.map(p => ({ id: p.id, title: p.title, sku: p.sku }))
        });

    } catch (error) {
        console.error("[ECOMMERCE_SCRAPER_IMPORT_ERROR]", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to import products to catalog" 
        }, { status: 500 });
    }
}
