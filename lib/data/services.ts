import { db } from '@/lib/db'
import { Prisma, type MediaAsset } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import { mediaRefOf, type MediaRef } from '@/lib/data/media'
import { recordRedirect } from '@/lib/data/seo'
import type { CreateServiceInput, UpdateServiceInput, ListServicesInput, OrderInput } from '@/lib/validation/services'

// Services admin + published-read data layer (services-be-2). Mirrors the Projects
// template; simpler — no taxonomy/featured/related/facets/stats. The catalog is a
// small, manually-ordered set: the public directory returns the whole published set
// in position order. Detail lives at /service-details/<slug>; the directory at
// /services.

export const SERVICES_TAG = 'services'
export const SERVICES_DIR_PATH = '/services'
export const SERVICES_DETAIL_PATH = '/service-details'

// ── Pure helper ──────────────────────────────────────────────────────────────

export function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Serialization (contract §2.3 / §2.4) ───────────────────────────────────

function mediaRef(m: MediaAsset | null): MediaRef | null {
  return m ? mediaRefOf(m) : null
}

const listInclude = { heroImage: true } satisfies Prisma.ServiceInclude
type ServiceListRow = Prisma.ServiceGetPayload<{ include: typeof listInclude }>

const detailInclude = {
  heroImage: true,
  machineImage: true,
  ctaImage: true,
  seoOgImage: true,
  meta: { orderBy: { position: 'asc' } },
  scope: { orderBy: { position: 'asc' } },
  process: { orderBy: { position: 'asc' } },
  benefits: { orderBy: { position: 'asc' } },
  machine: { orderBy: { position: 'asc' } },
  faq: { orderBy: { position: 'asc' } },
} satisfies Prisma.ServiceInclude
type ServiceDetailRow = Prisma.ServiceGetPayload<{ include: typeof detailInclude }>

function toListItem(s: ServiceListRow, ctx: { serviceNumber: number; total: number; includeStatus?: boolean }) {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    icon: s.icon,
    position: s.position,
    service_number: ctx.serviceNumber,
    total_services: ctx.total,
    hero_image: mediaRef(s.heroImage),
    ...(ctx.includeStatus ? { content_status: s.status } : {}),
    updated_at: s.updatedAt,
  }
}

/** Resolve the CTA image to a per-service ref, else the SITE default (og_default brand slot). */
async function resolveCtaImage(s: ServiceDetailRow): Promise<MediaRef | null> {
  if (s.ctaImage) return mediaRefOf(s.ctaImage)
  const fallback = await db.brandAsset.findUnique({ where: { key: 'og_default' }, include: { media: true } })
  return fallback?.media ? mediaRefOf(fallback.media) : null
}

function seoOf(s: ServiceDetailRow) {
  return {
    meta_title: s.seoMetaTitle,
    meta_description: s.seoMetaDescription,
    canonical_url: s.seoCanonicalUrl,
    og_image: s.seoOgImage ? mediaRefOf(s.seoOgImage) : null,
    og_title: s.seoOgTitle,
    og_description: s.seoOgDescription,
    noindex: s.seoNoindex,
  }
}

