/**
 * POST /api/webhooks/test
 * Proxy a GET request to the provided URL with optional headers.
 * This avoids browser CORS restrictions when testing external webhook/API endpoints.
 */
export async function POST(req) {
    try {
        const { url, headers: customHeaders = {} } = await req.json();

        if (!url || typeof url !== 'string') {
            return Response.json({ success: false, error: 'URL is required.' }, { status: 400 });
        }

        const upstream = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders,
            },
        });

        const contentType = upstream.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await upstream.json();
        } else {
            data = await upstream.text();
        }

        return Response.json({
            success: upstream.ok,
            status: upstream.status,
            statusText: upstream.statusText,
            data,
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message || 'Request failed',
        }, { status: 500 });
    }
}
