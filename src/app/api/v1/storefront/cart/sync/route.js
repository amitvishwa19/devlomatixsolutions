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

export async function POST(req) {
    const corsHeaders = getStorefrontCorsHeaders();

    const auth = await authenticateStorefrontRequest(req);
    if (auth.error) {
        return NextResponse.json(
            { success: false, error: auth.error },
            { status: auth.status, headers: corsHeaders }
        );
    }

    const { store } = auth;

    try {
        const body = await req.json();
        const {
            guestId,
            userId,
            items = [],
            totalAmount = 0,
            currency = store.currency || "INR",
            customerEmail,
            customerPhone,
            checkoutUrl,
        } = body;

        const effectiveGuestId = guestId || (userId ? null : `guest_${Date.now()}`);

        // Upsert ECommerceCart record
        let cartRecord = null;
        if (effectiveGuestId) {
            cartRecord = await db.eCommerceCart.upsert({
                where: {
                    storeId_guestId: {
                        storeId: store.id,
                        guestId: effectiveGuestId,
                    },
                },
                update: {
                    items: items,
                    totalAmount: parseFloat(totalAmount) || 0,
                    currency,
                    status: "active",
                    metadata: {
                        customerEmail: customerEmail || null,
                        customerPhone: customerPhone || null,
                        lastSyncedAt: new Date().toISOString(),
                    },
                },
                create: {
                    storeId: store.id,
                    guestId: effectiveGuestId,
                    items: items,
                    totalAmount: parseFloat(totalAmount) || 0,
                    currency,
                    status: "active",
                    metadata: {
                        customerEmail: customerEmail || null,
                        customerPhone: customerPhone || null,
                        lastSyncedAt: new Date().toISOString(),
                    },
                },
            });
        }

        // If customer contact details are known and cart has items, sync to ECommerceAbandonedCart
        if ((customerEmail || customerPhone) && Array.isArray(items) && items.length > 0 && effectiveGuestId) {
            const externalCartId = `cart_${store.id.slice(-6)}_${effectiveGuestId}`;
            await db.eCommerceAbandonedCart.upsert({
                where: { externalCartId },
                update: {
                    totalAmount: parseFloat(totalAmount) || 0,
                    currency,
                    customerEmail: customerEmail || null,
                    customerPhone: customerPhone || null,
                    checkoutUrl: checkoutUrl || `${store.storeUrl}/checkout`,
                    recovered: false,
                    metadata: {
                        items,
                        updatedAt: new Date().toISOString(),
                    },
                },
                create: {
                    storeId: store.id,
                    userId: store.userId,
                    externalCartId,
                    guestId: effectiveGuestId,
                    totalAmount: parseFloat(totalAmount) || 0,
                    currency,
                    customerEmail: customerEmail || null,
                    customerPhone: customerPhone || null,
                    checkoutUrl: checkoutUrl || `${store.storeUrl}/checkout`,
                    recovered: false,
                    metadata: {
                        items,
                        createdAt: new Date().toISOString(),
                    },
                },
            });
        }

        return NextResponse.json(
            {
                success: true,
                cartId: cartRecord?.id || null,
                guestId: effectiveGuestId,
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[STOREFRONT_CART_SYNC_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to sync cart" },
            { status: 500, headers: corsHeaders }
        );
    }
}
