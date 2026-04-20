import { db } from "@/lib/db";
import { waQueueWorker } from "./queue-worker";

/**
 * WhatsAppCommerceSync: Automation for eCommerce events.
 */
export class WhatsAppCommerceSync {
    static instance;

    constructor() {}

    static getInstance() {
        if (!WhatsAppCommerceSync.instance) {
            WhatsAppCommerceSync.instance = new WhatsAppCommerceSync();
        }
        return WhatsAppCommerceSync.instance;
    }

    /**
     * Notify customer on order creation.
     */
    async notifyOrderCreated(orderId) {
        try {
            const order = await db.ecommerceOrder.findUnique({
                where: { id: orderId },
                include: { contact: true, user: true }
            });

            if (!order || !order.contact?.phone) return;

            const message = `🛍️ *Order Confirmed!*\n\nHello ${order.contact.name},\nThank you for shopping with us. Your order *#${order.orderNumber || order.id.substring(0,8)}* has been received and is being processed.\n\n*Total:* ${order.currency} ${order.totalAmount}\n\nWe will notify you once it's shipped!`;

            // Enqueue via worker for reliability
            await waQueueWorker.enqueue(order.userId, 'SINGLE', {
                jid: `${order.contact.phone.replace(/\D/g, '')}@s.whatsapp.net`,
                payload: { text: message },
                userId: order.userId
            });

            console.log(`[CommerceSync] Enqueued Order Notification for ${orderId}`);

        } catch (error) {
            console.error("[CommerceSync] Order Notification Failed:", error);
        }
    }

    async notifyOrderStatusUpdate(orderId, status) {
        // Implementation logic
    }
}

export const waCommerceSync = WhatsAppCommerceSync.getInstance();
