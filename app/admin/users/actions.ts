'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  softDeleteUser,
  restoreUser,
  resetUserPassword,
  revokeUserSessions,
} from '@/lib/data/users'
import { createUserSchema, updateUserSchema, listUsersSchema } from '@/lib/validation/users'

// User administration is Admin-only (capability `user_admin`, §8.2).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

export async function listUsersAction(input: unknown = {}) {
  await requireCapability('user_admin')
  return listUsers(parse(listUsersSchema, input))
}

export async function getUserAction(id: string) {
  await requireCapability('user_admin')
  return getUser(id)
}

export async function createUserAction(input: unknown) {
  const principal = await requireCapability('user_admin')
  const data = parse(createUserSchema, input)
  const result = await createUser(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'user', entityId: result.user.id, summary: `Created ${data.role} '${data.email}'` })
  return result // { user, tempPassword } — temp shown once
}

export async function updateUserAction(id: string, input: unknown) {
  const principal = await requireCapability('user_admin')
  const data = parse(updateUserSchema, input)
  const user = await updateUser(principal.user_id, id, data)
  const action = data.role !== undefined ? 'role_change' : 'update'
  await audit({ actorId: principal.user_id, action, entityType: 'user', entityId: id, summary: `Updated user '${user.email}'`, metadata: { fields: Object.keys(data) } })
  return user
}

export async function deleteUserAction(id: string) {
  const principal = await requireCapability('user_admin')
  await softDeleteUser(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'user', entityId: id, summary: 'Soft-deleted user' })
  return { ok: true as const }
}

export async function restoreUserAction(id: string) {
  const principal = await requireCapability('user_admin')
  const user = await restoreUser(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'user', entityId: id, summary: `Restored user '${user.email}'` })
  return user
}

export async function resetPasswordAction(id: string) {
  const principal = await requireCapability('user_admin')
  // resetUserPassword → AUTH resetPassword writes the password_reset audit itself.
  return resetUserPassword(principal.user_id, id) // { tempPassword } — shown once
}

export async function revokeSessionsAction(id: string) {
  const principal = await requireCapability('user_admin')
  const result = await revokeUserSessions(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'session_revoke', entityType: 'user', entityId: id, summary: `Revoked all sessions (${result.revoked})` })
  return result
}
