'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        await db.eCommerceProduct.delete({
            where: { id: productId }
        });

        revalidatePath(`/workspace/${session.user.userId}/ecommerce/products`);
        return { success: true, message: "Product deleted" };
    } catch (error) {
        console.error("[DELETE_PRODUCT_ERROR]", error);
        return { success: false, message: "Failed to delete product" };
    }
}