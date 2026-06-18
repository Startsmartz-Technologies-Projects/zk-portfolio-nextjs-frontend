import type { NextResponse } from 'next/server'

export const SESSION_COOKIE = 'zk_session'
const COOKIE_MAX_AGE = 8 * 60 * 60 // 8 h sliding window (re-issued by middleware on activity)

// Set COOKIE_SECURE=false when running on plain HTTP in production (e.g. direct HTTP
// deployment). Defaults to true when NODE_ENV=production.
const isSecure =
  process.env.COOKIE_SECURE === 'true' ||
  (process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production')

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
