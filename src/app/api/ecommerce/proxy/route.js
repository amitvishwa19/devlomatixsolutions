import { NextResponse } from 'next/server';
import { getEcommerceConfig } from "@/app/(public)/account/_actions";
import { symmetricDecrypt } from "@/lib/encryption";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const endpoint = searchParams.get('endpoint') || 'products';

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        // Get config
        const result = await getEcommerceConfig(userId);
        if (!result.success || result.data.length === 0) {
            return NextResponse.json({ success: false, error: 'No configuration found' }, { status: 400 });
        }

        const config = result.data[0];
        const backendUrl = config.backendUrl;
        
        // Try to decrypt, if fails use as-is (for unencrypted keys)
        let apiKey;
        try {
            apiKey = symmetricDecrypt(config.apiKey);
        } catch (e) {
            console.log('[PROXY] Using unencrypted API key');
            apiKey = config.apiKey;
        }
        
        const storeSlug = config.storeName;

        // Build the target URL
        const targetUrl = `${backendUrl.replace(/\/$/, '')}/api/ecommerce/public/${endpoint}?limit=1`;
        console.log('[PROXY] Target URL:', targetUrl);

        // Make the request to backend
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'x-store-slug': storeSlug,
            },
        });

        // Check if response is OK
        if (!response.ok) {
            console.log('[PROXY] Response status:', response.status);
            console.log('[PROXY] Response text:', await response.text());
            return NextResponse.json({ success: false, error: `Backend returned status ${response.status}` }, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('[PROXY_ERROR]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}