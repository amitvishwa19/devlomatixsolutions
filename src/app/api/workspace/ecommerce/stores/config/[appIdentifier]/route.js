import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

export async function GET(request, { params }) {
    

    try {
        const { appIdentifier } = await params;

        
        
        if (!appIdentifier) {
            return NextResponse.json({ success: false, message: "App Identifier is required" }, { status: 400 });
        }

        const configData = await db.ecommerceConfig.findFirst({
            where: { appIdentifier: appIdentifier }
        });

        

        if (!configData) {
            return NextResponse.json({ success: false, message: "Configuration not found for this app" }, { status: 404 });
        }

        let decryptedApiKey = null;
        try {
            decryptedApiKey = symmetricDecrypt(configData.apiKey);
        } catch (decryptError) {
            return NextResponse.json({ success: false, message: "Failed to Decrypt" }, { status: 404 });
        }

   


         // 1. Fetch the store and its categories
        const store = await db.eCommerceStore.findUnique({
            where: { id: configData?.storeId },
            include: {
                categories: {
                    orderBy: { name: 'asc' }
                }
            }
        });

        if (!store) {
            return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
        }

        // 2. Fetch products for this store
        const products = await db.eCommerceProduct.findMany({
            where: { storeId: configData?.storeId },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Group products and build category tree
        const attachProducts = (category) => {
            const categoryProducts = products.filter(product => {
                const productCats = product.metadata?.category;
                if (Array.isArray(productCats)) return productCats.includes(category.name);
                if (typeof productCats === 'string') return productCats === category.name;
                return false;
            });

            return {
                categoryId: category.id,
                categoryName: category.name,
                slug: category.slug,
                type: category.type,
                description: category.description,
                productCount: categoryProducts.length,
                products: categoryProducts,
                children: [] // subcategories go here
            };
        };

        const catMap = {};
        store.categories.forEach(c => {
            catMap[c.id] = attachProducts(c);
        });

        const catIds = new Set(store.categories.map(c => c.id));
        const catalogTree = [];

        store.categories.forEach(c => {
            if (!c.parentId || !catIds.has(c.parentId)) {
                // Top-level store category
                catalogTree.push(catMap[c.id]);
            } else {
                if (catMap[c.parentId]) {
                    catMap[c.parentId].children.push(catMap[c.id]);
                }
            }
        });

        // 4. Find products that don't match any store category
        const uncategorizedProducts = products.filter(product => {
            const productCats = product.metadata?.category;
            if (!productCats || (Array.isArray(productCats) && productCats.length === 0)) {
                return true;
            }
            // Also include if the category name doesn't match any store categories
            const matchesStoreCat = store.categories.some(cat => {
                if (Array.isArray(productCats)) return productCats.includes(cat.name);
                return productCats === cat.name;
            });
            return !matchesStoreCat;
        });

        if (uncategorizedProducts.length > 0) {
            catalogTree.push({
                categoryId: "uncategorized",
                categoryName: "Uncategorized",
                slug: "uncategorized",
                description: "Products without a specific store category",
                productCount: uncategorizedProducts.length,
                products: uncategorizedProducts,
                children: []
            });
        }

        console.log('getting store details -catalogTree', catalogTree)

        return NextResponse.json({
            success: true,
            store: {
                id: store.id,
                name: store.name,
                totalProducts: products.length
            },
            catalog: catalogTree
        }, { status: 200 });

    } catch (error) {
        console.error("[CONFIG_RETRIEVAL_ERROR]", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Internal server error",
            stack: error.stack 
        }, { status: 500 });
    }
}

export async function POST(request) {
    return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}