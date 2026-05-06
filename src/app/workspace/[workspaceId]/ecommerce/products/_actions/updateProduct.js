'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function updateProduct(productId, formData) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const { title, description, slug, sku, price, discount, quantity, status, category, storeId, imageUrl, longDescription, productType, digitalFileUrl, duration, servings, nutritionalInfo, requirements, deliveryMethod, images, variants, weight, metaTitle, metaDescription } = formData;

        const existingProduct = await db.eCommerceProduct.findUnique({ where: { id: productId } });

        const product = await db.eCommerceProduct.update({
            where: { id: productId },
            data: {
                title,
                description,
                slug: slug !== undefined ? (slug || null) : undefined,
                sku: sku || null,
                price: price ? parseFloat(price) : undefined,
                discount: discount !== undefined ? parseFloat(discount) : undefined,
                inventoryCount: quantity !== undefined ? parseInt(quantity) : undefined,
                weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : undefined,
                status,
                storeId: storeId !== undefined ? storeId : undefined,
                imageUrls: {
                    cover: imageUrl || "",
                    images: images || []
                },
                metadata: { 
                    category: Array.isArray(category) ? category : (category ? [category] : []),
                    longDescription: longDescription || "",
                    productType: productType || "physical",
                    digitalFileUrl: digitalFileUrl || "",
                    duration: duration || "",
                    servings: servings || "",
                    nutritionalInfo: nutritionalInfo || "",
                    requirements: requirements !== undefined ? requirements : (existingProduct.metadata?.requirements || ""),
                    deliveryMethod: deliveryMethod !== undefined ? deliveryMethod : (existingProduct.metadata?.deliveryMethod || "manual"),
                    metaTitle: metaTitle !== undefined ? metaTitle : (existingProduct.metadata?.metaTitle || ""),
                    metaDescription: metaDescription !== undefined ? metaDescription : (existingProduct.metadata?.metaDescription || "")
                },
                variants: variants ? {
                    deleteMany: {
                        id: { notIn: variants.filter(v => v.id).map(v => v.id) }
                    },
                    create: variants.filter(v => !v.id).map(v => ({
                        name: v.name,
                        sku: v.sku || null,
                        price: v.price ? parseFloat(v.price) : null,
                        inventoryCount: parseInt(v.quantity) || 0,
                        weight: v.weight ? parseFloat(v.weight) : null
                    })),
                    update: variants.filter(v => v.id).map(v => ({
                        where: { id: v.id },
                        data: {
                            name: v.name,
                            sku: v.sku || null,
                            price: v.price ? parseFloat(v.price) : null,
                            inventoryCount: parseInt(v.quantity) || 0,
                            weight: v.weight ? parseFloat(v.weight) : null
                        }
                    }))
                } : undefined
            }
        });

        revalidatePath(`/workspace/${session.user.userId}/ecommerce/products`);
        return { success: true, product };
    } catch (error) {
        console.error("[UPDATE_PRODUCT_ERROR]", error);
        return { success: false, message: "Failed to update product" };
    }
}