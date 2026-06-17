import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import {
  listAuditLog,
  streamAuditLogCsv,
  auditItemToCsvLine,
  AUDIT_CSV_COLUMNS,
  type AuditLogItem,
} from '@/lib/users/audit-read'

const hasDb = !!process.env.DATABASE_URL

// ── Pure CSV formatting (no DB) ───────────────────────────────────────────

describe('auditItemToCsvLine', () => {
  const base: AuditLogItem = {
    id: 'id-1',
    actor: { id: 'a-1', full_name: 'Ops Editor' },
    action: 'publish',
    entity_type: 'project',
    entity_id: 'p-1',
    summary: 'Published project',
    metadata: { changed: ['status'] },
    created_at: '2026-06-10T09:00:00.000Z',
  }

  it('serializes a row in column order with JSON metadata', () => {
    const line = auditItemToCsvLine(base)
    expect(line).toBe(
      '2026-06-10T09:00:00.000Z,a-1,Ops Editor,publish,project,p-1,Published project,"{""changed"":[""status""]}"',
    )
  })

  it('quotes and escapes fields containing commas, quotes, or newlines', () => {
    const line = auditItemToCsvLine({ ...base, metadata: null, summary: 'Renamed "A, B" to\nC' })
    expect(line).toContain('"Renamed ""A, B"" to\nC"')
  })

  it('emits empty actor fields for system/anonymous entries', () => {
    const line = auditItemToCsvLine({ ...base, actor: null, entity_id: null, metadata: null })
    expect(line).toBe('2026-06-10T09:00:00.000Z,,,publish,project,,Published project,')
  })
})

// ── Reads + streamed export (integration) ─────────────────────────────────

const TAG = `test_auditread_${Math.floor(Math.random() * 1e9)}`
const BASE = new Date('2026-01-01T00:00:00.000Z').getTime()
const at = (offsetMs: number) => new Date(BASE + offsetMs)
let actorId = ''

describe.skipIf(!hasDb)('listAuditLog + streamAuditLogCsv (integration)', () => {
  beforeAll(async () => {
    const u = await db.user.create({
      data: { email: `${TAG}@example.com`, passwordHash: 'x', fullName: 'Read Actor', role: 'admin', status: 'active' },
    })
    actorId = u.id

    // Seeded oldest → newest; createdAt set explicitly for deterministic ordering.
    await db.auditLogEntry.createMany({
      data: [
        { actorId, action: 'create', entityType: TAG, summary: 'Alpha created', createdAt: at(1000) },
        { actorId, action: 'update', entityType: TAG, summary: 'Beta updated', createdAt: at(2000) },
        { actorId: null, action: 'delete', entityType: TAG, summary: 'Gamma deleted', createdAt: at(3000) },
        { actorId, action: 'publish', entityType: TAG, summary: 'Delta published', createdAt: at(4000) },
        { actorId: null, action: 'create', entityType: TAG, summary: 'Epsilon created', createdAt: at(5000) },
      ],
    })
  })

  afterAll(async () => {
    await db.auditLogEntry.deleteMany({ where: { entityType: TAG } })
    if (actorId) await db.user.delete({ where: { id: actorId } })
    await db.$disconnect()
  })

  it('returns entries newest-first with a total count', async () => {
    const { data, meta } = await listAuditLog({ entityType: TAG, pageSize: 50 })
    expect(meta.total).toBe(5)
    expect(data.map((d) => d.summary)).toEqual([
      'Epsilon created',
      'Delta published',
      'Gamma deleted',
      'Beta updated',
      'Alpha created',
    ])
    // Actor is projected (no password hash); null for system entries.
    expect(data[0].actor).toBeNull()
    expect(data[1].actor).toMatchObject({ id: actorId, full_name: 'Read Actor' })
  })

  it('filters by action', async () => {
    const { data, meta } = await listAuditLog({ entityType: TAG, action: 'create' })
    expect(meta.total).toBe(2)
    expect(data.map((d) => d.summary)).toEqual(['Epsilon created', 'Alpha created'])
  })

  it('filters by actor (and by null actor)', async () => {
    expect((await listAuditLog({ entityType: TAG, actorId })).meta.total).toBe(3)
    expect((await listAuditLog({ entityType: TAG, actorId: null })).meta.total).toBe(2)
  })

  it('filters by case-insensitive summary search', async () => {
    const { data } = await listAuditLog({ entityType: TAG, q: 'beta' })
    expect(data.map((d) => d.summary)).toEqual(['Beta updated'])
  })

  it('filters by date range (inclusive)', async () => {
    const { data } = await listAuditLog({ entityType: TAG, from: at(2500), to: at(4500) })
    expect(data.map((d) => d.summary)).toEqual(['Delta published', 'Gamma deleted'])
  })

  it('paginates', async () => {
    const p1 = await listAuditLog({ entityType: TAG, page: 1, pageSize: 2 })
    const p2 = await listAuditLog({ entityType: TAG, page: 2, pageSize: 2 })
    const p3 = await listAuditLog({ entityType: TAG, page: 3, pageSize: 2 })
    expect(p1.meta.total).toBe(5)
    expect(p1.data.map((d) => d.summary)).toEqual(['Epsilon created', 'Delta published'])
    expect(p2.data.map((d) => d.summary)).toEqual(['Gamma deleted', 'Beta updated'])
    expect(p3.data.map((d) => d.summary)).toEqual(['Alpha created'])
  })

  it('streams a CSV of the filtered range (header + one line per row)', async () => {
    const csv = await new Response(streamAuditLogCsv({ entityType: TAG })).text()
    const lines = csv.trimEnd().split('\n')
    expect(lines[0]).toBe(AUDIT_CSV_COLUMNS.join(','))
    expect(lines).toHaveLength(6) // header + 5 rows
    expect(csv).toContain('Epsilon created')
    expect(csv).toContain('Alpha created')
  })
})
