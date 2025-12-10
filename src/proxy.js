'use server'
import { NextResponse, NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'



export async function proxy(request) {


  // console.log(cookies().get("access-token"));

  // const res = cookies().set("access-token", 'dadasddadadadasd')

  const token = await getToken({ req: request })
  const url = request.nextUrl
  const path = request.nextUrl.pathname
  const response = NextResponse.next()
  response.cookies.set('access-token', 'Your secret token')


  if (path !== '/login') {
    // console.log('Incoming url', path)
    // const response = NextResponse.next()
    // response.cookies.set('access-token', 'Your secret token')


  }

  // setUrlSession('this is test session')

  // const res = await axios.get(`${process.env.APP_URL}/api/v1`)


  const isPublicPath =
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path === '/verify' ||
    path === '/reset' ||
    path === '/api/v4/workflows/:path*'





  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL(`/login`, request.nextUrl))
  }


}


// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/workspace/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/verify'
  ]
}