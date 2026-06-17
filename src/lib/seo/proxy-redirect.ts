import type { resolveRedirect } from '@/lib/data/seo'

// Pure decision helpers for the SEO redirect half of proxy.ts (web-fe-redirects /
// FR-SEO-011/020). Kept separate from the proxy so the branching is unit-testable without
// a Next request/runtime.

export type RedirectLookup = Awaited<ReturnType<typeof resolveRedirect>>

/** The admin area is session-guarded and never SEO-redirected. */
export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

/**
 * Map a `resolveRedirect` result to a concrete redirect (target path + HTTP status), or
 * null to pass the request through. The store holds only stale→live entries (recorded on
 * publish/slug-change, collision-guarded against live URLs), so a live route never matches
 * — no redirect loop. Defaults to 301 if a matched row carries no status.
 */
export function toRedirect(result: RedirectLookup): { toPath: string; status: number } | null {
  if (result.match && result.toPath) return { toPath: result.toPath, status: result.status ?? 301 }
  return null
}
