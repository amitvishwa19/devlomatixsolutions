import { NextResponse } from "next/server";
import { 
    authenticateStorefrontRequest, 
    getStorefrontCorsHeaders, 
    handleStorefrontOptions 
} from "@/lib/ecommerce/storefront-auth";

export async function OPTIONS() {
    return handleStorefrontOptions();
}

export async function GET(req) {
    const corsHeaders = getStorefrontCorsHeaders();

    const auth = await authenticateStorefrontRequest(req);
    if (auth.error) {
        return NextResponse.json(
            { success: false, error: auth.error },
            { status: auth.status, headers: corsHeaders }
        );
    }

    const { store } = auth;

    return NextResponse.json(
        {
            success: true,
            store: {
                id: store.id,
                name: store.name,
                slug: store.slug,
                description: store.description,
                logo: store.logo,
                currency: store.currency || "INR",
                timezone: store.timezone || "Asia/Kolkata",
                paymentOptions: store.paymentOptions || {
                    card: true,
                    upi: true,
                    netbanking: true,
                    cod: true,
                },
                codMinAmount: store.codMinAmount ?? 0,
                codMaxAmount: store.codMaxAmount ?? 5000,
                shipping: {
                    defaultCost: store.defaultShippingCost ?? 0,
                    freeShippingThreshold: store.freeShippingThreshold ?? 999,
                    method: store.shippingMethod || "flat",
                },
                tax: {
                    percentage: store.taxPercentage ?? 0,
                    inclusive: store.taxInclusive ?? false,
                },
                checkout: {
                    guestCheckout: store.guestCheckout ?? true,
                    requirePhone: store.requirePhone ?? true,
                    requireAddress: store.requireAddress ?? true,
                },
            },
        },
        { status: 200, headers: corsHeaders }
    );
}
