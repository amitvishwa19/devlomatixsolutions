import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/wishlist')) {
    const sessionToken = request.cookies.get('next-auth.session-token');
    const token = request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken && !token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/orders/:path*', '/wishlist/:path*'],
};