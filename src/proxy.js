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
            : host === 'localhost:3000'

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

    // Workspace Access Control (RBAC & Multi-Tenancy Isolation)
    // if (pathname.startsWith('/workspace/') && token) {
    //     const segments = pathname.split('/').filter(Boolean);
    //     const workspaceId = segments[1]; // /workspace/[workspaceId]/...

    //     const isSystemAdmin = token.role === 'ADMIN' || token.role === 'SUPER_ADMIN';
    //     const hasWorkspaceMembership = token.workspaces?.includes(workspaceId);

    //     // PRODUCTION GRADE: If token.workspaces is missing entirely, 
    //     // it means the session is stale. We allow it briefly but log it.
    //     const isStaleSession = token.workspaces === undefined;

    //     if (!isSystemAdmin && !hasWorkspaceMembership && workspaceId && !isStaleSession) {
    //         console.error(`[Security Guard] Blocked unauthorized access: ${token.email} tried to enter workspace ${workspaceId}`);
    //         return NextResponse.redirect(new URL('/unauthorized', request.url));
    //     }
    // }

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