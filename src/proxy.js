'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request) {
    const url = request.nextUrl.clone()
    const pathname = url.pathname
    const host = request.headers.get('host') || ''

    // 1. PRODUCTION GRADE BYPASS: Never intercept API routes
    // This prevents CLIENT_FETCH_ERROR where JSON requests get HTML redirects
    if (pathname.startsWith('/api')) {
        return NextResponse.next()
    }

    const token = await getToken({ req: request, secret: process.env.ENCRYPTION_KEY })

    const isMainDomain =
        process.env.NODE_ENV === 'production'
            ? host === 'devlomatix.com'
            : host === 'dev.devlomatix.com'

    const isDev = process.env.NODE_ENV !== 'production'


    // =========================
    // AUTH PROTECTION
    // =========================

    const isProtectedRoute =
        pathname.startsWith('/workspace') ||
        pathname.startsWith('/admin')

    const isPublicRoute =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/verify' ||
        pathname === '/reset'

    // Not logged in -> block protected routes
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Workspace Access Control (Role Guard)
    // Only users with a role slug in [super-admin, admin, demo] can access /workspace/[workspaceId]
    if (pathname.startsWith('/workspace/') && token) {
        const allowedSlugs = ['super-admin', 'admin', 'demo'];

        // If roles are missing from the token entirely, the session is stale:
        // let the page layer handle it to avoid lockouts during enrichment.
        const isStaleSession = token.roles === undefined;

        const hasAllowedRole = token.roles?.some((r) => {
            const roleSlug = r.slug || String(r.title || '').toLowerCase().trim();
            return allowedSlugs.includes(roleSlug);
        });

        if (!isStaleSession && !hasAllowedRole) {
            console.error(
                `[Role Guard] Blocked access: ${token.email} (roles: ${JSON.stringify(token.roles?.map(r => r.slug))}) tried to enter ${pathname}`
            );
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // Logged in -> Allow viewing the home page/landing page
    if (pathname === '/' && token) {
        return NextResponse.next()
    }

    // =========================
    // DEFAULT
    // =========================
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (static files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}