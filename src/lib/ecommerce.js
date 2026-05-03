import { getEcommerceConfig } from "@/app/(public)/account/_actions";

export async function getBackendConfig(userId) {
    const result = await getEcommerceConfig(userId);
    if (result.success && result.data.length > 0) {
        return result.data[0];
    }
    return null;
}

export async function fetchFromBackend(endpoint, userId, options = {}) {
    const config = await getBackendConfig(userId);
    
    if (!config) {
        throw new Error('No backend configuration found');
    }

    const { backendUrl, apiKey, storeName } = config;

    const url = `${backendUrl.replace(/\/$/, '')}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-store-slug': storeName,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('[BACKEND_API_ERROR]', error);
        throw error;
    }
}

export async function getProducts(userId, options = {}) {
    const { status = 'active', limit = 50, offset = 0 } = options;
    
    const params = new URLSearchParams({
        status,
        limit: limit.toString(),
        offset: offset.toString(),
    });

    return fetchFromBackend(`/api/ecommerce/public/products?${params}`, userId);
}

export async function getOrders(userId, options = {}) {
    const { status, limit = 50, offset = 0 } = options;
    
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    });
    
    if (status) {
        params.append('status', status);
    }

    return fetchFromBackend(`/api/ecommerce/public/orders?${params}`, userId);
}

export async function createOrder(userId, orderData) {
    return fetchFromBackend('/api/ecommerce/public/orders', userId, {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
}

export async function getAccountStats(userId) {
    try {
        const [productsData, ordersData] = await Promise.all([
            getProducts(userId, { limit: 1 }),
            getOrders(userId, { limit: 100 }),
        ]);

        return {
            success: true,
            stats: {
                totalProducts: productsData.pagination?.total || 0,
                totalOrders: ordersData.pagination?.total || 0,
                storeName: productsData.store?.name || ordersData.store?.name || '',
                storeUrl: productsData.store?.url || '',
            },
        };
    } catch (error) {
        console.error('[GET_ACCOUNT_STATS_ERROR]', error);
        return {
            success: false,
            error: error.message,
            stats: null,
        };
    }
}

export async function testConnection(userId) {
    try {
        // Use local proxy to avoid CORS issues
        const proxyUrl = `/api/ecommerce/proxy?userId=${userId}&endpoint=products`;
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
        });

        const data = await response.json();

        if (!response.ok) {
            return { 
                success: false, 
                error: data.error || 'Connection failed. Please check your settings.' 
            };
        }

        return { 
            success: true, 
            message: `Connected successfully! Found ${data.pagination?.total || 0} products.`,
            storeName: data.store?.name,
            productCount: data.pagination?.total || 0
        };
    } catch (error) {
        console.error('[TEST_CONNECTION_ERROR]', error);
        
        let errorMessage = 'Failed to connect. ';
        
        if (error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot reach backend. Please check the URL is correct and accessible.';
        } else if (error.message.includes('network') || error.message.includes('NetworkError')) {
            errorMessage += 'Network error. Please check your internet connection.';
        } else {
            errorMessage += error.message;
        }
        
        return { 
            success: false, 
            error: errorMessage
        };
    }
}