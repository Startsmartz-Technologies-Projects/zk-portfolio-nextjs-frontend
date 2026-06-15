import { randomBytes } from 'node:crypto'
import { db } from '@/lib/db'
import { audit } from '@/lib/users/audit'
import { hashPassword } from './password'
import { revokeAllSessions } from './session'
import { isPasswordValid } from './password-policy'

/**
 * Generate a single-use temporary password that satisfies the complexity policy
 * (§12). Random base + one of each character class so it always passes.
 */
export function generateTempPassword(): string {
  const base = randomBytes(12).toString('base64url').slice(0, 12)
  const temp = `${base}A9z!`
  // Defensive: the appended classes guarantee validity, but assert the invariant.
  return isPasswordValid(temp) ? temp : `${base}Aa9!xZ`
}

/**
 * Admin-initiated password reset (FR-AUTH-011), exposed for the USERS user-admin
 * action. Sets a fresh temporary password, flags `must_change_password`, and revokes
 * all of the target user's sessions. Returns the temp password to show once. The
 * `actorId` is the acting admin (from the principal) for the audit entry.
 */
export async function resetPassword(userId: string, actorId: string | null = null): Promise<string> {
  const tempPassword = generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  await db.user.update({ where: { id: userId }, data: { passwordHash, mustChangePassword: true } })
  await revokeAllSessions(userId)

  await audit({
    actorId,
    action: 'password_reset',
    entityType: 'user',
    entityId: userId,
    summary: 'Admin reset user password to a temporary value',
  })

  return tempPassword
}
