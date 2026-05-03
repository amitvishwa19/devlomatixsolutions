import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-store-slug',
    };
}

async function validateStore(apiKey, storeSlug) {
    if (!apiKey || !storeSlug) {
        return { valid: false, error: 'Missing API key or store slug' };
    }

    // Find store by slug first
    const store = await db.eCommerceStore.findFirst({
        where: {
            slug: storeSlug.toLowerCase().trim(),
            status: 'connected',
        },
        select: {
            id: true,
            name: true,
            slug: true,
            storeUrl: true,
            apiKey: true,
        },
    });

    if (!store) {
        return { valid: false, error: 'Invalid API key or store slug' };
    }

    // Decrypt stored API key and compare
    try {
        const storedApiKey = symmetricDecrypt(store.apiKey);
        if (storedApiKey !== apiKey) {
            return { valid: false, error: 'Invalid API key or store slug' };
        }
    } catch (error) {
        console.error('[DECRYPT_ERROR]', error);
        // If decryption fails, try direct comparison (for non-encrypted keys)
        if (store.apiKey !== apiKey) {
            return { valid: false, error: 'Invalid API key or store slug' };
        }
    }

    return { valid: true, store: { id: store.id, name: store.name, slug: store.slug, storeUrl: store.storeUrl } };
}

export async function GET(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { headers: corsHeaders() });
    }

    try {
        const apiKey = request.headers.get('x-api-key');
        const storeSlug = request.headers.get('x-store-slug');

        const validation = await validateStore(apiKey, storeSlug);
        
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 401, headers: corsHeaders() }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'active';
        const limit = parseInt(searchParams.get('limit')) || 50;
        const offset = parseInt(searchParams.get('offset')) || 0;

        const products = await db.eCommerceProduct.findMany({
            where: {
                storeId: validation.store.id,
                status: status,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            select: {
                id: true,
                externalProductId: true,
                sku: true,
                title: true,
                description: true,
                price: true,
                discount: true,
                currency: true,
                imageUrl: true,
                inventoryCount: true,
                status: true,
                createdAt: true,
            },
        });

        const total = await db.eCommerceProduct.count({
            where: {
                storeId: validation.store.id,
                status: status,
            },
        });

        return NextResponse.json({
            success: true,
            store: {
                id: validation.store.id,
                name: validation.store.name,
                url: validation.store.storeUrl,
            },
            products,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + products.length < total,
            },
        }, { headers: corsHeaders() });
    } catch (error) {
        console.error('[PUBLIC_GET_PRODUCTS_ERROR]', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500, headers: corsHeaders() }
        );
    }
}