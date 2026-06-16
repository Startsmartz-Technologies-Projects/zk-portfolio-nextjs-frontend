import { db } from '@/lib/db'
import type { AuditAction, Prisma } from '@prisma/client'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const EXPORT_BATCH_SIZE = 500

export interface AuditLogFilters {
  /** Filter by actor user id. Pass `null` to match System/anonymous entries. */
  actorId?: string | null
  action?: AuditAction
  entityType?: string
  /** Exclude these entity types — used by the Dashboard to scope an editor's feed (FR-DASH-004). Ignored when `entityType` is set. */
  entityTypeNotIn?: string[]
  entityId?: string
  /** Inclusive lower / upper bound on `created_at`. */
  from?: Date
  to?: Date
  /** Case-insensitive substring match on `summary`. */
  q?: string
  page?: number
  pageSize?: number
}

export interface AuditLogActor {
  id: string
  full_name: string
}

/** Wire representation of an audit entry (api-contracts/users-roles.md §2.3). */
export interface AuditLogItem {
  id: string
  actor: AuditLogActor | null
  action: AuditAction
  entity_type: string
  entity_id: string | null
  summary: string
  metadata: Prisma.JsonValue | null
  created_at: string
}

export interface AuditLogPage {
  data: AuditLogItem[]
  meta: { page: number; pageSize: number; total: number }
}

type AuditRowWithActor = Prisma.AuditLogEntryGetPayload<{
  include: { actor: { select: { id: true; fullName: true } } }
}>

function buildWhere(f: AuditLogFilters): Prisma.AuditLogEntryWhereInput {
  const where: Prisma.AuditLogEntryWhereInput = {}
  if (f.actorId !== undefined) where.actorId = f.actorId
  if (f.action) where.action = f.action
  if (f.entityType) where.entityType = f.entityType
  else if (f.entityTypeNotIn?.length) where.entityType = { notIn: f.entityTypeNotIn }
  if (f.entityId) where.entityId = f.entityId
  if (f.q) where.summary = { contains: f.q, mode: 'insensitive' }
  if (f.from || f.to) {
    where.createdAt = { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) }
  }
  return where
}

function toItem(row: AuditRowWithActor): AuditLogItem {
  return {
    id: row.id,
    actor: row.actor ? { id: row.actor.id, full_name: row.actor.fullName } : null,
    action: row.action,
    entity_type: row.entityType,
    entity_id: row.entityId,
    summary: row.summary,
    metadata: row.metadata ?? null,
    created_at: row.createdAt.toISOString(),
  }
}

/**
 * List the audit log newest-first, paginated and filterable by actor / action /
 * entity type / entity id / date range / summary search (FR-USERS-015). Read-only:
 * the module exposes no write path (append-only, FR-USERS-017).
 */
export async function listAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogPage> {
  const page = Math.max(1, Math.trunc(filters.page ?? 1))
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(filters.pageSize ?? DEFAULT_PAGE_SIZE)))
  const where = buildWhere(filters)

  const [rows, total] = await Promise.all([
    db.auditLogEntry.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { id: true, fullName: true } } },
    }),
    db.auditLogEntry.count({ where }),
  ])

  return { data: rows.map(toItem), meta: { page, pageSize, total } }
}

// ── CSV export (FR-USERS-016) ─────────────────────────────────────────────

export const AUDIT_CSV_COLUMNS = [
  'created_at',
  'actor_id',
  'actor_name',
  'action',
  'entity_type',
  'entity_id',
  'summary',
  'metadata',
] as const

/** RFC-4180 field escaping: quote when the value contains `,`, `"`, or a newline. */
function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** Format one audit item as a CSV line (no trailing newline). Exported for tests. */
export function auditItemToCsvLine(item: AuditLogItem): string {
  return [
    item.created_at,
    item.actor?.id ?? '',
    item.actor?.full_name ?? '',
    item.action,
    item.entity_type,
    item.entity_id ?? '',
    item.summary,
    item.metadata == null ? '' : JSON.stringify(item.metadata),
  ]
    .map((v) => csvField(String(v)))
    .join(',')
}

/**
 * Stream the filtered audit range as CSV (FR-USERS-016). Pages through the result
 * set with a stable cursor so an export of millions of rows stays bounded in memory
 * (NFR §15). Same filters as {@link listAuditLog}; ignores `page`/`pageSize`.
 */
export function streamAuditLogCsv(filters: AuditLogFilters = {}): ReadableStream<Uint8Array> {
  const where = buildWhere(filters)
  const encoder = new TextEncoder()
  let cursor: string | null = null
  let headerSent = false

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (!headerSent) {
        controller.enqueue(encoder.encode(AUDIT_CSV_COLUMNS.join(',') + '\n'))
        headerSent = true
      }

      const rows = await db.auditLogEntry.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: EXPORT_BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: { actor: { select: { id: true, fullName: true } } },
      })

      if (rows.length > 0) {
        const lines = rows.map((r) => auditItemToCsvLine(toItem(r))).join('\n') + '\n'
        controller.enqueue(encoder.encode(lines))
        cursor = rows[rows.length - 1].id
      }

      if (rows.length < EXPORT_BATCH_SIZE) controller.close()
    },
  })
}
