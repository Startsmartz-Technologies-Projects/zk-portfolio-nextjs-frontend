'use server'

import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { verifySessionToken } from '@/lib/auth/jwt'
import { SESSION_COOKIE } from '@/lib/auth/cookies'
import { UnauthorizedError } from '@/lib/users/rbac'
import { changeOwnPassword } from '@/lib/auth/password-change'
import {
  listUserSessions,
  revokeOwnSession,
  revokeOtherSessions,
  type SessionListItem,
} from '@/lib/auth/session'
import { changePasswordSchema } from '@/lib/validation/auth'
import { PasswordPolicyError } from '@/lib/auth/errors'
import { InvalidCredentialsError } from '@/lib/auth/login'

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

// "Log out everywhere" — revoke every other live session, keeping the caller's current
// one (FR-AUTH-007). Distinct from the password-change revoke (which is automatic).
export async function signOutOtherSessionsAction(): Promise<{ count: number }> {
  const { userId, sid } = await requireSession()
  const count = await revokeOtherSessions(userId, sid)
  return { count }
}

// Result-returning change-password for the UI. Unlike `changePasswordAction` (which
// throws), this returns a discriminated result so the client can branch reliably —
// server-action error messages are redacted in production, so a thrown error can't be
// inspected client-side (FR-AUTH-010/012; validation per AUTH §12).
export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_current' | 'policy' | 'unauthorized'; messages?: string[] }

export async function submitPasswordChange(input: {
  currentPassword: string
  newPassword: string
}): Promise<ChangePasswordResult> {
  let session: { userId: string; sid: string }
  try {
    session = await requireSession()
  } catch {
    return { ok: false, reason: 'unauthorized' }
  }

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, reason: 'policy', messages: parsed.error.issues.map((i) => i.message) }
  }

  try {
    await changeOwnPassword(session.userId, session.sid, parsed.data)
    return { ok: true }
  } catch (e) {
    if (e instanceof PasswordPolicyError) {
      return { ok: false, reason: 'policy', messages: e.details.map((d) => d.message) }
    }
    if (e instanceof InvalidCredentialsError) return { ok: false, reason: 'invalid_current' }
    if (e instanceof UnauthorizedError) return { ok: false, reason: 'unauthorized' }
    throw e
  }
}
