'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import { hasConsent } from '@/components/global/CookieConsent';

export function useAnalytics() {
    const pathname = usePathname();
    const startTime = useRef(null);

    useEffect(() => {
        if (pathname && hasConsent('analytics')) {
            analytics.trackPageView(
                document.title,
                pathname,
                getPageCategory(pathname)
            );
            
            startTime.current = Date.now();
        }
    }, [pathname]);

    useEffect(() => {
        return () => {
            if (startTime.current && pathname && hasConsent('analytics')) {
                const duration = Math.floor((Date.now() - startTime.current) / 1000);
                analytics.trackTimeOnPage(pathname, duration);
            }
        };
    }, [pathname]);

    return {
        trackProductView: analytics.trackProductView,
        trackProductClick: analytics.trackProductClick,
        trackAddToCart: analytics.trackAddToCart,
        trackRemoveFromCart: analytics.trackRemoveFromCart,
        trackCheckout: analytics.trackCheckout,
        trackPurchase: analytics.trackPurchase,
        trackSearch: analytics.trackSearch,
        trackCategoryView: analytics.trackCategoryView,
        trackSignUp: analytics.trackSignUp,
        trackLogin: analytics.trackLogin,
        trackButtonClick: analytics.trackButtonClick,
        getUserInterests: analytics.getUserInterests,
        getBrowsingHistory: analytics.getBrowsingHistory,
    };
}

function getPageCategory(pathname) {
    if (pathname.includes('/shop') || pathname.includes('/product')) return 'shop';
    if (pathname.includes('/blog')) return 'blog';
    if (pathname.includes('/about')) return 'about';
    if (pathname.includes('/contact')) return 'contact';
    if (pathname.includes('/cart')) return 'cart';
    if (pathname.includes('/checkout')) return 'checkout';
    return 'general';
}

export default useAnalytics;