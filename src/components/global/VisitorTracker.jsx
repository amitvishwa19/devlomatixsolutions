'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useParams } from 'next/navigation';

export function VisitorTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams();
    const lastTracked = useRef(null);

    useEffect(() => {
        if (!pathname) return;

        // Skip internal/static routes
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/api') ||
            pathname.includes('.') ||
            pathname.includes('/favicon.ico')
        ) {
            return;
        }

        const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

        // Avoid duplicate logging for exact same path within 1 second
        if (lastTracked.current === fullPath) return;
        lastTracked.current = fullPath;

        // Ensure persistent Session ID across tabs/session
        let sessionId = '';
        try {
            sessionId = sessionStorage.getItem('visitor_session_id') || '';
            if (!sessionId) {
                sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                sessionStorage.setItem('visitor_session_id', sessionId);
            }
        } catch (e) {
            sessionId = `sess_${Date.now()}`;
        }

        const workspaceId = params?.workspaceId || null;
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        const title = typeof document !== 'undefined' ? document.title : '';
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : null;
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : null;

        // Send telemetry silently
        fetch('/api/telemetry/visitor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workspaceId,
                pathname: fullPath,
                title,
                referrer,
                screenWidth,
                screenHeight,
                sessionId
            }),
        }).catch(() => {
            // Silently ignore background tracking errors
        });
    }, [pathname, searchParams, params]);

    return null;
}
