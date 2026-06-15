import { describe, it, expect, beforeAll } from 'vitest'
import { signSessionToken, verifySessionToken } from '@/lib/auth/jwt'

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-that-is-at-least-32-chars!!'
})

describe('JWT session round-trip', () => {
  it('signs and verifies a session token', async () => {
    const payload = { sub: 'user-123', role: 'admin' as const, sid: 'session-456' }
    const token = await signSessionToken(payload)
    expect(typeof token).toBe('string')
    const result = await verifySessionToken(token)
    expect(result).toEqual(payload)
  })

  it('returns null for a tampered token', async () => {
    const result = await verifySessionToken('not.a.valid.jwt')
    expect(result).toBeNull()
  })

  it('returns null for a token signed with a different secret', async () => {
    const payload = { sub: 'user-123', role: 'editor' as const, sid: 'session-789' }
    const saved = process.env.AUTH_SECRET
    process.env.AUTH_SECRET = 'other-secret-that-is-at-least-32-chars!'
    const token = await signSessionToken(payload)
    process.env.AUTH_SECRET = saved
    const result = await verifySessionToken(token)
    expect(result).toBeNull()
  })
})
