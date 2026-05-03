'use client';

import { hasConsent } from '@/components/global/CookieConsent';

const ANALYTICS_KEY = 'userAnalytics';

function getAnalyticsData() {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(ANALYTICS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveAnalyticsData(data) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

function updateAnalytics(key, value) {
    if (!hasConsent('analytics')) return;
    
    const data = getAnalyticsData();
    const current = data[key] || [];
    const newValue = [...current, { ...value, timestamp: new Date().toISOString() }];
    
    data[key] = newValue;
    saveAnalyticsData(data);
    
    if (window.gtag) {
        window.gtag('event', value.event || key, value.params || {});
    }
}

export const analytics = {
    trackPageView: (pageName, pagePath, category = 'general') => {
        updateAnalytics('pageViews', {
            event: 'page_view',
            params: {
                page_name: pageName,
                page_path: pagePath,
                page_category: category,
            },
        });
    },

    trackProductView: (productId, productName, category, price) => {
        updateAnalytics('productViews', {
            event: 'view_item',
            params: {
                item_id: productId,
                item_name: productName,
                item_category: category,
                value: price,
                currency: 'USD',
            },
        });
    },

    trackProductClick: (productId, productName, category, position) => {
        updateAnalytics('productClicks', {
            event: 'select_item',
            params: {
                item_id: productId,
                item_name: productName,
                item_category: category,
                item_list_position: position,
            },
        });
    },

    trackAddToCart: (productId, productName, category, price, quantity = 1) => {
        updateAnalytics('addToCart', {
            event: 'add_to_cart',
            params: {
                item_id: productId,
                item_name: productName,
                item_category: category,
                value: price * quantity,
                currency: 'USD',
                quantity: quantity,
            },
        });
    },

    trackRemoveFromCart: (productId, productName, category, price) => {
        updateAnalytics('removeFromCart', {
            event: 'remove_from_cart',
            params: {
                item_id: productId,
                item_name: productName,
                item_category: category,
                value: price,
                currency: 'USD',
            },
        });
    },

    trackCheckout: (cartValue, cartItems, checkoutStep = 1) => {
        updateAnalytics('checkout', {
            event: 'begin_checkout',
            params: {
                value: cartValue,
                currency: 'USD',
                items: cartItems,
                checkout_step: checkoutStep,
            },
        });
    },

    trackPurchase: (transactionId, cartValue, cartItems) => {
        updateAnalytics('purchases', {
            event: 'purchase',
            params: {
                transaction_id: transactionId,
                value: cartValue,
                currency: 'USD',
                items: cartItems,
            },
        });
    },

    trackSearch: (searchTerm, resultsCount) => {
        updateAnalytics('searches', {
            event: 'search',
            params: {
                search_term: searchTerm,
                results_count: resultsCount,
            },
        });
    },

    trackCategoryView: (categoryName, subcategory = null) => {
        updateAnalytics('categoryViews', {
            event: 'view_item_list',
            params: {
                item_list_id: categoryName.toLowerCase().replace(/\s+/g, '_'),
                item_list_name: categoryName,
                item_category: subcategory,
            },
        });
    },

    trackSignUp: (method = 'email') => {
        updateAnalytics('signups', {
            event: 'sign_up',
            params: {
                method: method,
            },
        });
    },

    trackLogin: (method = 'email') => {
        updateAnalytics('logins', {
            event: 'login',
            params: {
                method: method,
            },
        });
    },

    trackButtonClick: (buttonName, buttonLocation, buttonCategory = 'general') => {
        updateAnalytics('buttonClicks', {
            event: 'button_click',
            params: {
                button_name: buttonName,
                button_location: buttonLocation,
                button_category: buttonCategory,
            },
        });
    },

    trackTimeOnPage: (pagePath, durationSeconds) => {
        updateAnalytics('timeOnPage', {
            event: 'time_on_page',
            params: {
                page_path: pagePath,
                session_duration: durationSeconds,
            },
        });
    },

    getUserInterests: () => {
        const data = getAnalyticsData();
        const interests = new Set();
        
        if (data.productViews) {
            data.productViews.forEach(p => interests.add(p.params?.item_category));
        }
        if (data.categoryViews) {
            data.categoryViews.forEach(c => interests.add(c.params?.item_list_name));
        }
        if (data.searches) {
            data.searches.forEach(s => interests.add(s.params?.search_term));
        }
        
        return Array.from(interests).filter(Boolean);
    },

    getBrowsingHistory: () => {
        return getAnalyticsData();
    },

    clearAnalytics: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(ANALYTICS_KEY);
    },
};

export default analytics;