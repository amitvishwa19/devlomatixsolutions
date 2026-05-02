'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getProduct(productId) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const product = await db.eCommerceProduct.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return { success: false, message: "Product not found" };
        }

        return { success: true, product };
    } catch (error) {
        console.error("[GET_PRODUCT_ERROR]", error);
        return { success: false, message: "Internal Server Error" };
    }
}