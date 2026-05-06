import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/workspace/ecommerce/stores/[storeId]/checkout
export async function POST(req, { params }) {
    try {
        const { storeId } = await params;
        const body = await req.json();
        const { items, customer, shippingAddress, couponCode } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
        }

        // 1. Verify store exists
        const store = await db.eCommerceStore.findUnique({
            where: { id: storeId },
            include: { config: true }
        });

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 });
        }

        let subtotal = 0;
        const verifiedItems = [];

        // 2. Verify all items and calculate subtotal securely from DB
        for (const item of items) {
            if (!item.productId) continue;

            const product = await db.eCommerceProduct.findUnique({
                where: { id: item.productId },
                include: { variants: true }
            });

            if (!product || product.status !== "active") {
                return NextResponse.json({ message: `Product ${item.productId} is unavailable` }, { status: 400 });
            }

            let priceToCharge = product.discount > 0 
                ? product.price * (1 - (product.discount / 100))
                : product.price;

            let variantName = null;

            if (item.variantId) {
                const variant = product.variants.find(v => v.id === item.variantId);
                if (!variant) {
                    return NextResponse.json({ message: `Variant ${item.variantId} not found` }, { status: 400 });
                }
                if (variant.price !== null) {
                    // Variant overrides price
                    priceToCharge = variant.price; 
                }
                variantName = variant.name;
            }

            const itemTotal = priceToCharge * (item.quantity || 1);
            subtotal += itemTotal;

            verifiedItems.push({
                productId: product.id,
                variantId: item.variantId || null,
                title: product.title,
                variantName,
                quantity: item.quantity || 1,
                price: priceToCharge,
                imageUrl: product.imageUrls?.cover || null
            });
        }

        let discountAmount = 0;
        let appliedCouponId = null;

        // 3. Apply Coupon
        if (couponCode) {
            const coupon = await db.eCommerceCoupon.findUnique({
                where: {
                    storeId_code: {
                        storeId: storeId,
                        code: couponCode.toUpperCase()
                    }
                }
            });

            if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
                if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
                    if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
                        appliedCouponId = coupon.id;
                        if (coupon.type === "PERCENTAGE") {
                            discountAmount = subtotal * (coupon.value / 100);
                            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                                discountAmount = coupon.maxDiscount;
                            }
                        } else if (coupon.type === "FIXED") {
                            discountAmount = coupon.value;
                        }
                    }
                }
            }
        }

        // 4. Calculate Final Total (excluding shipping/tax for simplicity in Phase 2)
        let totalAmount = subtotal - discountAmount;
        if (totalAmount < 0) totalAmount = 0;

        // Add dummy shipping cost from config if available
        let shippingCost = 0;
        if (store.config?.defaultShippingCost) {
            shippingCost = store.config.defaultShippingCost;
            totalAmount += shippingCost;
        }

        // 5. Create Order
        const order = await db.eCommerceOrder.create({
            data: {
                storeId: storeId,
                userId: store.userId, // The merchant's userId
                externalOrderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
                totalAmount: totalAmount,
                currency: store.currency || "INR",
                status: "pending",
                financialStatus: "pending",
                fulfillmentStatus: "unfulfilled",
                customerName: customer?.name || "Guest",
                customerEmail: customer?.email || null,
                customerPhone: customer?.phone || null,
                metadata: {
                    items: verifiedItems,
                    subtotal,
                    discountAmount,
                    shippingCost,
                    shippingAddress,
                    appliedCouponId,
                    appliedCouponCode: appliedCouponId ? couponCode.toUpperCase() : null
                }
            }
        });

        // 6. Update coupon usage
        if (appliedCouponId) {
            await db.eCommerceCoupon.update({
                where: { id: appliedCouponId },
                data: { usedCount: { increment: 1 } }
            });
        }

        // In a real integration, we would create a Stripe Session or Razorpay Order here using store.config keys.
        // For now, we return the created order which simulates a successful checkout initialization.

        return NextResponse.json({
            success: true,
            orderId: order.id,
            externalOrderId: order.externalOrderId,
            paymentUrl: `/checkout/simulate?orderId=${order.id}` // Simulated payment redirect
        });

    } catch (error) {
        console.error("[CHECKOUT_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
