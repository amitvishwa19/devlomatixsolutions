import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { 
    fetchHtmlWithHeaders, 
    detectPlatform, 
    extractJsonLd, 
    tryShopifyProductsJson, 
    pruneAndExtractDOM 
} from "@/lib/ecommerce/scraper-engine";
import { extractProductsWithGemini } from "@/lib/ecommerce/scraper-ai";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { workspaceId } = await params;
        const currentUserId = session.user.userId || session.user.id;

        const body = await req.json();
        const { url, limit = 10, mode = "auto" } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json({ message: "Valid target URL is required" }, { status: 400 });
        }

        // Validate URL format
        let targetUrl = url.trim();
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = `https://${targetUrl}`;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(targetUrl);
        } catch (e) {
            return NextResponse.json({ message: "Invalid URL format" }, { status: 400 });
        }

        // Step 1: Attempt native Shopify JSON API if applicable
        const shopifyProducts = await tryShopifyProductsJson(targetUrl, limit);
        if (shopifyProducts && shopifyProducts.length > 0) {
            return NextResponse.json({
                success: true,
                platform: "shopify",
                source: "native_json",
                count: shopifyProducts.length,
                products: shopifyProducts
            });
        }

        // Step 2: Fetch HTML content
        const { html, finalUrl } = await fetchHtmlWithHeaders(targetUrl);
        const platform = detectPlatform(html, finalUrl);

        // Step 3: Harvest JSON-LD Schema & DOM
        const jsonLd = extractJsonLd(html, finalUrl);
        const { og, images, cleanText } = pruneAndExtractDOM(html, finalUrl);

        // Step 4: AI Extraction via Gemini
        const products = await extractProductsWithGemini({
            userId: currentUserId,
            targetUrl: finalUrl,
            cleanText,
            images,
            og,
            jsonLd,
            mode,
            limit
        });

        return NextResponse.json({
            success: true,
            platform,
            source: "ai_extraction",
            count: products.length,
            products
        });

    } catch (error) {
        console.error("[ECOMMERCE_SCRAPER_EXTRACT_ERROR]", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to extract products from the provided website" 
        }, { status: 500 });
    }
}
