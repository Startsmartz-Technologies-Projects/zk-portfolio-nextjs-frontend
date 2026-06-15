'use server'

import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { verifySessionToken } from '@/lib/auth/jwt'
import { SESSION_COOKIE } from '@/lib/auth/cookies'
import { UnauthorizedError } from '@/lib/users/rbac'
import { changeOwnPassword } from '@/lib/auth/password-change'
import { listUserSessions, revokeOwnSession, type SessionListItem } from '@/lib/auth/session'
import { changePasswordSchema } from '@/lib/validation/auth'
import { PasswordPolicyError } from '@/lib/auth/errors'

// Self-service account server actions (FR-AUTH-007/010). These deliberately use
// `auth()` directly — NOT requireCapability — so a `must_change_password` user can
// still reach change-password (the must-change gate lives on the capability guard).

async function requireSession(): Promise<{ userId: string; sid: string }> {
  const principal = await auth()
  if (!principal) throw new UnauthorizedError()
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySessionToken(token) : null
  if (!payload) throw new UnauthorizedError()
  return { userId: principal.user_id, sid: payload.sid }
}

export async function changePasswordAction(input: { currentPassword: string; newPassword: string }): Promise<{ ok: true }> {
  const { userId, sid } = await requireSession()
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    throw new PasswordPolicyError(parsed.error.issues.map((i) => i.message))
  }
  await changeOwnPassword(userId, sid, parsed.data)
  return { ok: true }
}

export async function listSessionsAction(): Promise<SessionListItem[]> {
  const { userId, sid } = await requireSession()
  return listUserSessions(userId, sid)
}

export async function revokeSessionAction(sessionId: string): Promise<{ revoked: boolean }> {
  const { userId } = await requireSession()
  const revoked = await revokeOwnSession(userId, sessionId)
  return { revoked }
}
