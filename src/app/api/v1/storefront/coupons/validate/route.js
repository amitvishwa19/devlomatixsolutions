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
        const code = body.code?.trim()?.toUpperCase();
        const subtotal = parseFloat(body.subtotal || 0);

        if (!code) {
            return NextResponse.json(
                { success: false, error: "Coupon code is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const coupon = await db.eCommerceCoupon.findFirst({
            where: {
                storeId: store.id,
                code: code,
                isActive: true,
            },
        });

        if (!coupon) {
            return NextResponse.json(
                { success: false, valid: false, error: "Invalid coupon code" },
                { status: 404, headers: corsHeaders }
            );
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return NextResponse.json(
                { success: false, valid: false, error: "Coupon code has expired" },
                { status: 400, headers: corsHeaders }
            );
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json(
                { success: false, valid: false, error: "Coupon usage limit reached" },
                { status: 400, headers: corsHeaders }
            );
        }

        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return NextResponse.json(
                {
                    success: false,
                    valid: false,
                    error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
                },
                { status: 400, headers: corsHeaders }
            );
        }

        let discountAmount = 0;
        if (coupon.type === "PERCENTAGE") {
            discountAmount = Math.round((subtotal * coupon.value) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = Math.min(coupon.value, subtotal);
        }

        return NextResponse.json(
            {
                success: true,
                valid: true,
                discountAmount,
                coupon: {
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    maxDiscount: coupon.maxDiscount,
                    minOrderAmount: coupon.minOrderAmount,
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("[STOREFRONT_COUPON_VALIDATE_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to validate coupon" },
            { status: 500, headers: corsHeaders }
        );
    }
}
