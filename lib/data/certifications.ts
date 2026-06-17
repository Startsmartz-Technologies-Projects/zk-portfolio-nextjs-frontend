import { db } from '@/lib/db'
import { Prisma, type MediaAsset } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import { mediaRefOf, type MediaRef } from '@/lib/data/media'
import type { CreateCertInput, UpdateCertInput, ListCertsInput, PublicListCertsInput, HomeSealsInput } from '@/lib/validation/certifications'

// Certifications admin + published-read data layer (certifications-be-2). Unlike the
// other collections there is NO SeoMeta and NO per-record public URL (BR-8), so no
// slug-change redirect and no sitemap wiring — only the directory, facets, and the
// curated home-seals strip. The same CertificationItem shape serves admin + public
// (the public inline preview consumes the directory rows directly).

export const CERTS_TAG = 'certifications'
export const CERTS_BASE_PATH = '/certifications'
const CERT_CATEGORY_VOCAB = 'certifications-category'

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function formatDate(date: Date | null): string | null {
  if (!date) return null
  const d = String(date.getUTCDate()).padStart(2, '0')
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${d}/${m}/${date.getUTCFullYear()}`
}

// ── Serialization (contract §2.3 / §2.4) ───────────────────────────────────

interface TermRef {
  id: string
  slug: string
  label: string
}
function termRef(t: { id: string; slug: string; label: string } | null): TermRef | null {
  return t ? { id: t.id, slug: t.slug, label: t.label } : null
}

const include = { category: true, document: true } satisfies Prisma.CertificationInclude
type CertRow = Prisma.CertificationGetPayload<{ include: typeof include }>

export function toItem(c: CertRow, opts: { includeAdmin?: boolean } = {}) {
  const documentRef: MediaRef | null = c.document ? mediaRefOf(c.document) : null
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    authority: c.authority,
    number: c.number,
    category: termRef(c.category),
    status: c.certStatus,
    issued_date: c.issuedDate,
    expiry_date: c.expiryDate,
    display_issued: formatDate(c.issuedDate),
    display_expiry: c.expiryDate ? formatDate(c.expiryDate) : '—',
    description: c.description,
    document: documentRef,
    tone: c.tone,
    seal_shape: c.sealShape,
    show_on_home: c.showOnHome,
    seal_label: c.sealLabel,
    seal_id: c.sealId,
    seal_validity: c.sealValidity,
    seal_order: c.sealOrder,
    ...(opts.includeAdmin ? { content_status: c.status, legacy_ref: c.legacyRef, created_at: c.createdAt, updated_at: c.updatedAt, published_at: c.publishedAt } : {}),
  }
}

function toHomeSeal(c: CertRow) {
  return {
    slug: c.slug,
    seal_label: c.sealLabel,
    seal_id: c.sealId,
    seal_validity: c.sealValidity,
    seal_order: c.sealOrder,
    category: termRef(c.category),
  }
}

// ── Slug + ref validation ──────────────────────────────────────────────────

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const row = await db.certification.findUnique({ where: { slug }, select: { id: true } })
  return !!row && row.id !== excludeId
}
async function uniquifySlug(base: string, excludeId?: string): Promise<string> {
  const root = base || 'certification'
  let slug = root
  let n = 1
  while (await slugTaken(slug, excludeId)) slug = `${root}-${++n}`
  return slug
}
async function validateRefs(input: { category_id?: string | null; document_id?: string | null }): Promise<void> {
  if (input.document_id) {
    const a = await db.mediaAsset.findFirst({ where: { id: input.document_id, deletedAt: null }, select: { id: true } })
    if (!a) throw new ValidationError('document_id does not reference an existing asset', [{ field: 'document_id' }])
  }
  if (input.category_id) {
    const t = await db.taxonomyTerm.findFirst({ where: { id: input.category_id, taxonomy: { slug: CERT_CATEGORY_VOCAB } }, select: { id: true } })
    if (!t) throw new ValidationError('category_id does not reference a certifications-category term', [{ field: 'category_id' }])
  }
}

// ── Field mapping ───────────────────────────────────────────────────────────

type WriteData = Prisma.CertificationUncheckedCreateInput
function buildData(input: Partial<CreateCertInput & UpdateCertInput>): Partial<WriteData> {
  const d: Partial<WriteData> = {}
  const set = <K extends keyof WriteData>(k: K, v: WriteData[K] | undefined) => {
    if (v !== undefined) d[k] = v
  }
  set('title', input.title)
  set('authority', input.authority ?? undefined)
  set('number', input.number ?? undefined)
  set('categoryId', input.category_id ?? undefined)
  set('certStatus', input.status)
  set('issuedDate', input.issued_date ?? undefined)
  set('expiryDate', input.expiry_date ?? undefined)
  set('description', input.description ?? undefined)
  set('documentId', input.document_id ?? undefined)
  set('tone', input.tone)
  set('sealShape', input.seal_shape)
  set('showOnHome', input.show_on_home)
  set('sealLabel', input.seal_label ?? undefined)
  set('sealId', input.seal_id ?? undefined)
  set('sealValidity', input.seal_validity ?? undefined)
  return d
}

// ── Admin reads ────────────────────────────────────────────────────────────

function buildWhere(filters: ListCertsInput, publicOnly: boolean): Prisma.CertificationWhereInput {
  const where: Prisma.CertificationWhereInput = {}
  if (publicOnly) {
    where.status = 'published'
    where.deletedAt = null
  } else {
    if (!filters.includeDeleted) where.deletedAt = null
    if (filters.contentStatus) where.status = filters.contentStatus
    if (filters.showOnHome !== undefined) where.showOnHome = filters.showOnHome
  }
  if (filters.category) where.category = { slug: filters.category }
  if (filters.status) where.certStatus = filters.status
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { authority: { contains: filters.q, mode: 'insensitive' } },
      { number: { contains: filters.q, mode: 'insensitive' } },
    ]
  }
  return where
}

function buildOrderBy(sort: string | undefined): Prisma.CertificationOrderByWithRelationInput[] {
  switch (sort) {
    case 'title':
      return [{ title: 'asc' }]
    case 'expiry':
      return [{ expiryDate: 'desc' }]
    case 'recent':
    default:
      return [{ issuedDate: 'desc' }, { createdAt: 'desc' }]
  }
}

async function paginatedList(filters: ListCertsInput, publicOnly: boolean) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))
  const where = buildWhere(filters, publicOnly)
  const [rows, total] = await Promise.all([
    db.certification.findMany({ where, include, orderBy: buildOrderBy(filters.sort), skip: (page - 1) * pageSize, take: pageSize }),
    db.certification.count({ where }),
  ])
  return { data: rows.map((r) => toItem(r, { includeAdmin: !publicOnly })), meta: { page, pageSize, total } }
}

export function listCertifications(filters: ListCertsInput = {}) {
  return paginatedList(filters, false)
}

export async function getCertification(id: string) {
  const c = await db.certification.findUnique({ where: { id }, include })
  if (!c) throw new NotFoundError('Certification not found')
  return toItem(c, { includeAdmin: true })
}

// ── Create / update / delete ───────────────────────────────────────────────

export async function createCertification(actorId: string | null, input: CreateCertInput) {
  await validateRefs(input)
  let slug: string
  if (input.slug) {
    if (await slugTaken(input.slug)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  } else {
    slug = await uniquifySlug(slugify(`${input.title} ${input.authority ?? ''}`))
  }
  const created = await db.certification.create({
    data: { ...(buildData(input) as WriteData), title: input.title, slug, status: 'draft', createdById: actorId, updatedById: actorId },
  })
  return getCertification(created.id)
}

export async function updateCertification(actorId: string | null, id: string, input: UpdateCertInput) {
  const existing = await db.certification.findFirst({ where: { id, deletedAt: null } })
  if (!existing) throw new NotFoundError('Certification not found')
  await validateRefs(input)
  let slug = existing.slug
  if (input.slug && input.slug !== existing.slug) {
    if (await slugTaken(input.slug, id)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  }
  // Toggling show_on_home off clears the seal order (FR-CERT-016/017).
  const data = { ...buildData(input), slug, updatedById: actorId }
  if (input.show_on_home === false) data.sealOrder = null
  await db.certification.update({ where: { id }, data })
  return getCertification(id)
}

export async function softDeleteCertification(actorId: string | null, id: string): Promise<void> {
  const c = await db.certification.findFirst({ where: { id, deletedAt: null } })
  if (!c) throw new NotFoundError('Certification not found')
  await db.certification.update({ where: { id }, data: { deletedAt: new Date(), showOnHome: false, sealOrder: null, updatedById: actorId } })
}

export async function restoreCertification(actorId: string | null, id: string) {
  const c = await db.certification.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!c) throw new NotFoundError('Soft-deleted certification not found')
  await db.certification.update({ where: { id }, data: { deletedAt: null, updatedById: actorId } })
  return getCertification(id)
}

export async function duplicateCertification(actorId: string | null, id: string) {
  const src = await db.certification.findFirst({ where: { id, deletedAt: null } })
  if (!src) throw new NotFoundError('Certification not found')
  const slug = await uniquifySlug(`${src.slug}-copy`)
  const copy = await db.certification.create({
    data: {
      status: 'draft',
      publishedAt: null,
      legacyRef: src.legacyRef,
      slug,
      title: src.title,
      authority: src.authority,
      number: src.number,
      categoryId: src.categoryId,
      certStatus: src.certStatus,
      issuedDate: src.issuedDate,
      expiryDate: src.expiryDate,
      description: src.description,
      documentId: src.documentId,
      tone: src.tone,
      sealShape: src.sealShape,
      showOnHome: false,
      sealLabel: src.sealLabel,
      sealId: src.sealId,
      sealValidity: src.sealValidity,
      createdById: actorId,
      updatedById: actorId,
    },
  })
  return getCertification(copy.id)
}

// ── Publishing & workflow ──────────────────────────────────────────────────

export async function collectPublishIssues(id: string): Promise<{ field: string; issue: string }[]> {
  const c = await db.certification.findFirst({ where: { id, deletedAt: null }, include: { document: true } })
  if (!c) throw new NotFoundError('Certification not found')
  const issues: { field: string; issue: string }[] = []
  const req = (cond: boolean, field: string, issue = 'required') => {
    if (!cond) issues.push({ field, issue })
  }
  req(!!c.title?.trim(), 'title')
  req(!!c.authority?.trim(), 'authority')
  req(!!c.categoryId, 'category')
  req(!!c.issuedDate, 'issued_date')
  // Document is optional; when set it must have alt text (FR-CERT-018).
  if (c.document) req(!!c.document.altText?.trim() && !c.document.deletedAt, 'document.alt', 'alt text required')
  return issues
}

export async function publishCertification(actorId: string | null, id: string) {
  const existing = await db.certification.findFirst({ where: { id, deletedAt: null }, select: { id: true, publishedAt: true } })
  if (!existing) throw new NotFoundError('Certification not found')
  const issues = await collectPublishIssues(id)
  if (issues.length) throw new PublishValidationError(issues, 'Certification cannot be published.')
  await db.certification.update({ where: { id }, data: { status: 'published', publishedAt: existing.publishedAt ?? new Date(), updatedById: actorId } })
  return getCertification(id)
}

async function transition(actorId: string | null, id: string, status: 'draft' | 'archived') {
  const c = await db.certification.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!c) throw new NotFoundError('Certification not found')
  // Unpublish/archive removes it from the home seals (FR-CERT-019, BR-3).
  await db.certification.update({ where: { id }, data: { status, showOnHome: false, sealOrder: null, updatedById: actorId } })
  return getCertification(id)
}
export const unpublishCertification = (actorId: string | null, id: string) => transition(actorId, id, 'draft')
export const archiveCertification = (actorId: string | null, id: string) => transition(actorId, id, 'archived')

// ── Home seals (FR-CERT-017) ───────────────────────────────────────────────

export async function setHomeSeals(actorId: string | null, input: HomeSealsInput) {
  const ids = input.ordered_ids
  if (new Set(ids).size !== ids.length) throw new ValidationError('ordered_ids must be distinct', [{ field: 'ordered_ids' }])
  if (ids.length) {
    const valid = await db.certification.findMany({ where: { id: { in: ids }, status: 'published', deletedAt: null }, select: { id: true, sealLabel: true } })
    if (valid.length !== ids.length) throw new ValidationError('Only published certifications can show on home', [{ field: 'ordered_ids', rule: 'published_only' }])
    const missingLabel = valid.find((v) => !v.sealLabel?.trim())
    if (missingLabel) throw new ValidationError('Every home seal needs a seal_label', [{ field: 'ordered_ids', rule: 'seal_label_required', id: missingLabel.id }])
  }
  await db.$transaction([
    db.certification.updateMany({ where: { showOnHome: true, id: { notIn: ids.length ? ids : ['00000000-0000-0000-0000-000000000000'] } }, data: { showOnHome: false, sealOrder: null } }),
    ...ids.map((id, i) => db.certification.update({ where: { id }, data: { showOnHome: true, sealOrder: i, updatedById: actorId } })),
  ])
  const rows = await db.certification.findMany({ where: { showOnHome: true, deletedAt: null }, include, orderBy: { sealOrder: 'asc' } })
  return { home_seals: rows.map(toHomeSeal) }
}

export async function bulkCertifications(actorId: string | null, ids: string[], action: 'publish' | 'unpublish' | 'archive' | 'delete') {
  const results: { id: string; ok: boolean; error?: string }[] = []
  for (const id of ids) {
    try {
      if (action === 'publish') await publishCertification(actorId, id)
      else if (action === 'unpublish') await unpublishCertification(actorId, id)
      else if (action === 'archive') await archiveCertification(actorId, id)
      else await softDeleteCertification(actorId, id)
      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'failed' })
    }
  }
  return { results }
}

export const CERTS_REVALIDATE_TAG = CERTS_TAG

// ── Public reads (published, non-deleted only) ─────────────────────────────

export function getPublishedCertifications(input: PublicListCertsInput = {}) {
  return paginatedList(input, true)
}

export async function getCertificationFacets() {
  const where: Prisma.CertificationWhereInput = { status: 'published', deletedAt: null }
  const [byCat, byStatus] = await Promise.all([
    db.certification.groupBy({ by: ['categoryId'], where: { ...where, categoryId: { not: null } }, _count: { _all: true } }),
    db.certification.groupBy({ by: ['certStatus'], where, _count: { _all: true } }),
  ])
  const terms = await db.taxonomyTerm.findMany({ where: { id: { in: byCat.map((c) => c.categoryId!) } }, select: { id: true, slug: true, label: true } })
  const byId = new Map(terms.map((t) => [t.id, t]))
  return {
    categories: byCat
      .map((c) => ({ term: byId.get(c.categoryId!), count: c._count._all }))
      .filter((x) => x.term)
      .map((x) => ({ slug: x.term!.slug, label: x.term!.label, count: x.count })),
    statuses: byStatus.map((s) => ({ value: s.certStatus, count: s._count._all })),
  }
}

export async function getHomeSeals() {
  const rows = await db.certification.findMany({ where: { showOnHome: true, status: 'published', deletedAt: null }, include, orderBy: { sealOrder: 'asc' } })
  return { data: rows.map(toHomeSeal) }
}
