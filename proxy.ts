import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/jwt'
import { SESSION_COOKIE } from '@/lib/auth/cookies'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Let the login page through unconditionally
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const principal = token ? await verifySessionToken(token) : null

  if (!principal) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // DB-side revocation + user-status check added in auth-be-2
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
