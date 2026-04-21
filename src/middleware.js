'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ req: request })

  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const host = request.headers.get('host') || ''

  // const isMainDomain =
  //   process.env.NODE_ENV === 'production'
  //     ? host === 'devlomatix.com'
  //     : host === 'localhost:3000'

  // const isDev = process.env.NODE_ENV !== 'production'

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

  // Workspace Access Control (RBAC)
  // if (pathname.startsWith('/workspace') && token) {
  //   const hasWorkspaceAccess =
  //     token.role === 'admin' ||
  //     token.role === 'superadmin' ||
  //     token.role === 'super-admin' ||
  //     token.roles?.some(role => role.title === 'workspace');

  //   if (!hasWorkspaceAccess) {
  //     console.log(`[Middleware] Access denied for ${token.email} to ${pathname}`);
  //     return NextResponse.redirect(new URL('/', request.url))
  //   }
  // }

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
    '/workspace/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/verify',
    '/reset',
    '/:path*'
  ]
}