'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
    const url = request.nextUrl.clone()
    const pathname = url.pathname
    const host = request.headers.get('host') || ''

    // 1. PRODUCTION GRADE BYPASS: Never intercept API routes
    // This prevents CLIENT_FETCH_ERROR where JSON requests get HTML redirects
    if (pathname.startsWith('/api')) {
        return NextResponse.next()
    }

    const token = await getToken({ req: request })

    const isMainDomain =
        process.env.NODE_ENV === 'production'
            ? host === 'devlomatix.com'
            : host === 'localhost:3000'

    const isDev = process.env.NODE_ENV !== 'production'

    // =========================
    // PATH -> SUBDOMAIN
    // =========================
    if (isMainDomain) {
        const segments = pathname.split('/').filter(Boolean)

        const allowedApps = ['crystalaura', 'solarbright', 'bizconnect']
        const appName = segments[0]

        if (allowedApps.includes(appName)) {
            const newUrl = new URL(request.url)

            const restPath = segments.slice(1).join('/')

            if (isDev) {
                newUrl.host = `${appName}.localhost:3000`
            } else {
                newUrl.hostname = `${appName}.devlomatix.com`
            }

            newUrl.pathname = restPath ? `/${restPath}` : '/'

            return NextResponse.redirect(newUrl)
        }
    }

    // =========================
    // AUTH PROTECTION
    // =========================

    const isProtectedRoute =
        pathname.startsWith('/workspace') ||
        pathname.startsWith('/admin')

    const isPublicRoute =
        pathname === '/' ||
        pathname === '/register' ||
        pathname === '/verify' ||
        pathname === '/reset'

    // Not logged in -> block protected routes
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Workspace Access Control (RBAC)
    if (pathname.startsWith('/workspace') && token) {
        const hasWorkspaceAccess =
            token.role === 'admin' ||
            token.role === 'superadmin' ||
            token.role === 'super-admin' ||
            token.roles?.some(role => role.title === 'workspace');

        if (!hasWorkspaceAccess) {
            console.log(`[Middleware] Access denied for ${token.email} to ${pathname}`);
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Logged in -> block login page
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/workspace', request.url))
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