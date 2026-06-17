import { describe, it, expect, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError, PolicyViolationError } from '@/lib/errors'
import { verifyPassword } from '@/lib/auth/password'
import {
  isLastAdminRemoval,
  listUsers,
  getUser,
  createUser,
  updateUser,
  softDeleteUser,
  restoreUser,
  resetUserPassword,
  revokeUserSessions,
} from '@/lib/data/users'

const hasDb = !!process.env.DATABASE_URL
const TAG = `test_users_${Math.floor(Math.random() * 1e9)}`
const email = (s: string) => `${TAG}_${s}@example.com`

// ── Pure last-admin rule (no DB) ──────────────────────────────────────────

describe('isLastAdminRemoval (FR-USERS-012)', () => {
  const activeAdmin = { role: 'admin' as const, status: 'active' as const, deletedAt: null }
  it('blocks demote/suspend/delete of the sole active admin', () => {
    expect(isLastAdminRemoval(activeAdmin, { role: 'editor' }, 1)).toBe(true)
    expect(isLastAdminRemoval(activeAdmin, { status: 'suspended' }, 1)).toBe(true)
    expect(isLastAdminRemoval(activeAdmin, { deleting: true }, 1)).toBe(true)
  })
  it('allows when another active admin exists', () => {
    expect(isLastAdminRemoval(activeAdmin, { role: 'editor' }, 2)).toBe(false)
  })
  it('ignores non-admins and no-op edits', () => {
    expect(isLastAdminRemoval({ role: 'editor', status: 'active', deletedAt: null }, { deleting: true }, 1)).toBe(false)
    expect(isLastAdminRemoval(activeAdmin, { role: 'admin' }, 1)).toBe(false) // name-only edit
  })
})

describe.skipIf(!hasDb)('user administration data layer (integration)', () => {
  afterAll(async () => {
    await db.authSession.deleteMany({ where: { user: { email: { startsWith: TAG } } } })
    await db.user.deleteMany({ where: { email: { startsWith: TAG } } })
    await db.$disconnect()
  })

  it('creates an active user with a temp password and never exposes the hash', async () => {
    const { user, tempPassword } = await createUser(null, { fullName: 'Ops One', email: email('one'), role: 'editor' })
    expect(user.status).toBe('active')
    expect(user.mustChangePassword).toBe(true)
    expect(tempPassword).toBeTruthy()
    expect((user as Record<string, unknown>).passwordHash).toBeUndefined()

    // duplicate email (case-insensitive)
    await expect(createUser(null, { fullName: 'Dup', email: email('one').toUpperCase(), role: 'editor' })).rejects.toBeInstanceOf(
      ConflictError,
    )
  })

  it('lists (no hash, excludes deleted) and gets one', async () => {
    const { data } = await listUsers({ q: TAG, pageSize: 100 })
    expect(data.length).toBeGreaterThanOrEqual(1)
    expect((data[0] as Record<string, unknown>).passwordHash).toBeUndefined()

    const one = data[0]
    expect(await getUser(one.id)).toMatchObject({ id: one.id })
    await expect(getUser('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('edits name/email and rejects a duplicate email (409)', async () => {
    const a = (await createUser(null, { fullName: 'A', email: email('a'), role: 'editor' })).user
    const b = (await createUser(null, { fullName: 'B', email: email('b'), role: 'editor' })).user

    const updated = await updateUser(null, a.id, { fullName: 'A renamed' })
    expect(updated.fullName).toBe('A renamed')
    await expect(updateUser(null, a.id, { email: email('b') })).rejects.toBeInstanceOf(ConflictError)
  })

  it('enforces the self-action rule on role change and delete (422)', async () => {
    const u = (await createUser(null, { fullName: 'Self', email: email('self'), role: 'editor' })).user
    await expect(updateUser(u.id, u.id, { role: 'admin' })).rejects.toBeInstanceOf(PolicyViolationError)
    await expect(softDeleteUser(u.id, u.id)).rejects.toBeInstanceOf(PolicyViolationError)
  })

  it('soft-deletes (excluded from lists) and restores', async () => {
    const u = (await createUser(null, { fullName: 'Del', email: email('del'), role: 'editor' })).user
    await softDeleteUser(null, u.id)
    expect((await listUsers({ q: `${TAG}_del`, pageSize: 100 })).data).toHaveLength(0)
    const restored = await restoreUser(null, u.id)
    expect(restored.deletedAt).toBeNull()
  })

  it('resets a password (temp + must-change + revoke) and revokes sessions', async () => {
    const u = (await createUser(null, { fullName: 'Reset', email: email('reset'), role: 'editor' })).user
    const future = new Date(Date.now() + 86_400_000)
    await db.authSession.createMany({ data: [{ userId: u.id, expiresAt: future }, { userId: u.id, expiresAt: future }] })

    const { tempPassword } = await resetUserPassword(null, u.id)
    const after = await db.user.findUniqueOrThrow({ where: { id: u.id } })
    expect(after.mustChangePassword).toBe(true)
    expect(await verifyPassword(tempPassword, after.passwordHash)).toBe(true)
    expect(await db.authSession.count({ where: { userId: u.id, revokedAt: null } })).toBe(0)

    // revoke-sessions on a fresh session set
    await db.authSession.create({ data: { userId: u.id, expiresAt: future } })
    const { revoked } = await revokeUserSessions(null, u.id)
    expect(revoked).toBeGreaterThanOrEqual(1)
  })
})
