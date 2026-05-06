import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/workspace/ecommerce/stores/[storeId]/coupons/validate
export async function POST(req, { params }) {
    try {
        const { storeId } = await params;
        const body = await req.json();
        const { code, orderAmount } = body;

        if (!code) {
            return NextResponse.json({ message: "Coupon code is required" }, { status: 400 });
        }

        const coupon = await db.eCommerceCoupon.findUnique({
            where: {
                storeId_code: {
                    storeId: storeId,
                    code: code.toUpperCase()
                }
            }
        });

        if (!coupon || !coupon.isActive) {
            return NextResponse.json({ message: "Invalid or inactive coupon code" }, { status: 400 });
        }

        // Check expiry date
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return NextResponse.json({ message: "This coupon has expired" }, { status: 400 });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ message: "This coupon has reached its usage limit" }, { status: 400 });
        }

        // Check minimum order amount if provided
        if (orderAmount !== undefined && coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            return NextResponse.json({ message: `Minimum order amount of ₹${coupon.minOrderAmount} is required for this coupon` }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                maxDiscount: coupon.maxDiscount
            }
        });

    } catch (error) {
        console.error("[COUPON_VALIDATE_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
