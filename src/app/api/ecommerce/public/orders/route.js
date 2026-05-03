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
            userId: true,
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
        if (store.apiKey !== apiKey) {
            return { valid: false, error: 'Invalid API key or store slug' };
        }
    }

    return { valid: true, store: { id: store.id, name: store.name, slug: store.slug, storeUrl: store.storeUrl, userId: store.userId } };
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
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit')) || 50;
        const offset = parseInt(searchParams.get('offset')) || 0;

        const whereClause = {
            storeId: validation.store.id,
        };

        if (status) {
            whereClause.status = status;
        }

        const orders = await db.eCommerceOrder.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            select: {
                id: true,
                externalOrderId: true,
                orderNumber: true,
                totalAmount: true,
                currency: true,
                status: true,
                financialStatus: true,
                fulfillmentStatus: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                createdAt: true,
            },
        });

        const total = await db.eCommerceOrder.count({
            where: whereClause,
        });

        return NextResponse.json({
            success: true,
            store: {
                id: validation.store.id,
                name: validation.store.name,
            },
            orders,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + orders.length < total,
            },
        });
    } catch (error) {
        console.error('[PUBLIC_GET_ORDERS_ERROR]', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
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
                { status: 401 }
            );
        }

        const body = await request.json();
        const { 
            externalOrderId,
            orderNumber,
            totalAmount,
            currency = 'INR',
            status = 'pending',
            customerName,
            customerEmail,
            customerPhone,
            guestId,
            items,
        } = body;

        if (!externalOrderId || !totalAmount) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const order = await db.eCommerceOrder.create({
            data: {
                storeId: validation.store.id,
                externalOrderId,
                orderNumber: orderNumber || `ORD-${Date.now()}`,
                totalAmount: parseFloat(totalAmount),
                currency,
                status,
                customerName,
                customerEmail,
                customerPhone,
                userId: validation.store.userId,
                metadata: JSON.stringify({ items, guestId }),
            },
        });

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                externalOrderId: order.externalOrderId,
                orderNumber: order.orderNumber,
                status: order.status,
            },
        });
    } catch (error) {
        console.error('[PUBLIC_CREATE_ORDER_ERROR]', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}