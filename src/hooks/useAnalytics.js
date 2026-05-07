"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { hasConsent } from "@/components/global/CookieConsent";

// Dummy analytics object since the library has been removed
// Analytics should be handled by the backend API in the new architecture
const analyticsFallback = {
  trackPageView: () => {},
  trackTimeOnPage: () => {},
  trackProductView: () => {},
  trackProductClick: () => {},
  trackAddToCart: () => {},
  trackRemoveFromCart: () => {},
  trackCheckout: () => {},
  trackPurchase: () => {},
  trackSearch: () => {},
  trackCategoryView: () => {},
  trackSignUp: () => {},
  trackLogin: () => {},
  trackButtonClick: () => {},
  getUserInterests: () => [],
  getBrowsingHistory: () => [],
};

export function useAnalytics() {
  const pathname = usePathname();
  const startTime = useRef(null);

  useEffect(() => {
    if (pathname && hasConsent("analytics")) {
      analyticsFallback.trackPageView(
        document.title,
        pathname,
        getPageCategory(pathname)
      );

      startTime.current = Date.now();
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (startTime.current && pathname && hasConsent("analytics")) {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);
        analyticsFallback.trackTimeOnPage(pathname, duration);
      }
    };
  }, [pathname]);

  return {
    trackProductView: analyticsFallback.trackProductView,
    trackProductClick: analyticsFallback.trackProductClick,
    trackAddToCart: analyticsFallback.trackAddToCart,
    trackRemoveFromCart: analyticsFallback.trackRemoveFromCart,
    trackCheckout: analyticsFallback.trackCheckout,
    trackPurchase: analyticsFallback.trackPurchase,
    trackSearch: analyticsFallback.trackSearch,
    trackCategoryView: analyticsFallback.trackCategoryView,
    trackSignUp: analyticsFallback.trackSignUp,
    trackLogin: analyticsFallback.trackLogin,
    trackButtonClick: analyticsFallback.trackButtonClick,
    getUserInterests: analyticsFallback.getUserInterests,
    getBrowsingHistory: analyticsFallback.getBrowsingHistory,
  };
}

function getPageCategory(pathname) {
  if (pathname.includes("/shop") || pathname.includes("/product")) return "shop";
  if (pathname.includes("/blog")) return "blog";
  if (pathname.includes("/about")) return "about";
  if (pathname.includes("/contact")) return "contact";
  if (pathname.includes("/cart")) return "cart";
  if (pathname.includes("/checkout")) return "checkout";
  return "general";
}

export default useAnalytics;