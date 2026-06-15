import { db } from '@/lib/db'
import { audit } from '@/lib/users/audit'
import { hashPassword, verifyPassword } from './password'
import { passwordPolicyErrors } from './password-policy'
import { revokeOtherSessions } from './session'
import { PasswordPolicyError } from './errors'
import { InvalidCredentialsError } from './login'

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

/**
 * Change the caller's own password (FR-AUTH-010/012, BR-6).
 *
 * Verifies the current password, enforces the complexity policy (§12), rejects
 * reuse of the current/temporary password, rehashes, clears `must_change_password`,
 * and revokes the user's **other** sessions (the current `sid` continues). Writes a
 * `password_change` audit event.
 */
export async function changeOwnPassword(userId: string, currentSid: string, input: ChangePasswordInput): Promise<void> {
  const user = await db.user.findFirst({ where: { id: userId, deletedAt: null } })
  if (!user) throw new InvalidCredentialsError()

  const currentOk = await verifyPassword(input.currentPassword, user.passwordHash)
  if (!currentOk) throw new InvalidCredentialsError()

  const errors = passwordPolicyErrors(input.newPassword)
  if (errors.length > 0) throw new PasswordPolicyError(errors)

  // New must differ from the current/temporary password.
  const sameAsCurrent = await verifyPassword(input.newPassword, user.passwordHash)
  if (sameAsCurrent) throw new PasswordPolicyError(['New password must differ from the current password.'])

  const passwordHash = await hashPassword(input.newPassword)
  await db.user.update({ where: { id: userId }, data: { passwordHash, mustChangePassword: false } })
  await revokeOtherSessions(userId, currentSid)

  await audit({
    actorId: userId,
    action: 'password_change',
    entityType: 'user',
    entityId: userId,
    summary: 'Changed own password',
  })
}