async function toDetail(s: ServiceDetailRow, ctx: { serviceNumber: number; total: number; includeStatus?: boolean }) {
  return {
    ...toListItem(s, ctx),
    legacy_id: s.legacyId,
    overview_title: s.overviewTitle,
    overview_lead: s.overviewLead,
    overview_body: s.overviewBody,
    overview_bullets: s.overviewBullets,
    scope_title: s.scopeTitle,
    scope_lead: s.scopeLead,
    process_title: s.processTitle,
    process_lead: s.processLead,
    benefits_title: s.benefitsTitle,
    benefits_lead: s.benefitsLead,
    capability_title: s.capabilityTitle,
    capability_lead: s.capabilityLead,
    capability_body_title: s.capabilityBodyTitle,
    capability_body_desc: s.capabilityBodyDesc,
    faq_title: s.faqTitle,
    faq_lead: s.faqLead,
    meta: s.meta.map((m) => ({ id: m.id, key: m.key, value: m.value, position: m.position })),
    scope: s.scope.map((x) => ({ id: x.id, icon: x.icon, title: x.title, body: x.body, position: x.position })),
    process: s.process.map((x) => ({ id: x.id, tag: x.tag, title: x.title, body: x.body, position: x.position })),
    benefits: s.benefits.map((x) => ({ id: x.id, icon: x.icon, title: x.title, body: x.body, position: x.position })),
    machine: s.machine.map((x) => ({ id: x.id, title: x.title, description: x.description, position: x.position })),
    faq: s.faq.map((x) => ({ id: x.id, question: x.question, answer: x.answer, position: x.position })),
    machine_image: mediaRef(s.machineImage),
    cta_image: await resolveCtaImage(s),
    seo: seoOf(s),
    created_at: s.createdAt,
    updated_at: s.updatedAt,
    published_at: s.publishedAt,
  }
}

// ── Slug + ref validation ──────────────────────────────────────────────────

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const row = await db.service.findUnique({ where: { slug }, select: { id: true } })
  return !!row && row.id !== excludeId
}
async function uniquifySlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let n = 1
  while (await slugTaken(slug, excludeId)) slug = `${base}-${++n}`
  return slug
}
async function ensureAsset(id: string, field: string): Promise<void> {
  const a = await db.mediaAsset.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!a) throw new ValidationError(`${field} does not reference an existing asset`, [{ field }])
}
async function validateRefs(input: { hero_image_id?: string | null; machine_image_id?: string | null; cta_image_id?: string | null; seo?: { og_image_id?: string | null } }): Promise<void> {
  const checks: Promise<void>[] = []
  if (input.hero_image_id) checks.push(ensureAsset(input.hero_image_id, 'hero_image_id'))
  if (input.machine_image_id) checks.push(ensureAsset(input.machine_image_id, 'machine_image_id'))
  if (input.cta_image_id) checks.push(ensureAsset(input.cta_image_id, 'cta_image_id'))
  if (input.seo?.og_image_id) checks.push(ensureAsset(input.seo.og_image_id, 'seo.og_image_id'))
  await Promise.all(checks)
}

// ── Field mapping ───────────────────────────────────────────────────────────

type WriteData = Prisma.ServiceUncheckedCreateInput
function buildScalarData(input: Partial<CreateServiceInput & UpdateServiceInput>): Partial<WriteData> {
  const d: Partial<WriteData> = {}
  const set = <K extends keyof WriteData>(k: K, v: WriteData[K] | undefined) => {
    if (v !== undefined) d[k] = v
  }
  set('title', input.title)
  set('subtitle', input.subtitle ?? undefined)
  set('icon', input.icon ?? undefined)
  set('position', input.position)
  set('heroImageId', input.hero_image_id ?? undefined)
  set('machineImageId', input.machine_image_id ?? undefined)
  set('ctaImageId', input.cta_image_id ?? undefined)
  set('overviewTitle', input.overview_title ?? undefined)
  set('overviewLead', input.overview_lead ?? undefined)
  set('overviewBody', input.overview_body)
  set('overviewBullets', input.overview_bullets)
  set('scopeTitle', input.scope_title ?? undefined)
  set('scopeLead', input.scope_lead ?? undefined)
  set('processTitle', input.process_title ?? undefined)
  set('processLead', input.process_lead ?? undefined)
  set('benefitsTitle', input.benefits_title ?? undefined)
  set('benefitsLead', input.benefits_lead ?? undefined)
  set('capabilityTitle', input.capability_title ?? undefined)
  set('capabilityLead', input.capability_lead ?? undefined)
  set('capabilityBodyTitle', input.capability_body_title ?? undefined)
  set('capabilityBodyDesc', input.capability_body_desc ?? undefined)
  set('faqTitle', input.faq_title ?? undefined)
  set('faqLead', input.faq_lead ?? undefined)
  if (input.seo) {
    const s = input.seo
    set('seoMetaTitle', s.meta_title ?? null)
    set('seoMetaDescription', s.meta_description ?? null)
    set('seoCanonicalUrl', s.canonical_url ?? null)
    set('seoOgImageId', s.og_image_id ?? null)
    set('seoOgTitle', s.og_title ?? null)
    set('seoOgDescription', s.og_description ?? null)
    if (s.noindex !== undefined && s.noindex !== null) set('seoNoindex', s.noindex)
  }
  return d
}

