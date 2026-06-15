import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { changeOwnPassword } from '@/lib/auth/password-change'
import { InvalidCredentialsError } from '@/lib/auth/login'
import { PasswordPolicyError } from '@/lib/auth/errors'
import { listUserSessions, revokeOwnSession, revokeAllSessions } from '@/lib/auth/session'
import { resetPassword, generateTempPassword } from '@/lib/auth/password-reset'
import { isPasswordValid } from '@/lib/auth/password-policy'

const hasDb = !!process.env.DATABASE_URL
const TAG = `test_account_${Math.floor(Math.random() * 1e9)}`
const CURRENT = 'Curr3nt-Passw0rd!'
const NEW = 'Brand-New-Passw0rd!'

let userId = ''

async function freshUserWithSessions() {
  const u = await db.user.create({
    data: { email: `${TAG}@example.com`, passwordHash: await hashPassword(CURRENT), fullName: 'Acct', role: 'editor', status: 'active' },
  })
  const future = new Date(Date.now() + 86_400_000)
  const current = await db.authSession.create({ data: { userId: u.id, expiresAt: future } })
  const other = await db.authSession.create({ data: { userId: u.id, expiresAt: future } })
  return { u, currentSid: current.id, otherSid: other.id }
}

describe('generateTempPassword (unit)', () => {
  it('always satisfies the policy', () => {
    for (let i = 0; i < 20; i++) expect(isPasswordValid(generateTempPassword())).toBe(true)
  })
})

describe.skipIf(!hasDb)('account services (integration)', () => {
  beforeEach(async () => {
    await db.authSession.deleteMany({ where: { user: { email: `${TAG}@example.com` } } })
    await db.user.deleteMany({ where: { email: `${TAG}@example.com` } })
  })

  afterAll(async () => {
    await db.authSession.deleteMany({ where: { user: { email: `${TAG}@example.com` } } })
    await db.user.deleteMany({ where: { email: `${TAG}@example.com` } })
    await db.$disconnect()
  })

  it('changes the password, clears must-change, and revokes other sessions but keeps the current', async () => {
    const { u, currentSid, otherSid } = await freshUserWithSessions()
    await db.user.update({ where: { id: u.id }, data: { mustChangePassword: true } })

    await changeOwnPassword(u.id, currentSid, { currentPassword: CURRENT, newPassword: NEW })

    const updated = await db.user.findUniqueOrThrow({ where: { id: u.id } })
    expect(await verifyPassword(NEW, updated.passwordHash)).toBe(true)
    expect(updated.mustChangePassword).toBe(false)
    expect((await db.authSession.findUniqueOrThrow({ where: { id: currentSid } })).revokedAt).toBeNull()
    expect((await db.authSession.findUniqueOrThrow({ where: { id: otherSid } })).revokedAt).not.toBeNull()
  })

  it('rejects a wrong current password', async () => {
    const { u, currentSid } = await freshUserWithSessions()
    await expect(changeOwnPassword(u.id, currentSid, { currentPassword: 'wrong', newPassword: NEW })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    )
  })

  it('rejects a weak new password and reuse of the current password', async () => {
    const { u, currentSid } = await freshUserWithSessions()
    await expect(changeOwnPassword(u.id, currentSid, { currentPassword: CURRENT, newPassword: 'weak' })).rejects.toBeInstanceOf(
      PasswordPolicyError,
    )
    await expect(changeOwnPassword(u.id, currentSid, { currentPassword: CURRENT, newPassword: CURRENT })).rejects.toBeInstanceOf(
      PasswordPolicyError,
    )
  })

  it('lists sessions with the current one flagged, and revokes own/all', async () => {
    const { u, currentSid, otherSid } = await freshUserWithSessions()

    const list = await listUserSessions(u.id, currentSid)
    expect(list).toHaveLength(2)
    expect(list.find((s) => s.id === currentSid)!.current).toBe(true)
    expect(list.find((s) => s.id === otherSid)!.current).toBe(false)

    expect(await revokeOwnSession(u.id, otherSid)).toBe(true)
    expect(await revokeOwnSession('00000000-0000-0000-0000-000000000000', currentSid)).toBe(false) // not owner
    expect(await listUserSessions(u.id, currentSid)).toHaveLength(1)

    await revokeAllSessions(u.id)
    expect(await listUserSessions(u.id, currentSid)).toHaveLength(0)
  })

  it('resetPassword sets a temp password, must-change, and revokes all sessions', async () => {
    const { u } = await freshUserWithSessions()
    const temp = await resetPassword(u.id, null)

    expect(isPasswordValid(temp)).toBe(true)
    const updated = await db.user.findUniqueOrThrow({ where: { id: u.id } })
    expect(await verifyPassword(temp, updated.passwordHash)).toBe(true)
    expect(updated.mustChangePassword).toBe(true)
    expect(await listUserSessions(u.id, '')).toHaveLength(0)
  })
})
