import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { audit } from '@/lib/users/audit'
import * as auditModule from '@/lib/users/audit'

// Integration test — needs DATABASE_URL (loaded from .env via vitest setupFiles).
const hasDb = !!process.env.DATABASE_URL

// Unique marker so this file's rows are isolated from other parallel test files.
const TAG = `test_audit_${Math.floor(Math.random() * 1e9)}`
let actorId = ''

describe('audit service — append-only API surface', () => {
  it('exposes a write path but no update/delete path (FR-USERS-017)', () => {
    expect(typeof audit).toBe('function')
    expect((auditModule as Record<string, unknown>).updateAudit).toBeUndefined()
    expect((auditModule as Record<string, unknown>).deleteAudit).toBeUndefined()
  })
})

describe.skipIf(!hasDb)('audit service (integration)', () => {
  beforeAll(async () => {
    const u = await db.user.create({
      data: { email: `${TAG}@example.com`, passwordHash: 'x', fullName: 'Audit Actor', role: 'admin', status: 'active' },
    })
    actorId = u.id
  })

  afterAll(async () => {
    await db.auditLogEntry.deleteMany({ where: { OR: [{ entityType: TAG }, { actorId }] } })
    if (actorId) await db.user.delete({ where: { id: actorId } })
    await db.$disconnect()
  })

  it('writes an append-only entry with the principal as actor', async () => {
    await audit({
      actorId,
      action: 'create',
      entityType: TAG,
      entityId: 'rec-1',
      summary: 'Created a thing',
      metadata: { changed: ['title'] },
    })

    const entry = await db.auditLogEntry.findFirst({ where: { entityType: TAG, action: 'create' } })
    expect(entry).not.toBeNull()
    expect(entry!.actorId).toBe(actorId)
    expect(entry!.entityId).toBe('rec-1')
    expect(entry!.summary).toBe('Created a thing')
    expect(entry!.metadata).toEqual({ changed: ['title'] })
  })

  it('allows a null actor for System/anonymous events', async () => {
    await audit({ actorId: null, action: 'login', entityType: TAG, summary: 'anonymous event' })
    const entry = await db.auditLogEntry.findFirst({ where: { entityType: TAG, action: 'login' } })
    expect(entry).not.toBeNull()
    expect(entry!.actorId).toBeNull()
  })

  // Models the real call pattern: do the work in a transaction, then audit AFTER it
  // commits. A rolled-back action never reaches audit() → no phantom entry (edge 7/12).
  async function actThenAudit(summary: string, shouldFail: boolean) {
    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: actorId }, data: { fullName: `Audit Actor (${summary})` } })
      if (shouldFail) throw new Error('boom')
    })
    await audit({ actorId, action: 'update', entityType: TAG, entityId: actorId, summary })
  }

  it('writes no phantom entry when the action rolls back', async () => {
    const summary = `${TAG}-rollback`
    await expect(actThenAudit(summary, true)).rejects.toThrow('boom')
    const entry = await db.auditLogEntry.findFirst({ where: { summary } })
    expect(entry).toBeNull()
  })

  it('writes the entry once the action commits', async () => {
    const summary = `${TAG}-commit`
    await actThenAudit(summary, false)
    const entries = await db.auditLogEntry.findMany({ where: { summary } })
    expect(entries).toHaveLength(1)
  })
})
