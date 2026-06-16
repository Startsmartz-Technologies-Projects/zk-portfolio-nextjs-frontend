import type { NextRequest } from 'next/server'

// Request-metadata helpers for the public intake (FR-LEADS-004): the submitter IP
// (for spam/abuse analysis + rate-limit keying) and the source page. Retained for
// spam handling only (BR-7) — never echoed back to the client.

/** Best-effort client IP from the proxy headers (`x-forwarded-for` first hop, then `x-real-ip`). */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** The page the form was submitted from, from the `referer` path; defaults to the Let's-Collaborate page. */
export function sourcePageFrom(req: NextRequest, fallback = '/lets-collaborate'): string {
  const ref = req.headers.get('referer')
  if (!ref) return fallback
  try {
    return new URL(ref).pathname || fallback
  } catch {
    return fallback
  }
}
