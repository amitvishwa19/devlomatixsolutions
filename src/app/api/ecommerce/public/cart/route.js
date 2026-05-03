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
            userId: true,
            apiKey: true,
        },
    });

    if (!store) {
        return { valid: false, error: 'Invalid API key or store slug' };
    }

    try {
        const storedApiKey = symmetricDecrypt(store.apiKey);
        if (storedApiKey !== apiKey) {
            return { valid: false, error: 'Invalid API key or store slug' };
        }
    } catch (error) {
        console.error('[DECRYPT_ERROR]', error);
        if (store.apiKey !== apiKey) {
            return { valid: false, error: 'Invalid API key or store slug' };
        }
    }

    return { valid: true, store: { id: store.id, name: store.name, slug: store.slug, storeUrl: store.storeUrl, userId: store.userId } };
}

// GET cart - fetch existing cart
export async function GET(request) {
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { headers: corsHeaders() });
    }

    try {
        const apiKey = request.headers.get('x-api-key');
        const storeSlug = request.headers.get('x-store-slug');
        const guestId = request.headers.get('x-guest-id');
        const userId = request.headers.get('x-user-id');

        const validation = await validateStore(apiKey, storeSlug);
        if (!validation.valid) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 401 });
        }

        // Find existing cart
        let cart = null;
        if (userId) {
            cart = await db.eCommerceCart.findFirst({
                where: { storeId: validation.store.id, userId, status: 'active' }
            });
        } else if (guestId) {
            cart = await db.eCommerceCart.findFirst({
                where: { storeId: validation.store.id, guestId, status: 'active' }
            });
        }

        if (!cart) {
            return NextResponse.json({ success: true, cart: null });
        }

        return NextResponse.json({
            success: true,
            cart: {
                id: cart.id,
                items: cart.items,
                totalAmount: cart.totalAmount,
                currency: cart.currency,
                status: cart.status,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt,
            }
        });
    } catch (error) {
        console.error('[GET_CART_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Upsert cart (create or update)
export async function POST(request) {
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { headers: corsHeaders() });
    }

    try {
        const apiKey = request.headers.get('x-api-key');
        const storeSlug = request.headers.get('x-store-slug');

        const validation = await validateStore(apiKey, storeSlug);
        if (!validation.valid) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 401 });
        }

        const body = await request.json();
        const { guestId, userId, items, totalAmount, currency = 'INR' } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ success: false, error: 'Invalid cart items' }, { status: 400 });
        }

        // Find existing cart or create new one
        let cart;
        const whereClause = userId 
            ? { storeId: validation.store.id, userId, status: 'active' }
            : { storeId: validation.store.id, guestId, status: 'active' };

        const existingCart = await db.eCommerceCart.findFirst({ where: whereClause });

        if (existingCart) {
            // Update existing cart
            cart = await db.eCommerceCart.update({
                where: { id: existingCart.id },
                data: {
                    items,
                    totalAmount: parseFloat(totalAmount) || 0,
                    currency,
                    updatedAt: new Date(),
                }
            });
        } else {
            // Create new cart
            cart = await db.eCommerceCart.create({
                data: {
                    storeId: validation.store.id,
                    guestId: guestId || null,
                    userId: userId || null,
                    items,
                    totalAmount: parseFloat(totalAmount) || 0,
                    currency,
                    status: 'active',
                }
            });
        }

        return NextResponse.json({
            success: true,
            cart: {
                id: cart.id,
                items: cart.items,
                totalAmount: cart.totalAmount,
                status: cart.status,
            }
        });
    } catch (error) {
        console.error('[UPSERT_CART_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Clear cart (mark as converted when order placed)
export async function DELETE(request) {
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { headers: corsHeaders() });
    }

    try {
        const apiKey = request.headers.get('x-api-key');
        const storeSlug = request.headers.get('x-store-slug');
        const guestId = request.headers.get('x-guest-id');
        const userId = request.headers.get('x-user-id');

        const validation = await validateStore(apiKey, storeSlug);
        if (!validation.valid) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 401 });
        }

        // Mark cart as converted (not deleted, for tracking)
        const whereClause = userId
            ? { storeId: validation.store.id, userId, status: 'active' }
            : { storeId: validation.store.id, guestId, status: 'active' };

        await db.eCommerceCart.updateMany({
            where: whereClause,
            data: {
                status: 'converted',
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE_CART_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}