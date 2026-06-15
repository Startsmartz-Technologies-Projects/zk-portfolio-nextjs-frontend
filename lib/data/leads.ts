import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { NotFoundError, ValidationError } from '@/lib/errors'
import { mediaRefOf } from '@/lib/data/media'
import type { ListLeadsInput, TriagePatchInput, AddNoteInput } from '@/lib/validation/leads'

// Leads admin inbox data layer (leads-be-2): list/search/filter/sort, lead detail,
// the triage lifecycle (status / assignee / spam), internal notes, soft-delete/
// restore, CSV export, and the access-controlled attachment-download target. No
// public surface (the intake is leads-be-3) and no revalidation (the inbox is
// admin-only). `Lead` is not ContentBase — there is no publish workflow (BR-3) and
// no `created_by` (submissions are anonymous, BR-7); the actor of each triage action
// is recorded by the audit log in the action layer, not on the row.

const EXPORT_BATCH_SIZE = 500

// ── Serialization (contract §2.2) ───────────────────────────────────────────

type ActorRow = { id: string; fullName: string } | null
function actorRef(u: ActorRow) {
  return u ? { id: u.id, name: u.fullName } : null
}

const listInclude = {
  assignee: { select: { id: true, fullName: true } },
  _count: { select: { attachments: true } },
} satisfies Prisma.LeadInclude
type LeadListRow = Prisma.LeadGetPayload<{ include: typeof listInclude }>

const detailInclude = {
  assignee: { select: { id: true, fullName: true } },
  attachments: { orderBy: { position: 'asc' }, include: { media: true } },
  notes: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, fullName: true } } } },
} satisfies Prisma.LeadInclude
type LeadDetailRow = Prisma.LeadGetPayload<{ include: typeof detailInclude }>

export function toListItem(l: LeadListRow) {
  return {
    id: l.id,
    reference_no: l.referenceNo,
    name: l.name,
    company: l.company,
    email: l.email,
    phone: l.phone,
    subject: l.subject,
    inquiry_type: l.inquiryType,
    status: l.status,
    is_spam: l.isSpam,
    assignee: actorRef(l.assignee),
    attachment_count: l._count.attachments,
    created_at: l.createdAt.toISOString(),
    ...(l.deletedAt ? { deleted_at: l.deletedAt.toISOString() } : {}),
  }
}

export function toDetail(l: LeadDetailRow) {
  return {
    id: l.id,
    reference_no: l.referenceNo,
    name: l.name,
    company: l.company,
    phone: l.phone,
    email: l.email,
    subject: l.subject,
    inquiry_type: l.inquiryType,
    services: l.services,
    budget: l.budget,
    location: l.location,
    timeline: l.timeline,
    bid_name: l.bidName,
    message: l.message,
    status: l.status,
    assignee: actorRef(l.assignee),
    is_spam: l.isSpam,
    attachments: l.attachments.map((a) => ({ id: a.id, media: mediaRefOf(a.media), position: a.position })),
    notes: l.notes.map((n) => ({ id: n.id, author: actorRef(n.author), body: n.body, created_at: n.createdAt.toISOString() })),
    source_page: l.sourcePage,
    created_at: l.createdAt.toISOString(),
    updated_at: l.updatedAt.toISOString(),
    ...(l.deletedAt ? { deleted_at: l.deletedAt.toISOString() } : {}),
  }
}

// ── Filtering / sorting (FR-LEADS-009/010/011/012/018) ──────────────────────

function buildWhere(f: ListLeadsInput): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {}
  if (!f.includeDeleted) where.deletedAt = null
  // Default + explicit `spam=false` exclude flagged spam; only `spam=true` surfaces it (BR-8, contract §4).
  where.isSpam = f.spam === true
  if (f.status) where.status = f.status
  if (f.inquiryType) where.inquiryType = f.inquiryType
  if (f.budget) where.budget = f.budget
  if (f.timeline) where.timeline = f.timeline
  if (f.service) where.services = { has: f.service }
  if (f.assigneeId) where.assigneeId = f.assigneeId
  if (f.from || f.to) where.createdAt = { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) }
  if (f.q) {
    where.OR = [
      { name: { contains: f.q, mode: 'insensitive' } },
      { company: { contains: f.q, mode: 'insensitive' } },
      { email: { contains: f.q, mode: 'insensitive' } },
      { phone: { contains: f.q, mode: 'insensitive' } },
      { subject: { contains: f.q, mode: 'insensitive' } },
      { referenceNo: { contains: f.q, mode: 'insensitive' } },
    ]
  }
  return where
}

function buildOrderBy(sort: ListLeadsInput['sort']): Prisma.LeadOrderByWithRelationInput[] {
  if (sort === 'oldest') return [{ createdAt: 'asc' }, { id: 'asc' }]
  if (sort === 'status') return [{ status: 'asc' }, { createdAt: 'desc' }]
  return [{ createdAt: 'desc' }, { id: 'desc' }] // recent (default)
}

// ── Reads ────────────────────────────────────────────────────────────────────

export async function listLeads(filters: ListLeadsInput = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))
  const where = buildWhere(filters)
  const [rows, total] = await Promise.all([
    db.lead.findMany({ where, include: listInclude, orderBy: buildOrderBy(filters.sort), skip: (page - 1) * pageSize, take: pageSize }),
    db.lead.count({ where }),
  ])
  return { data: rows.map(toListItem), meta: { page, pageSize, total } }
}