function childWrites(input: Partial<CreateServiceInput & UpdateServiceInput>) {
  return {
    meta: input.meta?.map((m, i) => ({ key: m.key, value: m.value, position: i })),
    scope: input.scope?.map((x, i) => ({ icon: x.icon ?? null, title: x.title, body: x.body ?? null, position: i })),
    process: input.process?.map((x, i) => ({ tag: x.tag ?? null, title: x.title, body: x.body ?? null, position: i })),
    benefits: input.benefits?.map((x, i) => ({ icon: x.icon ?? null, title: x.title, body: x.body ?? null, position: i })),
    machine: input.machine?.map((x, i) => ({ title: x.title, description: x.description ?? null, position: i })),
    faq: input.faq?.map((x, i) => ({ question: x.question, answer: x.answer ?? null, position: i })),
  }
}

// ── Number/total derivation (FR-SVC-018) ───────────────────────────────────

function publishedCount(): Promise<number> {
  return db.service.count({ where: { status: 'published', deletedAt: null } })
}
async function serviceRank(position: number): Promise<number> {
  // 1-based rank among published services in position order.
  return (await db.service.count({ where: { status: 'published', deletedAt: null, position: { lt: position } } })) + 1
}

// ── Admin reads ────────────────────────────────────────────────────────────

