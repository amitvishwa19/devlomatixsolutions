import { NextResponse } from 'next/server'

export async function GET(request) {
  const url = new URL(request.url)
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  
  console.error('Auth Error:', error, errorDescription)
  
  return NextResponse.redirect(new URL('/login?error=' + (error || 'unknown'), request.url))
}