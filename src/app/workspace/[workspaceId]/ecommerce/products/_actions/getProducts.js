'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getProducts(workspaceId) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const products = await db.eCommerceProduct.findMany({
            where: { userId: session.user.userId },
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, products };
    } catch (error) {
        console.error("[GET_PRODUCTS_ERROR]", error);
        return { success: false, message: "Internal Server Error" };
    }
}