export async function listServices(filters: ListServicesInput = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))
  const where: Prisma.ServiceWhereInput = {}
  if (!filters.includeDeleted) where.deletedAt = null
  if (filters.contentStatus) where.status = filters.contentStatus
  if (filters.q) where.OR = [{ title: { contains: filters.q, mode: 'insensitive' } }, { subtitle: { contains: filters.q, mode: 'insensitive' } }]

  const [rows, total, pubTotal] = await Promise.all([
    db.service.findMany({ where, include: listInclude, orderBy: { position: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
    db.service.count({ where }),
    publishedCount(),
  ])
  return { data: rows.map((r) => toListItem(r, { serviceNumber: r.position + 1, total: pubTotal, includeStatus: true })), meta: { page, pageSize, total } }
}

export async function getService(id: string) {
  const s = await db.service.findUnique({ where: { id }, include: detailInclude })
  if (!s) throw new NotFoundError('Service not found')
  const [total, number] = await Promise.all([publishedCount(), serviceRank(s.position)])
  return toDetail(s, { serviceNumber: number, total, includeStatus: true })
}

// ── Create / update / delete ───────────────────────────────────────────────

export async function createService(actorId: string | null, input: CreateServiceInput) {
  await validateRefs(input)
  const slug = input.slug ? (await slugTaken(input.slug)) ? throwConflict(input.slug) : input.slug : await uniquifySlug(slugify(input.title))
  // Append to the end of the catalog unless an explicit position was supplied.
  const position = input.position ?? ((await db.service.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1
  const children = childWrites(input)

  const created = await db.service.create({
    data: {
      ...(buildScalarData(input) as WriteData),
      title: input.title,
      slug,
      position,
      status: 'draft',
      createdById: actorId,
      updatedById: actorId,
      meta: children.meta ? { create: children.meta } : undefined,
      scope: children.scope ? { create: children.scope } : undefined,
      process: children.process ? { create: children.process } : undefined,
      benefits: children.benefits ? { create: children.benefits } : undefined,
      machine: children.machine ? { create: children.machine } : undefined,
      faq: children.faq ? { create: children.faq } : undefined,
    },
  })
  return getService(created.id)
}
function throwConflict(slug: string): never {
  throw new ConflictError(`Slug '${slug}' is already in use`, [{ field: 'slug' }])
}

export async function updateService(actorId: string | null, id: string, input: UpdateServiceInput) {
  const existing = await db.service.findFirst({ where: { id, deletedAt: null } })
  if (!existing) throw new NotFoundError('Service not found')
  await validateRefs(input)

  let slug = existing.slug
  if (input.slug && input.slug !== existing.slug) {
    if (await slugTaken(input.slug, id)) throwConflict(input.slug)
    slug = input.slug
  }
  const children = childWrites(input)

  await db.$transaction(async (tx) => {
    await tx.service.update({ where: { id }, data: { ...buildScalarData(input), slug, updatedById: actorId } })
    if (children.meta) {
      await tx.serviceMetaItem.deleteMany({ where: { serviceId: id } })
      if (children.meta.length) await tx.serviceMetaItem.createMany({ data: children.meta.map((m) => ({ ...m, serviceId: id })) })
    }
    if (children.scope) {
      await tx.serviceScopeItem.deleteMany({ where: { serviceId: id } })
      if (children.scope.length) await tx.serviceScopeItem.createMany({ data: children.scope.map((m) => ({ ...m, serviceId: id })) })
    }
    if (children.process) {
      await tx.serviceProcessItem.deleteMany({ where: { serviceId: id } })
      if (children.process.length) await tx.serviceProcessItem.createMany({ data: children.process.map((m) => ({ ...m, serviceId: id })) })
    }
    if (children.benefits) {
      await tx.serviceBenefitItem.deleteMany({ where: { serviceId: id } })
      if (children.benefits.length) await tx.serviceBenefitItem.createMany({ data: children.benefits.map((m) => ({ ...m, serviceId: id })) })
    }
    if (children.machine) {
      await tx.serviceMachineItem.deleteMany({ where: { serviceId: id } })
      if (children.machine.length) await tx.serviceMachineItem.createMany({ data: children.machine.map((m) => ({ ...m, serviceId: id })) })
    }
    if (children.faq) {
      await tx.serviceFaqItem.deleteMany({ where: { serviceId: id } })
      if (children.faq.length) await tx.serviceFaqItem.createMany({ data: children.faq.map((m) => ({ ...m, serviceId: id })) })
    }
  })

  if (slug !== existing.slug && existing.status === 'published') {
    await recordRedirect(`${SERVICES_DETAIL_PATH}/${existing.slug}`, `${SERVICES_DETAIL_PATH}/${slug}`, actorId)
  }
  return getService(id)
}

export async function softDeleteService(actorId: string | null, id: string): Promise<void> {
  const s = await db.service.findFirst({ where: { id, deletedAt: null } })
  if (!s) throw new NotFoundError('Service not found')
  await db.service.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId } })
}

export async function restoreService(actorId: string | null, id: string) {
  const s = await db.service.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!s) throw new NotFoundError('Soft-deleted service not found')
  await db.service.update({ where: { id }, data: { deletedAt: null, updatedById: actorId } })
  return getService(id)
}

