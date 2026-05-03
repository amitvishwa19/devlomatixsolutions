'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }) {
    useAnalytics();
    return children;
}

export default AnalyticsProvider;