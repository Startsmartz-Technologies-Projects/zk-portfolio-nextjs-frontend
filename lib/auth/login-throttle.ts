// Login rate-limiting + lockout (SRS auth §12, FR-AUTH-016).
//
// ~10 attempts/min per IP, and a 10-consecutive-failure → 15-min lockout per account
// (cleared on a successful login). In-memory per-process store — fine for the single
// Next.js node instance in v1; a DB/Redis-backed store is the future multi-instance
// hardening. All functions take an optional `now` for deterministic tests.

export const ACCOUNT_MAX_FAILURES = 10
export const ACCOUNT_LOCKOUT_MS = 15 * 60 * 1000
export const IP_WINDOW_MS = 60 * 1000
export const IP_MAX_ATTEMPTS = 10

interface AccountState {
  failures: number
  lockedUntil: number | null
}
interface IpState {
  count: number
  windowStart: number
}

const accounts = new Map<string, AccountState>()
const ips = new Map<string, IpState>()

const keyOf = (email: string) => email.toLowerCase().trim()

export type ThrottleReason = 'account_locked' | 'ip_rate'
export interface ThrottleResult {
  allowed: boolean
  reason?: ThrottleReason
  retryAfterMs?: number
}

/** Check whether a login attempt for `email` from `ip` is currently allowed. */
export function checkLogin(email: string, ip: string, now: number = Date.now()): ThrottleResult {
  const account = accounts.get(keyOf(email))
  if (account?.lockedUntil && account.lockedUntil > now) {
    return { allowed: false, reason: 'account_locked', retryAfterMs: account.lockedUntil - now }
  }

  const ipState = ips.get(ip)
  if (ipState && now - ipState.windowStart < IP_WINDOW_MS && ipState.count >= IP_MAX_ATTEMPTS) {
    return { allowed: false, reason: 'ip_rate', retryAfterMs: IP_WINDOW_MS - (now - ipState.windowStart) }
  }

  return { allowed: true }
}

/** Record a failed attempt; locks the account after the threshold. */
export function recordFailure(email: string, ip: string, now: number = Date.now()): void {
  const ipState = ips.get(ip)
  if (!ipState || now - ipState.windowStart >= IP_WINDOW_MS) {
    ips.set(ip, { count: 1, windowStart: now })
  } else {
    ipState.count++
  }

  const key = keyOf(email)
  const account = accounts.get(key) ?? { failures: 0, lockedUntil: null }
  account.failures++
  if (account.failures >= ACCOUNT_MAX_FAILURES) {
    account.lockedUntil = now + ACCOUNT_LOCKOUT_MS
    account.failures = 0
  }
  accounts.set(key, account)
}

/** Clear an account's failure/lock state on a successful login. */
export function recordSuccess(email: string): void {
  accounts.delete(keyOf(email))
}

/** Whether an account is currently locked out. */
export function isLockedOut(email: string, now: number = Date.now()): boolean {
  const account = accounts.get(keyOf(email))
  return !!account?.lockedUntil && account.lockedUntil > now
}

/** Test-only: reset all in-memory counters. */
export function _resetThrottle(): void {
  accounts.clear()
  ips.clear()
}
