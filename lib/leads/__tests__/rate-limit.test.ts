import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit, resetRateLimits } from '@/lib/leads/rate-limit'

describe('rateLimit (fixed window)', () => {
  beforeEach(() => resetRateLimits())

  it('allows up to the limit, then blocks within the window', () => {
    const opts = { limit: 3, windowMs: 1000 }
    expect(rateLimit('ip', opts, 0).allowed).toBe(true) // 1
    expect(rateLimit('ip', opts, 100).allowed).toBe(true) // 2
    const third = rateLimit('ip', opts, 200)
    expect(third).toMatchObject({ allowed: true, remaining: 0 })
    const fourth = rateLimit('ip', opts, 300)
    expect(fourth.allowed).toBe(false)
    expect(fourth.retryAfterMs).toBe(700) // resetAt(1000) - now(300)
  })

  it('resets after the window elapses', () => {
    const opts = { limit: 1, windowMs: 1000 }
    expect(rateLimit('ip', opts, 0).allowed).toBe(true)
    expect(rateLimit('ip', opts, 500).allowed).toBe(false)
    expect(rateLimit('ip', opts, 1000).allowed).toBe(true) // new window
  })

  it('keys are isolated per caller', () => {
    const opts = { limit: 1, windowMs: 1000 }
    expect(rateLimit('a', opts, 0).allowed).toBe(true)
    expect(rateLimit('b', opts, 0).allowed).toBe(true)
    expect(rateLimit('a', opts, 0).allowed).toBe(false)
  })
})
