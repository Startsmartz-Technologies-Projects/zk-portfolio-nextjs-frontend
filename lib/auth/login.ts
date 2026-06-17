import { db } from '@/lib/db'
import { verifyPassword } from './password'
import { createSession, type SessionMeta } from './session'

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

// A valid-shaped bcrypt hash to compare against when the user is missing, so the
// response time does not reveal whether an account exists (FR-AUTH-002).
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO3vELQ1q1rO1m0Q3oUfQ3oUfQ3oUfQ3o'

/**
 * Authenticate by email + password. Only `active`, non-deleted accounts succeed.
 * On success creates an AuthSession and returns the signed token; on any failure
 * throws a generic InvalidCredentialsError (no account-existence disclosure).
 */
export async function authenticate(email: string, password: string, meta: SessionMeta = {}) {
  const normalized = email.toLowerCase().trim()
  const user = await db.user.findFirst({
    where: { email: normalized, status: 'active', deletedAt: null },
  })

  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !ok) throw new InvalidCredentialsError()

  const { token, expiresAt } = await createSession(user.id, user.role, meta)
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  return { token, expiresAt, user }
}
