/**
 * POST /api/webhooks/test
 * Proxy a request (any method) to the provided URL with optional headers and body.
 * This avoids browser CORS restrictions when testing external Meta API endpoints.
 */
export async function POST(req) {
    try {
        const { url, method = 'GET', headers: customHeaders = {}, body } = await req.json();

        if (!url || typeof url !== 'string') {
            return Response.json({ success: false, error: 'URL is required.' }, { status: 400 });
        }

        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders,
            },
        };

        if (body && method !== 'GET' && method !== 'HEAD') {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const upstream = await fetch(url, fetchOptions);

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
