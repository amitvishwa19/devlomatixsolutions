import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { 
    authenticateStorefrontRequest, 
    getStorefrontCorsHeaders, 
    handleStorefrontOptions 
} from "@/lib/ecommerce/storefront-auth";

export async function OPTIONS() {
    return handleStorefrontOptions();
}

export async function GET(req, { params }) {
    const corsHeaders = getStorefrontCorsHeaders();

    const auth = await authenticateStorefrontRequest(req);
    if (auth.error) {
        return NextResponse.json(
            { success: false, error: auth.error },
            { status: auth.status, headers: corsHeaders }
        );
    }

    const { store } = auth;
    const { orderId } = await params;

    if (!orderId) {
        return NextResponse.json(
            { success: false, error: "Order ID or order number is required" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const order = await db.eCommerceOrder.findFirst({
            where: {
                storeId: store.id,
                OR: [
                    { id: orderId },
                    { externalOrderId: orderId },
                    { orderNumber: orderId },
                ],
            },
            select: {
                id: true,
                externalOrderId: true,
                orderNumber: true,
                totalAmount: true,
                currency: true,
                status: true,
                financialStatus: true,
                fulfillmentStatus: true,
                trackingNumber: true,
                carrier: true,
                customerName: true,
                customerPhone: true,
                customerEmail: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            {
                success: true,
                order: {
                    id: order.id,
                    externalOrderId: order.externalOrderId,
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    currency: order.currency,
                    status: order.status,
                    financialStatus: order.financialStatus,
                    fulfillmentStatus: order.fulfillmentStatus,
                    trackingNumber: order.trackingNumber,
                    carrier: order.carrier,
                    customer: {
                        name: order.customerName,
                        phone: order.customerPhone,
                        email: order.customerEmail,
                        address: order.metadata?.customer?.address || null,
                        city: order.metadata?.customer?.city || null,
                        state: order.metadata?.customer?.state || null,
                        pincode: order.metadata?.customer?.pincode || null,
                    },
                    items: order.metadata?.items || [],
                    subtotal: order.metadata?.subtotal || order.totalAmount,
                    discountAmount: order.metadata?.discountAmount || 0,
                    shippingFee: order.metadata?.shippingFee || 0,
                    paymentMethod: order.metadata?.paymentMethod || "cod",
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[STOREFRONT_ORDER_TRACK_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to track order" },
            { status: 500, headers: corsHeaders }
        );
    }
}
