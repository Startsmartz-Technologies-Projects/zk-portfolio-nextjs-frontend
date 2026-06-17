import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { authenticate, InvalidCredentialsError } from '@/lib/auth/login'

// Integration test — needs DATABASE_URL (loaded from .env via vitest setupFiles).
// Skips cleanly where no DB is configured (e.g. CI without a test database).
const hasDb = !!process.env.DATABASE_URL

const EMAIL = `test-login-${Math.floor(Math.random() * 1e9)}@example.com`
const PASSWORD = 'Test-Passw0rd!'
let userId = ''

describe.skipIf(!hasDb)('authenticate (integration)', () => {
  beforeAll(async () => {
    process.env.AUTH_SECRET ||= 'test-secret-that-is-at-least-32-chars!!'
    const u = await db.user.create({
      data: {
        email: EMAIL,
        passwordHash: await hashPassword(PASSWORD),
        fullName: 'Test User',
        role: 'editor',
        status: 'active',
      },
    })
    userId = u.id
  })

  afterAll(async () => {
    if (userId) {
      await db.authSession.deleteMany({ where: { userId } })
      await db.user.delete({ where: { id: userId } })
    }
    await db.$disconnect()
  })

  it('succeeds with correct credentials and creates a session', async () => {
    const { token, user } = await authenticate(EMAIL, PASSWORD, { ip: '127.0.0.1', userAgent: 'vitest' })
    expect(typeof token).toBe('string')
    expect(user.id).toBe(userId)
    const sessions = await db.authSession.findMany({ where: { userId } })
    expect(sessions.length).toBeGreaterThanOrEqual(1)
  })

  it('rejects a wrong password (generic error)', async () => {
    await expect(authenticate(EMAIL, 'wrong-password', {})).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('rejects an unknown email (generic error)', async () => {
    await expect(authenticate('does-not-exist@example.com', PASSWORD, {})).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    )
  })

  it('rejects a suspended account', async () => {
    await db.user.update({ where: { id: userId }, data: { status: 'suspended' } })
    await expect(authenticate(EMAIL, PASSWORD, {})).rejects.toBeInstanceOf(InvalidCredentialsError)
    await db.user.update({ where: { id: userId }, data: { status: 'active' } })
  })
})
