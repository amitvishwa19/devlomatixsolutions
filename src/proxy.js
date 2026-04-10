'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request) {
  const token = await getToken({ req: request })

  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const host = request.headers.get('host') || ''

  const isMainDomain =
    process.env.NODE_ENV === 'production'
      ? host === 'devlomatix.com'
      : host === 'localhost:3000'

  const isDev = process.env.NODE_ENV !== 'production'



  // =========================
  // 🔒 AUTH PROTECTION
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

  // 🚫 Not logged in → block protected routes
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 🔐 Logged in → block login page
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }

  // =========================
  // ✅ DEFAULT
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