import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkLogin,
  recordFailure,
  recordSuccess,
  isLockedOut,
  _resetThrottle,
  ACCOUNT_MAX_FAILURES,
  ACCOUNT_LOCKOUT_MS,
  IP_MAX_ATTEMPTS,
} from '@/lib/auth/login-throttle'

beforeEach(() => _resetThrottle())

const T0 = 1_000_000

describe('login throttle (FR-AUTH-016)', () => {
  it('locks an account after the failure threshold and clears after the cooldown', () => {
    // Distinct IPs so the per-IP limit doesn't mask the per-account lock.
    for (let i = 0; i < ACCOUNT_MAX_FAILURES; i++) {
      expect(isLockedOut('user@x.com', T0)).toBe(false)
      recordFailure('user@x.com', `ip-${i}`, T0)
    }
    expect(isLockedOut('user@x.com', T0)).toBe(true)
    expect(checkLogin('user@x.com', 'ip-new', T0)).toMatchObject({ allowed: false, reason: 'account_locked' })

    // After the cooldown elapses, the account is allowed again.
    expect(checkLogin('user@x.com', 'ip-new', T0 + ACCOUNT_LOCKOUT_MS + 1)).toEqual({ allowed: true })
  })

  it('a successful login clears the failure counter', () => {
    for (let i = 0; i < ACCOUNT_MAX_FAILURES - 1; i++) recordFailure('user@x.com', `ip-${i}`, T0)
    recordSuccess('user@x.com')
    // One more failure should not trip the lock (counter was reset).
    recordFailure('user@x.com', 'ip-z', T0)
    expect(isLockedOut('user@x.com', T0)).toBe(false)
  })

  it('rate-limits per IP within the window', () => {
    for (let i = 0; i < IP_MAX_ATTEMPTS; i++) recordFailure(`u${i}@x.com`, '9.9.9.9', T0)
    expect(checkLogin('fresh@x.com', '9.9.9.9', T0)).toMatchObject({ allowed: false, reason: 'ip_rate' })
    // A different IP is unaffected.
    expect(checkLogin('fresh@x.com', '1.1.1.1', T0)).toEqual({ allowed: true })
  })

  it('normalizes the account key (case/whitespace insensitive)', () => {
    for (let i = 0; i < ACCOUNT_MAX_FAILURES; i++) recordFailure('  User@X.com ', `ip-${i}`, T0)
    expect(isLockedOut('user@x.com', T0)).toBe(true)
  })
})
