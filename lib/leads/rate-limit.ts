// Per-IP rate limiting for the public intake (FR-LEADS-005/022, BR-1/BR-8). A simple
// in-process fixed-window counter — best-effort spam-flood deflection, NOT a security
// boundary. It is per-instance (a multi-instance deploy should move this to a shared
// store such as Redis); the honeypot + validation are the other spam layers. `now` is
// injectable so the window logic is unit-testable without real time.

export interface RateLimitOptions {
  /** Max allowed hits within the window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** Milliseconds until the current window resets (for a `Retry-After` header). */
  retryAfterMs: number
}

const buckets = new Map<string, { count: number; resetAt: number }>()

/** The submit endpoint: 5 submissions / 10 min / IP. */
export const SUBMIT_RATE_LIMIT: RateLimitOptions = { limit: 5, windowMs: 10 * 60 * 1000 }
/** The attachment-upload endpoint: 20 uploads / 10 min / IP. */
export const UPLOAD_RATE_LIMIT: RateLimitOptions = { limit: 20, windowMs: 10 * 60 * 1000 }

/** Count a hit against `key` and report whether it is within the window's limit. */
export function rateLimit(key: string, opts: RateLimitOptions, now: number = Date.now()): RateLimitResult {
  const bucket = buckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { allowed: true, remaining: opts.limit - 1, retryAfterMs: 0 }
  }
  if (bucket.count >= opts.limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, bucket.resetAt - now) }
  }
  bucket.count += 1
  return { allowed: true, remaining: opts.limit - bucket.count, retryAfterMs: 0 }
}

/** Clear all counters (test helper / instance reset). */
export function resetRateLimits(): void {
  buckets.clear()
}
