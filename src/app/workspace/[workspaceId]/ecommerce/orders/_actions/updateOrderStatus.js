'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus({ orderId, status, fulfillmentStatus, trackingNumber, carrier, workspaceId }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const order = await db.eCommerceOrder.update({
            where: { id: orderId },
            data: {
                status: status !== undefined ? status : undefined,
                fulfillmentStatus: fulfillmentStatus !== undefined ? fulfillmentStatus : undefined,
                trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
                carrier: carrier !== undefined ? carrier : undefined
            }
        });

        if (workspaceId) {
            revalidatePath(`/workspace/${workspaceId}/ecommerce/orders`);
        }
        
        return { success: true, order };
    } catch (error) {
        console.error("[UPDATE_ORDER_ERROR]", error);
        return { success: false, message: "Failed to update order" };
    }
}
