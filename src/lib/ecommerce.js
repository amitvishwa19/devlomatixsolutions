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

// Cart sync functions
export async function syncCart(userId, cartData) {
    try {
        const config = await getBackendConfig(userId);
        if (!config) return { success: false, skip: true };

        const { backendUrl, apiKey, storeName } = config;
        
        // Skip if no valid backend URL
        if (!backendUrl || !apiKey || !storeName) {
            return { success: false, skip: true };
        }

        const { guestId, items, totalAmount } = cartData;

        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/ecommerce/public/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'x-store-slug': storeName,
            },
            body: JSON.stringify({
                guestId,
                items,
                totalAmount,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        // Silent fail for network errors - don't throw
        return { success: false, skip: true };
    }
}

export async function getCart(userId, guestId, userIdParam) {
    const config = await getBackendConfig(userId);
    if (!config) return { success: false, error: 'No backend configuration' };

    const { backendUrl, apiKey, storeName } = config;

    try {
        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/ecommerce/public/cart`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'x-store-slug': storeName,
                'x-guest-id': guestId || '',
                'x-user-id': userIdParam || '',
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[GET_CART_ERROR]', error);
        return { success: false, error: error.message };
    }
}

export async function clearCartOnOrder(userId, guestId, userIdParam) {
    const config = await getBackendConfig(userId);
    if (!config) return { success: false, error: 'No backend configuration' };

    const { backendUrl, apiKey, storeName } = config;

    try {
        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/ecommerce/public/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'x-store-slug': storeName,
                'x-guest-id': guestId || '',
                'x-user-id': userIdParam || '',
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[CLEAR_CART_ERROR]', error);
        return { success: false, error: error.message };
    }
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