export async function getLead(id: string) {
  const l = await db.lead.findUnique({ where: { id }, include: detailInclude })
  if (!l) throw new NotFoundError('Lead not found')
  return toDetail(l)
}

// ── Triage lifecycle (FR-LEADS-014/015/016/018) ─────────────────────────────

async function ensureAssignee(id: string): Promise<void> {
  const u = await db.user.findFirst({ where: { id, deletedAt: null, status: 'active' }, select: { id: true } })
  if (!u) throw new ValidationError('assignee_id does not reference an active user', [{ field: 'assignee_id' }])
}

/** Update any of status / assignee / spam flag. The actor + timestamp are recorded by the audit log (action layer). */
export async function updateLeadTriage(id: string, input: TriagePatchInput) {
  const existing = await db.lead.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!existing) throw new NotFoundError('Lead not found')
  if (input.assignee_id) await ensureAssignee(input.assignee_id)
  const data: Prisma.LeadUncheckedUpdateInput = {}
  if (input.status !== undefined) data.status = input.status
  if (input.assignee_id !== undefined) data.assigneeId = input.assignee_id
  if (input.is_spam !== undefined) data.isSpam = input.is_spam
  await db.lead.update({ where: { id }, data })
  return getLead(id)
}

/** Add a timestamped internal note (never exposed on /public). */
export async function addLeadNote(authorId: string | null, id: string, input: AddNoteInput) {
  const lead = await db.lead.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!lead) throw new NotFoundError('Lead not found')
  const note = await db.leadNote.create({
    data: { leadId: id, authorId, body: input.body },
    include: { author: { select: { id: true, fullName: true } } },
  })
  return { id: note.id, author: actorRef(note.author), body: note.body, created_at: note.createdAt.toISOString() }
}

export async function softDeleteLead(id: string): Promise<void> {
  const lead = await db.lead.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!lead) throw new NotFoundError('Lead not found')
  await db.lead.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function restoreLead(id: string) {
  const lead = await db.lead.findFirst({ where: { id, deletedAt: { not: null } }, select: { id: true } })
  if (!lead) throw new NotFoundError('Soft-deleted lead not found')
  await db.lead.update({ where: { id }, data: { deletedAt: null } })
  return getLead(id)
}

// ── CSV export (FR-LEADS-019) ────────────────────────────────────────────────

export const LEADS_CSV_COLUMNS = [
  'reference_no',
  'name',
  'company',
  'phone',
  'email',
  'subject',
  'inquiry_type',
  'services',
  'budget',
  'location',
  'timeline',
  'status',
  'is_spam',
  'assignee',
  'created_at',
] as const

/** RFC-4180 field escaping: quote when the value contains `,`, `"`, or a newline. */
function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

type LeadCsvRow = Prisma.LeadGetPayload<{ include: { assignee: { select: { fullName: true } } } }>

/** Format one lead as a CSV line (no trailing newline). Exported for tests. */
export function leadToCsvLine(l: LeadCsvRow): string {
  return [
    l.referenceNo,
    l.name,
    l.company ?? '',
    l.phone,
    l.email,
    l.subject,
    l.inquiryType,
    l.services.join('; '),
    l.budget ?? '',
    l.location ?? '',
    l.timeline ?? '',
    l.status,
    l.isSpam ? 'true' : 'false',
    l.assignee?.fullName ?? '',
    l.createdAt.toISOString(),
  ]
    .map((v) => csvField(String(v)))
    .join(',')
}

/**
 * Stream the filtered lead set as CSV (FR-LEADS-019). Honors the active filters
 * (same {@link buildWhere}) and always excludes soft-deleted rows; pages through a
 * stable cursor so a large export stays bounded in memory (NFR §15).
 */
export function streamLeadsCsv(filters: ListLeadsInput = {}): ReadableStream<Uint8Array> {
  const where = buildWhere({ ...filters, includeDeleted: false })
  const orderBy = buildOrderBy(filters.sort)
  const encoder = new TextEncoder()
  let cursor: string | null = null
  let headerSent = false

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (!headerSent) {
        controller.enqueue(encoder.encode(LEADS_CSV_COLUMNS.join(',') + '\n'))
        headerSent = true
      }
      const rows = await db.lead.findMany({
        where,
        orderBy,
        take: EXPORT_BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: { assignee: { select: { fullName: true } } },
      })
      if (rows.length > 0) {
        controller.enqueue(encoder.encode(rows.map(leadToCsvLine).join('\n') + '\n'))
        cursor = rows[rows.length - 1].id
      }
      if (rows.length < EXPORT_BATCH_SIZE) controller.close()
    },
  })
}

// ── Attachment download (FR-LEADS-007) ───────────────────────────────────────

/**
 * Resolve the download target for one lead attachment. The caller (route handler)
 * enforces the staff session + capability — that IS the access control (BR-4). The
 * Cloudinary *signed, time-limited* delivery for private documents is the deferred
 * MEDIA path (MEDIA §17 Q3); until it is wired we hand back the stored secure URL
 * behind the auth gate. Throws {@link NotFoundError} if the attachment does not
 * belong to the lead.
 */
export async function getLeadAttachmentTarget(leadId: string, attId: string) {
  const att = await db.leadAttachment.findFirst({ where: { id: attId, leadId }, include: { media: true } })
  if (!att) throw new NotFoundError('Attachment not found')
  return { url: att.media.url, original_filename: att.media.originalFilename, format: att.media.format }
}
