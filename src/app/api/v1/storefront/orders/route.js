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
            customer,
            items,
            promoCode,
            paymentMethod = "cod",
            giftWrap = false,
            giftMessage = "",
            notes = "",
            guestId,
        } = body;

        // Basic payload validation
        if (!customer || !customer.name || !customer.phone || !customer.address) {
            return NextResponse.json(
                { success: false, error: "Complete customer shipping information is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: "Order must contain at least one item" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Fetch products from DB to verify existence, store ownership, and real price
        const productIds = items.map(i => i.productId).filter(Boolean);
        const dbProducts = await db.eCommerceProduct.findMany({
            where: {
                id: { in: productIds },
                storeId: store.id,
            },
            include: {
                variants: true,
            },
        });

        const productMap = new Map(dbProducts.map(p => [p.id, p]));

        let calculatedSubtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const prod = productMap.get(item.productId);
            if (!prod) {
                return NextResponse.json(
                    { success: false, error: `Product ID ${item.productId} is not available in this store` },
                    { status: 400, headers: corsHeaders }
                );
            }

            let unitPrice = prod.price;
            if (prod.discount > 0) {
                unitPrice = Math.round(prod.price * (1 - prod.discount / 100));
            }

            let variantName = null;
            let variantSku = null;

            if (item.variantId) {
                const variant = (prod.variants || []).find(v => v.id === item.variantId);
                if (variant) {
                    if (variant.price != null) unitPrice = variant.price;
                    variantName = variant.name;
                    variantSku = variant.sku;

                    if (store.trackInventory && variant.inventoryCount < item.quantity) {
                        return NextResponse.json(
                            { success: false, error: `Insufficient stock for ${prod.title} (${variant.name})` },
                            { status: 400, headers: corsHeaders }
                        );
                    }
                }
            } else if (store.trackInventory && (prod.inventoryCount ?? 0) < item.quantity) {
                return NextResponse.json(
                    { success: false, error: `Insufficient stock for ${prod.title}` },
                    { status: 400, headers: corsHeaders }
                );
            }

            const quantity = Math.max(1, parseInt(item.quantity) || 1);
            const lineTotal = unitPrice * quantity;
            calculatedSubtotal += lineTotal;

            let coverImg = null;
            if (prod.imageUrls?.cover) coverImg = prod.imageUrls.cover;
            else if (Array.isArray(prod.imageUrls) && prod.imageUrls[0]) coverImg = prod.imageUrls[0];

            verifiedItems.push({
                productId: prod.id,
                variantId: item.variantId || null,
                title: prod.title,
                sku: variantSku || prod.sku || '',
                variantName: variantName || null,
                unitPrice,
                quantity,
                lineTotal,
                image: coverImg || "/placeholder.png",
            });
        }

        // Validate promo code if applied
        let discountAmount = 0;
        let appliedCoupon = null;

        if (promoCode) {
            const cleanCode = promoCode.trim().toUpperCase();
            const coupon = await db.eCommerceCoupon.findFirst({
                where: {
                    storeId: store.id,
                    code: cleanCode,
                    isActive: true,
                },
            });

            if (coupon) {
                const notExpired = !coupon.expiryDate || new Date(coupon.expiryDate) >= new Date();
                const limitOk = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
                const minOrderOk = !coupon.minOrderAmount || calculatedSubtotal >= coupon.minOrderAmount;

                if (notExpired && limitOk && minOrderOk) {
                    if (coupon.type === "PERCENTAGE") {
                        discountAmount = Math.round((calculatedSubtotal * coupon.value) / 100);
                        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                            discountAmount = coupon.maxDiscount;
                        }
                    } else {
                        discountAmount = Math.min(coupon.value, calculatedSubtotal);
                    }

                    appliedCoupon = {
                        id: coupon.id,
                        code: coupon.code,
                        discountAmount,
                    };

                    // Increment coupon usage count
                    await db.eCommerceCoupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: { increment: 1 } },
                    });
                }
            }
        }

        // Shipping fee calculation
        let shippingFee = store.defaultShippingCost ?? 0;
        if (store.freeShippingThreshold && calculatedSubtotal >= store.freeShippingThreshold) {
            shippingFee = 0;
        }

        const giftFee = giftWrap ? 99 : 0;
        const finalTotal = Math.max(0, calculatedSubtotal - discountAmount) + shippingFee + giftFee;

        // Generate human-friendly order numbers
        const timestamp = Date.now().toString(36).toUpperCase();
        const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const externalOrderId = `CA-${timestamp}-${randHex}`;
        const prefix = store.orderPrefix || "ORD";
        const orderNumber = `${prefix}-${Date.now().toString().slice(-6)}`;

        // Create the ECommerceOrder in DB
        const newOrder = await db.eCommerceOrder.create({
            data: {
                storeId: store.id,
                userId: store.userId,
                externalOrderId,
                orderNumber,
                totalAmount: finalTotal,
                currency: store.currency || "INR",
                status: "confirmed",
                financialStatus: paymentMethod === "cod" ? "pending" : "paid",
                fulfillmentStatus: "unfulfilled",
                customerName: customer.name,
                customerEmail: customer.email || null,
                customerPhone: customer.phone,
                metadata: {
                    customer,
                    items: verifiedItems,
                    subtotal: calculatedSubtotal,
                    discountAmount,
                    shippingFee,
                    giftFee,
                    giftWrap,
                    giftMessage: giftMessage || null,
                    notes: notes || null,
                    paymentMethod,
                    coupon: appliedCoupon,
                    placedAt: new Date().toISOString(),
                },
            },
        });

        // Deduct inventory atomically
        if (store.trackInventory) {
            for (const item of verifiedItems) {
                if (item.variantId) {
                    await db.eCommerceProductVariant.update({
                        where: { id: item.variantId },
                        data: { inventoryCount: { decrement: item.quantity } },
                    }).catch(err => console.error("[STOCK_DECREMENT_VARIANT_ERROR]", err));
                }

                await db.eCommerceProduct.update({
                    where: { id: item.productId },
                    data: { inventoryCount: { decrement: item.quantity } },
                }).catch(err => console.error("[STOCK_DECREMENT_PRODUCT_ERROR]", err));
            }
        }

        // Mark cart as converted and recovered
        if (guestId) {
            await db.eCommerceCart.updateMany({
                where: {
                    storeId: store.id,
                    guestId,
                },
                data: {
                    status: "converted",
                    convertedToOrderId: newOrder.id,
                },
            }).catch(() => {});

            await db.eCommerceAbandonedCart.updateMany({
                where: {
                    storeId: store.id,
                    guestId,
                },
                data: {
                    recovered: true,
                },
            }).catch(() => {});
        }

        return NextResponse.json(
            {
                success: true,
                order: {
                    id: newOrder.id,
                    externalOrderId: newOrder.externalOrderId,
                    orderNumber: newOrder.orderNumber,
                    totalAmount: newOrder.totalAmount,
                    currency: newOrder.currency,
                    status: newOrder.status,
                    financialStatus: newOrder.financialStatus,
                    customer: customer,
                    items: verifiedItems,
                    createdAt: newOrder.createdAt,
                },
            },
            { status: 201, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[STOREFRONT_ORDER_CREATE_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to place order. Please try again." },
            { status: 500, headers: corsHeaders }
        );
    }
}
