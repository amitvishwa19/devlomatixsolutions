import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
    try {
        const platform = req.nextUrl.searchParams.get('platform'); // shopify | woocommerce
        const storeId = req.nextUrl.searchParams.get('storeId');
        
        if (!platform || !storeId) {
            return new NextResponse("Missing platform or storeId", { status: 400 });
        }

        const body = await req.json();
        const headers = Object.fromEntries(req.headers);

        console.log(`[ECOMMERCE_WEBHOOK] Received ${platform} event for store ${storeId}`);

        // Logic to handle different events
        if (platform === 'shopify') {
            const topic = headers['x-shopify-topic'];
            await handleShopifyEvent(storeId, topic, body);
        } else if (platform === 'woocommerce') {
            const topic = headers['x-wc-webhook-topic'];
            await handleWooCommerceEvent(storeId, topic, body);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ECOMMERCE_WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

async function handleShopifyEvent(storeId, topic, data) {
    // 1. Find the store and user
    const store = await db.eCommerceStore.findUnique({
        where: { id: storeId }
    });
    if (!store) return;

    if (topic === 'orders/create') {
        // Create order in DB
        await db.eCommerceOrder.create({
            data: {
                storeId: store.id,
                userId: store.userId,
                externalOrderId: String(data.id),
                orderNumber: data.name,
                totalAmount: parseFloat(data.total_price),
                currency: data.currency,
                status: data.financial_status,
                customerName: `${data.customer?.first_name} ${data.customer?.last_name}`,
                customerEmail: data.customer?.email,
                customerPhone: data.customer?.phone || data.shipping_address?.phone,
                metadata: data
            }
        });

        // TODO: Trigger WhatsApp Workflow "Order Created"
    }

    if (topic === 'checkouts/create' || topic === 'checkouts/update') {
        // Logic for Abandoned Cart recovery tracking
        // Shopify triggers these when a checkout is started
    }
}

async function handleWooCommerceEvent(storeId, topic, data) {
    // Similar logic for WooCommerce
}
