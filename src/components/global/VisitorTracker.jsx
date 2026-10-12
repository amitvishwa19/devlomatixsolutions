'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useParams } from 'next/navigation';

export function VisitorTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams();

    const lastTracked = useRef(null);
    const currentLogIdRef = useRef(null);
    const startTimeRef = useRef(null);
    const heartbeatDisabledRef = useRef(false);
    const loggingDisabledRef = useRef(false);

    // Sync heartbeat and logging flags across tabs and components
    useEffect(() => {
        if (typeof window !== 'undefined') {
            heartbeatDisabledRef.current = localStorage.getItem('visitor_heartbeat_enabled') === 'false';
            loggingDisabledRef.current = localStorage.getItem('visitor_logging_enabled') === 'false';
        }

        const handleHeartbeatToggle = (e) => {
            const enabled = e?.detail?.enabled;
            if (typeof enabled === 'boolean') {
                heartbeatDisabledRef.current = !enabled;
            }
        };

        const handleLoggingToggle = (e) => {
            const enabled = e?.detail?.enabled;
            if (typeof enabled === 'boolean') {
                loggingDisabledRef.current = !enabled;
                if (!enabled) currentLogIdRef.current = null;
            }
        };

        const handleStorage = (e) => {
            if (e.key === 'visitor_heartbeat_enabled') {
                heartbeatDisabledRef.current = e.newValue === 'false';
            }
            if (e.key === 'visitor_logging_enabled') {
                loggingDisabledRef.current = e.newValue === 'false';
                if (e.newValue === 'false') currentLogIdRef.current = null;
            }
        };

        window.addEventListener('visitor_heartbeat_toggle', handleHeartbeatToggle);
        window.addEventListener('visitor_logging_toggle', handleLoggingToggle);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('visitor_heartbeat_toggle', handleHeartbeatToggle);
            window.removeEventListener('visitor_logging_toggle', handleLoggingToggle);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

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

        // Check local storage flags
        if (typeof window !== 'undefined') {
            heartbeatDisabledRef.current = localStorage.getItem('visitor_heartbeat_enabled') === 'false';
            loggingDisabledRef.current = localStorage.getItem('visitor_logging_enabled') === 'false';
        }

        if (loggingDisabledRef.current) {
            return;
        }

        const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

        if (lastTracked.current === fullPath) return;
        lastTracked.current = fullPath;

        // Send final duration update for previous page if available and heartbeat is enabled
        if (currentLogIdRef.current && !heartbeatDisabledRef.current) {
            const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
            const payload = JSON.stringify({ id: currentLogIdRef.current, duration: timeSpent });
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                navigator.sendBeacon('/api/telemetry/visitor', payload);
            } else {
                fetch('/api/telemetry/visitor', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true
                }).catch(() => {});
            }
        }

        // Reset timer and log reference for new page
        startTimeRef.current = Date.now();
        currentLogIdRef.current = null;

        // Ensure persistent Session ID
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

        // Send initial POST telemetry event
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
                sessionId,
                duration: 1
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data?.disabled) {
                currentLogIdRef.current = null;
                loggingDisabledRef.current = true;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('visitor_logging_enabled', 'false');
                }
                return;
            }
            if (data?.heartbeatEnabled === false) {
                heartbeatDisabledRef.current = true;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('visitor_heartbeat_enabled', 'false');
                }
            }
            if (data?.id) {
                currentLogIdRef.current = data.id;
            }
        })
        .catch(() => {});

        // Periodic heartbeats every 8 seconds to continuously update dwell duration
        const heartbeatInterval = setInterval(() => {
            if (currentLogIdRef.current && !heartbeatDisabledRef.current && !loggingDisabledRef.current) {
                const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
                fetch('/api/telemetry/visitor', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: currentLogIdRef.current, duration: timeSpent })
                }).catch(() => {});
            }
        }, 8000);

        // Send final duration on tab close / navigation
        const handleUnload = () => {
            if (currentLogIdRef.current && !heartbeatDisabledRef.current && !loggingDisabledRef.current) {
                const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
                const payload = JSON.stringify({ id: currentLogIdRef.current, duration: timeSpent });
                if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                    navigator.sendBeacon('/api/telemetry/visitor', payload);
                }
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(heartbeatInterval);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [pathname, searchParams, params]);

    return null;
}
