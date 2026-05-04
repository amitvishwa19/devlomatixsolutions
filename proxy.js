import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/account') && !pathname.startsWith('/account/api')) {
    const sessionToken = request.cookies.get('next-auth.session-token')
    const secureToken = request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionToken && !secureToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/account'],
}