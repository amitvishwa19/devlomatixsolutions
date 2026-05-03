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
        const { title, description, sku, price, discount, quantity, status, category, imageUrl, longDescription } = formData;

        const product = await db.eCommerceProduct.create({
            data: {
                title,
                description,
                sku,
                price: parseFloat(price) || 0,
                discount: parseFloat(discount) || 0,
                inventoryCount: parseInt(quantity) || 0,
                status: status || "active",
                imageUrl,
                userId: session.user.userId,
                metadata: { 
                    category: category || "crystals",
                    longDescription: longDescription || ""
                }
            }
        });

        revalidatePath(`/workspace/${session.user.userId}/ecommerce/products`);
        return { success: true, product };
    } catch (error) {
        console.error("[CREATE_PRODUCT_ERROR]", error);
        return { success: false, message: "Failed to create product" };
    }
}