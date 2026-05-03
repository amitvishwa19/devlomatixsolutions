'use server'

import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { getEcommerceConfig } from "@/app/(public)/account/_actions";
import { z } from "zod";

const CreateOrderSchema = z.object({
    userId: z.string(),
    items: z.array(z.object({
        productId: z.string(),
        title: z.string(),
        price: z.number(),
        quantity: z.number(),
        image: z.string().optional(),
    })),
    shippingAddress: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
    }),
    paymentMethod: z.string(),
    couponCode: z.string().optional(),
    discount: z.number().optional(),
});

export async function createOrder(data) {
    try {
        const validated = CreateOrderSchema.parse(data);

        // Get backend config
        const configResult = await getEcommerceConfig(validated.userId);
        if (!configResult.success || configResult.data.length === 0) {
            return { success: false, error: "No backend configuration found" };
        }

        const config = configResult.data[0];
        const backendUrl = config.backendUrl;
        const apiKey = symmetricDecrypt(config.apiKey);
        const storeSlug = config.storeName;

        // Calculate totals
        const subtotal = validated.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = validated.discount || 0;
        const shipping = subtotal >= 999 ? 0 : 99;
        const codCharge = validated.paymentMethod === "cod" ? 49 : 0;
        const total = subtotal - discount + shipping + codCharge;

        // Call backend API to create order
        const orderPayload = {
            externalOrderId: `CA-${Date.now().toString(36).toUpperCase()}`,
            orderNumber: `ORD-${Date.now()}`,
            totalAmount: total,
            currency: "INR",
            status: "confirmed",
            customerName: validated.shippingAddress.name,
            customerEmail: validated.shippingAddress.email,
            customerPhone: validated.shippingAddress.phone,
            items: validated.items,
        };

        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/ecommerce/public/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'x-store-slug': storeSlug,
            },
            body: JSON.stringify(orderPayload),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || "Failed to create order in backend" };
        }

        // Also save locally in CrystalAura for quick access
        const localOrder = await db.eCommerceOrder.create({
            data: {
                storeId: result.order?.id || "local",
                externalOrderId: orderPayload.externalOrderId,
                orderNumber: orderPayload.orderNumber,
                totalAmount: total,
                currency: "INR",
                status: "confirmed",
                financialStatus: "paid",
                fulfillmentStatus: "pending",
                customerName: validated.shippingAddress.name,
                customerEmail: validated.shippingAddress.email,
                customerPhone: validated.shippingAddress.phone,
                userId: validated.userId,
                metadata: JSON.stringify({
                    items: validated.items,
                    shippingAddress: validated.shippingAddress,
                    paymentMethod: validated.paymentMethod,
                    couponCode: validated.couponCode,
                    discount: validated.discount,
                    backendOrderId: result.order?.id,
                }),
            },
        });

        return { 
            success: true, 
            order: {
                id: localOrder.externalOrderId,
                orderNumber: localOrder.orderNumber,
                status: localOrder.status,
                total: total,
                items: validated.items,
                shippingAddress: validated.shippingAddress,
                paymentMethod: validated.paymentMethod,
            }
        };
    } catch (error) {
        console.error("[CREATE_ORDER_ERROR]", error);
        return { success: false, error: error.message || "Failed to create order" };
    }
}