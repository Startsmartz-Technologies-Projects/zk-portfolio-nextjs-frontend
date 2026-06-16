import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/jwt'
import { SESSION_COOKIE } from '@/lib/auth/cookies'
import { resolveRedirect } from '@/lib/data/seo'
import { isAdminPath, toRedirect } from '@/src/lib/seo/proxy-redirect'

// Next 16 proxy (formerly middleware) — always runs on the Node.js runtime, so it can use
// Prisma directly. Two concerns share the one proxy file:
//   1. /admin/*  — session guard (auth-be-2).
//   2. public/*  — SEO redirect resolution (web-fe-redirects / FR-SEO-011/020): consult the
//      redirect store (stale slug / legacy-id / legacy .html → current path) and 301/302.
// The store only contains stale→live entries, so a live route never matches and passes
// through (no loop). The legacy static .html paths also remain covered by next.config
// redirects(), which run ahead of the proxy.

async function guardAdmin(request: NextRequest, pathname: string): Promise<NextResponse> {
  // Let the login page through unconditionally
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const principal = token ? await verifySessionToken(token) : null

  if (!principal) {
    const loginUrl = new URL('/admin/login', request.url)
    // Preserve the intended admin path so login can return the user there (FR-AUTH-013).
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Bare /admin → the Dashboard landing — a real HTTP redirect for every client
  // (the authoritative auth() re-check still runs in the app layout).
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // DB-side revocation + user-status check added in auth-be-2
  return NextResponse.next()
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (isAdminPath(pathname)) {
    return guardAdmin(request, pathname)
  }

  // Public path: resolve an SEO redirect (O(1) indexed lookup on the unique from_path).
  const redirect = toRedirect(await resolveRedirect(pathname))
  if (redirect) {
    const destination = redirect.toPath.startsWith('http')
      ? new URL(redirect.toPath)
      : new URL(redirect.toPath, request.url)
    return NextResponse.redirect(destination, redirect.status)
  }

  return NextResponse.next()
}

// Run on admin + all public paths; skip Next internals, api routes, and static assets.
// `.html` is deliberately NOT excluded so legacy file paths (e.g. "Service Details.html")
// can be resolved. NB: Next's route-source parser forbids *capturing* groups in the
// matcher — the extension alternation must be a non-capturing group `(?:…)`.
export const config = {
  matcher: [
    '/((?!_next/|api/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|mjs|map|woff|woff2|ttf|txt|xml)$).*)',
  ],
}
