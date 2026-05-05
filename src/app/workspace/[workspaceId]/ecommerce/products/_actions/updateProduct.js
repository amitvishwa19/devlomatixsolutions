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
        const { title, description, sku, price, discount, quantity, status, category, imageUrl, longDescription, productType, digitalFileUrl, duration, servings, nutritionalInfo, requirements, deliveryMethod, images } = formData;

        const product = await db.eCommerceProduct.update({
            where: { id: productId },
            data: {
                title,
                description,
                sku: sku || null,
                price: parseFloat(price) || 0,
                discount: parseFloat(discount) || 0,
                inventoryCount: parseInt(quantity) || 0,
                status: status || "active",
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
                    requirements: requirements || "",
                    deliveryMethod: deliveryMethod || "manual"
                }
            }
        });

        revalidatePath(`/workspace/${session.user.userId}/ecommerce/products`);
        return { success: true, product };
    } catch (error) {
        console.error("[UPDATE_PRODUCT_ERROR]", error);
        return { success: false, message: "Failed to update product" };
    }
}