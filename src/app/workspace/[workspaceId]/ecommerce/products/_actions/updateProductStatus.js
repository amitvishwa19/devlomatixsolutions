'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function updateProductStatus(productId, status) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const product = await db.eCommerceProduct.update({
            where: { id: productId },
            data: { status }
        });

        revalidatePath(`/workspace/${session.user.userId}/ecommerce/products`);
        return { success: true, product };
    } catch (error) {
        console.error("[UPDATE_PRODUCT_STATUS_ERROR]", error);
        return { success: false, message: "Failed to update status" };
    }
}