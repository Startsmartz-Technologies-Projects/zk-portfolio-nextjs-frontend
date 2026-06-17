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

/** Revoke all of a user's live sessions except the one to keep (password change — FR-AUTH-010). */
export async function revokeOtherSessions(userId: string, keepSid: string): Promise<number> {
  const res = await db.authSession.updateMany({
    where: { userId, revokedAt: null, NOT: { id: keepSid } },
    data: { revokedAt: new Date() },
  })
  return res.count
}

/** Revoke all of a user's live sessions (admin revoke / password reset — FR-AUTH-011). */
export async function revokeAllSessions(userId: string): Promise<number> {
  const res = await db.authSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return res.count
}

export interface SessionListItem {
  id: string
  userAgent: string | null
  ip: string | null
  createdAt: Date
  lastUsedAt: Date | null
  current: boolean
}

/** List a user's live (non-revoked, non-expired) sessions, newest first; the caller's flagged `current` (FR-AUTH-007). */
export async function listUserSessions(userId: string, currentSid: string): Promise<SessionListItem[]> {
  const rows = await db.authSession.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => ({
    id: r.id,
    userAgent: r.userAgent,
    ip: r.ip,
    createdAt: r.createdAt,
    lastUsedAt: r.lastUsedAt,
    current: r.id === currentSid,
  }))
}

/** Revoke one of the caller's own sessions by id. Returns false if not found / not theirs. */
export async function revokeOwnSession(userId: string, sid: string): Promise<boolean> {
  const res = await db.authSession.updateMany({
    where: { id: sid, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return res.count > 0
}