export async function duplicateService(actorId: string | null, id: string) {
  const src = await db.service.findFirst({ where: { id, deletedAt: null }, include: detailInclude })
  if (!src) throw new NotFoundError('Service not found')
  const slug = await uniquifySlug(`${src.slug}-copy`)
  const position = ((await db.service.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1

  const copy = await db.service.create({
    data: {
      status: 'draft',
      publishedAt: null,
      slug,
      title: src.title,
      subtitle: src.subtitle,
      icon: src.icon,
      position,
      heroImageId: src.heroImageId,
      machineImageId: src.machineImageId,
      ctaImageId: src.ctaImageId,
      overviewTitle: src.overviewTitle,
      overviewLead: src.overviewLead,
      overviewBody: src.overviewBody,
      overviewBullets: src.overviewBullets,
      scopeTitle: src.scopeTitle,
      scopeLead: src.scopeLead,
      processTitle: src.processTitle,
      processLead: src.processLead,
      benefitsTitle: src.benefitsTitle,
      benefitsLead: src.benefitsLead,
      capabilityTitle: src.capabilityTitle,
      capabilityLead: src.capabilityLead,
      capabilityBodyTitle: src.capabilityBodyTitle,
      capabilityBodyDesc: src.capabilityBodyDesc,
      faqTitle: src.faqTitle,
      faqLead: src.faqLead,
      seoMetaTitle: src.seoMetaTitle,
      seoMetaDescription: src.seoMetaDescription,
      seoCanonicalUrl: src.seoCanonicalUrl,
      seoOgImageId: src.seoOgImageId,
      seoOgTitle: src.seoOgTitle,
      seoOgDescription: src.seoOgDescription,
      seoNoindex: src.seoNoindex,
      createdById: actorId,
      updatedById: actorId,
      meta: { create: src.meta.map((m) => ({ key: m.key, value: m.value, position: m.position })) },
      scope: { create: src.scope.map((x) => ({ icon: x.icon, title: x.title, body: x.body, position: x.position })) },
      process: { create: src.process.map((x) => ({ tag: x.tag, title: x.title, body: x.body, position: x.position })) },
      benefits: { create: src.benefits.map((x) => ({ icon: x.icon, title: x.title, body: x.body, position: x.position })) },
      machine: { create: src.machine.map((x) => ({ title: x.title, description: x.description, position: x.position })) },
      faq: { create: src.faq.map((x) => ({ question: x.question, answer: x.answer, position: x.position })) },
    },
  })
  return getService(copy.id)
}

// ── Publishing & workflow ──────────────────────────────────────────────────

export async function collectPublishIssues(id: string): Promise<{ field: string; issue: string }[]> {
  const s = await db.service.findFirst({ where: { id, deletedAt: null }, include: { heroImage: true, machineImage: true, ctaImage: true } })
  if (!s) throw new NotFoundError('Service not found')
  const issues: { field: string; issue: string }[] = []
  const req = (cond: boolean, field: string, issue = 'required') => {
    if (!cond) issues.push({ field, issue })
  }
  req(!!s.title?.trim(), 'title')
  req(!!s.subtitle?.trim(), 'subtitle')
  req(!!s.overviewTitle?.trim(), 'overview_title')
  req(!!s.overviewLead?.trim(), 'overview_lead')
  req(!!s.heroImageId, 'hero_image')
  const altOk = (m: MediaAsset | null, field: string) => {
    if (m && (!m.altText?.trim() || m.deletedAt)) issues.push({ field, issue: 'alt text required' })
  }
  if (s.heroImage) altOk(s.heroImage, 'hero_image.alt')
  altOk(s.machineImage, 'machine_image.alt')
  altOk(s.ctaImage, 'cta_image.alt')
  return issues
}

export async function publishService(actorId: string | null, id: string) {
  const existing = await db.service.findFirst({ where: { id, deletedAt: null }, select: { id: true, publishedAt: true } })
  if (!existing) throw new NotFoundError('Service not found')
  const issues = await collectPublishIssues(id)
  if (issues.length) throw new PublishValidationError(issues, 'Service cannot be published.')
  await db.service.update({ where: { id }, data: { status: 'published', publishedAt: existing.publishedAt ?? new Date(), updatedById: actorId } })
  return getService(id)
}

async function transition(actorId: string | null, id: string, status: 'draft' | 'archived') {
  const s = await db.service.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!s) throw new NotFoundError('Service not found')
  await db.service.update({ where: { id }, data: { status, updatedById: actorId } })
  return getService(id)
}
export const unpublishService = (actorId: string | null, id: string) => transition(actorId, id, 'draft')
export const archiveService = (actorId: string | null, id: string) => transition(actorId, id, 'archived')

// ── Reorder (FR-SVC-017, BR-2) ─────────────────────────────────────────────

export async function reorderServices(actorId: string | null, input: OrderInput) {
  const ids = input.ordered_ids
  if (new Set(ids).size !== ids.length) throw new ValidationError('ordered_ids must be distinct', [{ field: 'ordered_ids' }])
  const existing = await db.service.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true } })
  if (existing.length !== ids.length) throw new ValidationError('ordered_ids must reference existing services', [{ field: 'ordered_ids' }])
  await db.$transaction(ids.map((id, i) => db.service.update({ where: { id }, data: { position: i, updatedById: actorId } })))
  const rows = await db.service.findMany({ where: { deletedAt: null }, include: listInclude, orderBy: { position: 'asc' } })
  const total = await publishedCount()
  return { services: rows.map((r) => toListItem(r, { serviceNumber: r.position + 1, total, includeStatus: true })) }
}

