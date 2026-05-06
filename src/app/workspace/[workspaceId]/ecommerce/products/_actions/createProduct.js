'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function createProduct(formData) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const { title, description, slug, sku, price, discount, quantity, status, category, storeId, imageUrl, longDescription, productType, digitalFileUrl, duration, servings, nutritionalInfo, requirements, deliveryMethod, images, variants, weight, metaTitle, metaDescription } = formData;

        const product = await db.eCommerceProduct.create({
            data: {
                title,
                description,
                slug: slug || null,
                sku: sku || null,
                price: parseFloat(price) || 0,
                discount: parseFloat(discount) || 0,
                inventoryCount: parseInt(quantity) || 0,
                weight: weight ? parseFloat(weight) : null,
                status: status || "active",
                storeId: storeId || null,
                imageUrls: {
                    cover: imageUrl || "",
                    images: images || []
                },
                userId: session.user.userId,
                metadata: { 
                    category: Array.isArray(category) ? category : (category ? [category] : []),
                    longDescription: longDescription || "",
                    productType: productType || "physical",
                    digitalFileUrl: digitalFileUrl || "",
                    duration: duration || "",
                    servings: servings || "",
                    nutritionalInfo: nutritionalInfo || "",
                    requirements: requirements || "",
                    deliveryMethod: deliveryMethod || "manual",
                    metaTitle: metaTitle || "",
                    metaDescription: metaDescription || ""
                },
                variants: variants && variants.length > 0 ? {
                    create: variants.map(v => ({
                        name: v.name,
                        sku: v.sku || null,
                        price: v.price ? parseFloat(v.price) : null,
                        inventoryCount: parseInt(v.quantity) || 0,
                        weight: v.weight ? parseFloat(v.weight) : null
                    }))
                } : undefined
            }
        });

        revalidatePath(`/workspace/${session.user.userId}/ecommerce/products`);
        return { success: true, product };
    } catch (error) {
        console.error("[CREATE_PRODUCT_ERROR]", error);
        return { success: false, message: "Failed to create product" };
    }
}