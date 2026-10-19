import * as cheerio from "cheerio";

/**
 * Resolves a relative URL against a base URL
 */
export function resolveUrl(relativeOrAbsoluteUrl, baseUrl) {
    if (!relativeOrAbsoluteUrl) return null;
    try {
        const trimmed = relativeOrAbsoluteUrl.trim();
        if (trimmed.startsWith("//")) {
            return `https:${trimmed}`;
        }
        return new URL(trimmed, baseUrl).href;
    } catch (e) {
        return relativeOrAbsoluteUrl;
    }
}

/**
 * Detect platform based on HTML content and headers
 */
export function detectPlatform(html, url) {
    const lowerHtml = (html || "").toLowerCase();
    const lowerUrl = (url || "").toLowerCase();

    if (lowerHtml.includes("cdn.shopify.com") || lowerHtml.includes("shopify-payment-button") || lowerHtml.includes("window.shopify")) {
        return "shopify";
    }
    if (lowerHtml.includes("woocommerce") || lowerHtml.includes("wp-content") || lowerHtml.includes("wc-api")) {
        return "woocommerce";
    }
    if (lowerUrl.includes("amazon.") || lowerHtml.includes("media-amazon.com")) {
        return "amazon";
    }
    if (lowerHtml.includes("magento") || lowerHtml.includes("mage/cookies")) {
        return "magento";
    }
    return "generic";
}

/**
 * Fetch web page HTML with realistic browser headers
 */
export async function fetchHtmlWithHeaders(targetUrl) {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    };

    const response = await fetch(targetUrl, {
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch website (HTTP ${response.status}: ${response.statusText})`);
    }

    const html = await response.text();
    return { html, finalUrl: response.url || targetUrl };
}

/**
 * Extract JSON-LD structured data from HTML
 */
export function extractJsonLd(html, baseUrl) {
    const $ = cheerio.load(html);
    const jsonLdData = [];

    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const raw = $(el).html();
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                jsonLdData.push(...parsed);
            } else if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
                jsonLdData.push(...parsed["@graph"]);
            } else {
                jsonLdData.push(parsed);
            }
        } catch (e) {
            // Ignore parse errors from malformed client JSON
        }
    });

    return jsonLdData;
}

/**
 * Check if the site is a Shopify store and can provide native products.json
 */
export async function tryShopifyProductsJson(targetUrl, limit = 10) {
    try {
        const parsed = new URL(targetUrl);
        const origin = parsed.origin;
        const pathname = parsed.pathname.replace(/\/$/, "");

        // Try collection products.json first if on a collection URL, or general /products.json
        let endpoint = `${origin}/products.json?limit=${limit}`;
        if (pathname.includes("/collections/")) {
            endpoint = `${origin}${pathname}/products.json?limit=${limit}`;
        }

        const res = await fetch(endpoint, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) return null;
        const data = await res.json();
        if (data && Array.isArray(data.products) && data.products.length > 0) {
            return data.products.map(p => ({
                title: p.title,
                description: p.body_html ? cheerio.load(p.body_html).text().trim() : "",
                price: parseFloat(p.variants?.[0]?.price || 0),
                discount: p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) - parseFloat(p.variants[0].price) : 0,
                currency: "USD", // fallback or detected
                sku: p.variants?.[0]?.sku || `SP-${p.id}`,
                category: p.product_type || "General",
                imageUrls: (p.images || []).map(img => img.src).filter(Boolean),
                variants: (p.variants || []).map(v => ({
                    name: v.title === "Default Title" ? "Standard" : v.title,
                    price: parseFloat(v.price || 0),
                    sku: v.sku || "",
                    inventoryCount: v.inventory_quantity > 0 ? v.inventory_quantity : 25
                })),
                specifications: {
                    Vendor: p.vendor || "",
                    Type: p.product_type || "",
                    Tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || "")
                }
            }));
        }
    } catch (e) {
        // Not a Shopify JSON endpoint
    }
    return null;
}

/**
 * Prune noisy DOM elements and harvest candidate product containers and images
 */
export function pruneAndExtractDOM(html, baseUrl) {
    const $ = cheerio.load(html);

    // Remove non-content elements
    $('script, style, noscript, svg, iframe, nav, footer, header, form, input, button, select, [role="navigation"], [role="banner"]').remove();

    // Harvest high-resolution image candidates
    const rawImages = [];
    $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-srcset') || $(el).attr('srcset');
        const alt = $(el).attr('alt') || '';
        const resolved = resolveUrl(src, baseUrl);
        
        // Filter out tiny icons, spacers, badges
        if (resolved && !resolved.includes(".svg") && !resolved.includes("icon") && !resolved.includes("badge") && !resolved.includes("logo") && !resolved.includes("spacer")) {
            rawImages.push({ src: resolved, alt });
        }
    });

    // Extract OpenGraph tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    const ogDescription = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const ogImage = resolveUrl($('meta[property="og:image"]').attr('content'), baseUrl);
    const ogPrice = $('meta[property="og:price:amount"]').attr('content') || $('meta[property="product:price:amount"]').attr('content');
    const ogCurrency = $('meta[property="og:price:currency"]').attr('content') || $('meta[property="product:price:currency"]').attr('content') || 'INR';

    // Get cleaned body text (up to 15,000 chars to avoid exceeding context window)
    const bodyText = $('body')
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 15000);

    return {
        og: {
            title: ogTitle,
            description: ogDescription,
            image: ogImage,
            price: ogPrice ? parseFloat(ogPrice) : null,
            currency: ogCurrency
        },
        images: Array.from(new Set(rawImages.map(i => i.src))).slice(0, 25),
        cleanText: bodyText
    };
}
