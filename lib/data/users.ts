import { db } from '@/lib/db'
import { Prisma, type Role, type UserStatus } from '@prisma/client'
import { ConflictError, NotFoundError, PolicyViolationError } from '@/lib/errors'
import { hashPassword } from '@/lib/auth/password'
import { generateTempPassword, resetPassword } from '@/lib/auth/password-reset'
import { revokeAllSessions } from '@/lib/auth/session'
import type { CreateUserInput, UpdateUserInput, ListUsersInput } from '@/lib/validation/users'

// Projection that NEVER includes the password hash (FR-USERS-003).
const USER_VIEW = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  status: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.UserSelect

export type UserView = Prisma.UserGetPayload<{ select: typeof USER_VIEW }>

const normalizeEmail = (email: string) => email.toLowerCase().trim()

// ── Reads ──────────────────────────────────────────────────────────────────

export async function listUsers(filters: ListUsersInput = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))
  const where: Prisma.UserWhereInput = filters.includeDeleted ? {} : { deletedAt: null }
  if (filters.role) where.role = filters.role
  if (filters.status) where.status = filters.status
  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q, mode: 'insensitive' } },
      { email: { contains: filters.q, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    db.user.findMany({ where, select: USER_VIEW, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    db.user.count({ where }),
  ])
  return { data, meta: { page, pageSize, total } }
}

export async function getUser(id: string): Promise<UserView> {
  const user = await db.user.findFirst({ where: { id, deletedAt: null }, select: USER_VIEW })
  if (!user) throw new NotFoundError('User not found')
  return user
}

// ── Safety rules (FR-USERS-012/013) ─────────────────────────────────────────

function assertNotSelfAction(actorId: string | null, targetId: string, change: 'role' | 'status' | 'delete'): void {
  if (actorId && actorId === targetId) {
    throw new PolicyViolationError(`You cannot change your own ${change === 'delete' ? 'account (delete)' : change}.`, [
      { rule: 'self_action', change },
    ])
  }
}

/**
 * Pure decision (FR-USERS-012, BR-3): would this change remove the last active admin?
 * True only when `target` is currently an active admin, the change strips that
 * (demote / suspend / delete), and it's the only active admin left.
 */
export function isLastAdminRemoval(
  target: { role: Role; status: UserStatus; deletedAt: Date | null },
  next: { role?: Role; status?: UserStatus; deleting?: boolean },
  activeAdminCount: number,
): boolean {
  const isActiveAdmin = target.role === 'admin' && target.status === 'active' && !target.deletedAt
  if (!isActiveAdmin) return false
  const losesAdmin =
    next.deleting === true || (next.role !== undefined && next.role !== 'admin') || next.status === 'suspended'
  return losesAdmin && activeAdminCount <= 1
}

async function assertNotLastAdminRemoval(
  target: { role: Role; status: UserStatus; deletedAt: Date | null },
  next: { role?: Role; status?: UserStatus; deleting?: boolean },
): Promise<void> {
  const isActiveAdmin = target.role === 'admin' && target.status === 'active' && !target.deletedAt
  if (!isActiveAdmin) return
  const losesAdmin =
    next.deleting === true || (next.role !== undefined && next.role !== 'admin') || next.status === 'suspended'
  if (!losesAdmin) return

  const activeAdminCount = await db.user.count({ where: { role: 'admin', status: 'active', deletedAt: null } })
  if (isLastAdminRemoval(target, next, activeAdminCount)) {
    throw new PolicyViolationError('Cannot remove the last active admin.', [{ rule: 'last_admin' }])
  }
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function createUser(actorId: string | null, input: CreateUserInput): Promise<{ user: UserView; tempPassword: string }> {
  const email = normalizeEmail(input.email)
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) throw new ConflictError('A user with this email already exists', [{ field: 'email' }])

  const tempPassword = generateTempPassword()
  const user = await db.user.create({
    data: {
      email,
      fullName: input.fullName,
      role: input.role,
      status: 'active',
      passwordHash: await hashPassword(tempPassword),
      mustChangePassword: true,
      createdById: actorId,
      updatedById: actorId,
    },
    select: USER_VIEW,
  })
  return { user, tempPassword }
}

export async function updateUser(actorId: string | null, id: string, input: UpdateUserInput): Promise<UserView> {
  const target = await db.user.findFirst({ where: { id, deletedAt: null } })
  if (!target) throw new NotFoundError('User not found')

  const changingRole = input.role !== undefined && input.role !== target.role
  const suspending = input.status === 'suspended' && target.status !== 'suspended'

  if (changingRole) assertNotSelfAction(actorId, id, 'role')
  if (suspending) assertNotSelfAction(actorId, id, 'status')
  await assertNotLastAdminRemoval(target, { role: input.role, status: input.status })

  if (input.email) {
    const email = normalizeEmail(input.email)
    if (email !== target.email) {
      const dupe = await db.user.findUnique({ where: { email } })
      if (dupe) throw new ConflictError('A user with this email already exists', [{ field: 'email' }])
    }
  }

  const data: Prisma.UserUncheckedUpdateInput = { updatedById: actorId }
  if (input.fullName !== undefined) data.fullName = input.fullName
  if (input.email !== undefined) data.email = normalizeEmail(input.email)
  if (input.role !== undefined) data.role = input.role
  if (input.status !== undefined) data.status = input.status

  const updated = await db.user.update({ where: { id }, data, select: USER_VIEW })
  // Suspending a user ends their sessions (edge 5).
  if (suspending) await revokeAllSessions(id)
  return updated
}

export async function softDeleteUser(actorId: string | null, id: string): Promise<void> {
  const target = await db.user.findFirst({ where: { id, deletedAt: null } })
  if (!target) throw new NotFoundError('User not found')
  assertNotSelfAction(actorId, id, 'delete')
  await assertNotLastAdminRemoval(target, { deleting: true })

  await db.user.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId } })
  await revokeAllSessions(id) // a deleted account can no longer authenticate
}

export async function restoreUser(actorId: string | null, id: string): Promise<UserView> {
  const target = await db.user.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!target) throw new NotFoundError('Deleted user not found')
  return db.user.update({ where: { id }, data: { deletedAt: null, updatedById: actorId }, select: USER_VIEW })
}

/** Admin reset → delegates to AUTH (temp password + must_change_password + revoke sessions, FR-USERS-008). */
export async function resetUserPassword(actorId: string | null, id: string): Promise<{ tempPassword: string }> {
  const target = await db.user.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!target) throw new NotFoundError('User not found')
  const tempPassword = await resetPassword(id, actorId)
  return { tempPassword }
}

/** Force re-login without a password change → delegates to AUTH (FR-USERS-009). */
export async function revokeUserSessions(_actorId: string | null, id: string): Promise<{ revoked: number }> {
  const target = await db.user.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!target) throw new NotFoundError('User not found')
  const revoked = await revokeAllSessions(id)
  return { revoked }
}
