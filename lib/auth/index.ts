import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifySessionToken } from './jwt'
import { SESSION_COOKIE } from './cookies'

export type { SessionPayload, Role } from './jwt'

export interface Principal {
  user_id: string
  email: string
  full_name: string
  role: 'admin' | 'editor'
  status: 'active' | 'suspended'
  must_change_password: boolean
}

/**
 * The authenticated principal for server components / server actions.
 *
 * Performs the per-request validity re-check (FR-AUTH-015): verifies the session
 * JWT, then confirms the AuthSession is live (not revoked, not past its absolute
 * expiry) and the user is still `active`/non-deleted — never trusting the token
 * alone. Returns null when unauthenticated or invalid.
 *
 * Node runtime only (uses Prisma). The Edge middleware (proxy.ts) does the cheap
 * JWT-only gate; this is the authoritative server-side check.
 */
export async function auth(): Promise<Principal | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await verifySessionToken(token)
  if (!payload) return null

  const session = await db.authSession.findUnique({ where: { id: payload.sid } })
  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null

  const user = await db.user.findFirst({
    where: { id: payload.sub, status: 'active', deletedAt: null },
  })
  if (!user) return null

  // Best-effort last-seen update; never fail the request on this.
  await db.authSession
    .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {})

  return {
    user_id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    status: user.status,
    must_change_password: user.mustChangePassword,
  }
}
