import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

// In-memory LRU-style cache with 5-minute TTL to ensure sub-5ms auth verification
const storeAuthCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Validates the x-api-key header and retrieves the associated store.
 * Supports both plaintext API key (eco_...) and encrypted DB representation.
 *
 * @param {Request} req - The incoming Next.js request
 * @returns {Promise<{ store: object | null, error: string | null, status: number }>}
 */
export async function authenticateStorefrontRequest(req) {
    try {
        const apiKey = req.headers.get("x-api-key") || 
            req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

        if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
            return {
                store: null,
                error: "Authentication required. Missing 'x-api-key' header.",
                status: 401
            };
        }

        const trimmedKey = apiKey.trim();

        // Check in-memory cache first
        const cached = storeAuthCache.get(trimmedKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            return { store: cached.store, error: null, status: 200 };
        }

        // Query all connected stores
        const stores = await db.eCommerceStore.findMany({
            where: { status: "connected" },
            select: {
                id: true,
                userId: true,
                name: true,
                slug: true,
                description: true,
                storeUrl: true,
                logo: true,
                currency: true,
                timezone: true,
                status: true,
                apiKey: true,
                paymentOptions: true,
                codMinAmount: true,
                codMaxAmount: true,
                defaultShippingCost: true,
                freeShippingThreshold: true,
                shippingMethod: true,
                taxPercentage: true,
                taxInclusive: true,
                autoFulfillOrders: true,
                orderPrefix: true,
                sendConfirmationEmail: true,
                trackInventory: true,
                lowStockThreshold: true,
                guestCheckout: true,
                requirePhone: true,
                requireAddress: true,
                metadata: true,
            }
        });

        let matchedStore = null;

        for (const store of stores) {
            if (!store.apiKey) continue;

            // Direct match (if the stored key matches incoming key)
            if (store.apiKey === trimmedKey) {
                matchedStore = store;
                break;
            }

            // Decrypted match (if DB stores encrypted key iv:ciphertext)
            try {
                const decrypted = symmetricDecrypt(store.apiKey);
                if (decrypted === trimmedKey) {
                    matchedStore = store;
                    break;
                }
            } catch {
                // Ignore decryption errors for mismatching formats
            }
        }

        if (!matchedStore) {
            return {
                store: null,
                error: "Invalid or inactive store API key.",
                status: 401
            };
        }

        // Strip the raw apiKey before caching & returning
        const { apiKey: _removedKey, ...safeStore } = matchedStore;

        storeAuthCache.set(trimmedKey, {
            store: safeStore,
            timestamp: Date.now()
        });

        return { store: safeStore, error: null, status: 200 };
    } catch (error) {
        console.error("[STOREFRONT_AUTH_ERROR]", error);
        return {
            store: null,
            error: "Internal server error during authentication.",
            status: 500
        };
    }
}

/**
 * Manually evicts a store from the auth cache (useful when rotating API keys).
 * @param {string} storeId
 */
export function invalidateStoreAuthCache(storeId) {
    for (const [key, val] of storeAuthCache.entries()) {
        if (val.store?.id === storeId) {
            storeAuthCache.delete(key);
        }
    }
}

/**
 * Standard CORS headers for storefront public access
 */
export function getStorefrontCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
    };
}

/**
 * Helper to handle OPTIONS preflight requests for storefront routes
 */
export function handleStorefrontOptions() {
    return new NextResponse(null, {
        status: 204,
        headers: getStorefrontCorsHeaders(),
    });
}
