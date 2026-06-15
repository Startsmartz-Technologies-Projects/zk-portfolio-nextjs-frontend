import { db } from '@/lib/db'
import { signSessionToken, type Role } from './jwt'

// Absolute session cap (FR-AUTH-008): a session cannot outlive this regardless of
// sliding cookie renewal. Mirrored on AuthSession.expires_at and re-checked by auth().
const ABSOLUTE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionMeta {
  ip?: string | null
  userAgent?: string | null
}

/** Create an AuthSession row and sign the session JWT carrying its id as `sid`. */
export async function createSession(userId: string, role: Role, meta: SessionMeta = {}) {
  const expiresAt = new Date(Date.now() + ABSOLUTE_MAX_AGE_MS)
  const session = await db.authSession.create({
    data: { userId, expiresAt, ip: meta.ip ?? null, userAgent: meta.userAgent ?? null },
  })
  const token = await signSessionToken({ sub: userId, role, sid: session.id })
  return { token, sid: session.id, expiresAt }
}

/** Revoke a session by id (logout / admin-revoke / password change). Idempotent. */
export async function revokeSession(sid: string): Promise<void> {
  await db.authSession.updateMany({
    where: { id: sid, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