// ── Bulk ────────────────────────────────────────────────────────────────────

export async function bulkServices(actorId: string | null, ids: string[], action: 'publish' | 'unpublish' | 'archive' | 'delete') {
  const results: { id: string; ok: boolean; error?: string }[] = []
  for (const id of ids) {
    try {
      if (action === 'publish') await publishService(actorId, id)
      else if (action === 'unpublish') await unpublishService(actorId, id)
      else if (action === 'archive') await archiveService(actorId, id)
      else await softDeleteService(actorId, id)
      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'failed' })
    }
  }
  return { results }
}

// ── Preview ──────────────────────────────────────────────────────────────────

export async function getPreviewUrl(id: string): Promise<{ preview_url: string }> {
  const s = await db.service.findFirst({ where: { id, deletedAt: null }, select: { slug: true } })
  if (!s) throw new NotFoundError('Service not found')
  const { createHmac } = await import('node:crypto')
  const exp = Date.now() + 1000 * 60 * 30
  const sig = createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-secret').update(`${id}.${exp}`).digest('hex').slice(0, 32)
  // Relative URL — resolves against the current origin (localhost in dev, live host in
  // prod). Don't prefix metadataBase: it points at the production domain and would send
  // local previews to the live site.
  return { preview_url: `${SERVICES_DETAIL_PATH}/${s.slug}?preview=${exp}.${sig}` }
}

export const SERVICES_REVALIDATE_TAG = SERVICES_TAG

// ── Public reads (published, non-deleted only) ─────────────────────────────

export async function getPublishedServices() {
  const rows = await db.service.findMany({ where: { status: 'published', deletedAt: null }, include: listInclude, orderBy: { position: 'asc' } })
  const total = rows.length
  return { data: rows.map((r, i) => toListItem(r, { serviceNumber: i + 1, total })) }
}

export async function getPublishedServiceBySlug(slug: string) {
  const s = await db.service.findFirst({ where: { slug, status: 'published', deletedAt: null }, include: detailInclude })
  if (!s) return null
  const [total, number] = await Promise.all([publishedCount(), serviceRank(s.position)])
  return toDetail(s, { serviceNumber: number, total, includeStatus: false })
}

// ── Cross-module wiring (consumed by SEO sitemap/redirect stubs) ───────────

export async function getPublishedServiceSitemapEntries(): Promise<{ loc: string; lastmod: string }[]> {
  const rows = await db.service.findMany({
    where: { status: 'published', deletedAt: null, seoNoindex: false },
    select: { slug: true, updatedAt: true },
  })
  return rows.map((r) => ({ loc: `${SERVICES_DETAIL_PATH}/${r.slug}`, lastmod: r.updatedAt.toISOString() }))
}

export async function isPublishedServicePath(path: string): Promise<boolean> {
  const m = path.match(/^\/service-details\/([^/?#]+)$/)
  if (!m) return false
  const row = await db.service.findFirst({ where: { slug: decodeURIComponent(m[1]), status: 'published', deletedAt: null }, select: { id: true } })
  return !!row
}
