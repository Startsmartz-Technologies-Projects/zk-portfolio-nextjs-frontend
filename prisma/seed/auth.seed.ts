import type { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * Idempotent bootstrap of the first admin account (FR-AUTH, auth-be-1).
 * Credentials come from env — never a committed default. The account is created
 * with `must_change_password = true` so the temp password must be rotated on first login.
 */
export async function seedAuth(db: PrismaClient): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be set to seed the bootstrap admin',
    )
  }
  if (password.length < 10) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD is too weak (minimum 10 characters)')
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Bootstrap admin already exists (${email}) — no change.`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Administrator',
      role: 'admin',
      status: 'active',
      mustChangePassword: true,
    },
  })
  console.log(`Bootstrap admin created (${email}) — must change password on first login.`)
}
