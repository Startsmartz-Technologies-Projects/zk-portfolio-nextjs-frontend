import { db } from '@/lib/db'
import { Prisma, type MediaAsset } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import { mediaRefOf, type MediaRef } from '@/lib/data/media'
import { recordRedirect } from '@/lib/data/seo'
import type { CreateConcernInput, UpdateConcernInput, ListConcernsInput, OrderInput } from '@/lib/validation/concerns'

// Concerns admin + published-read data layer (concerns-be-2). The richest collection
// after Projects: seven full-replace child collections, an embedded SeoMeta, a single
// app-enforced is_default landing, an app-managed nav `position`, and a derived
// `related` set. Profiles live at /concern-detail/<slug>.

export const CONCERNS_TAG = 'concerns'
export const CONCERNS_BASE_PATH = '/concern-detail'

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Serialization (contract §2.2 / §2.3) ───────────────────────────────────

function mediaRef(m: MediaAsset | null): MediaRef | null {
  return m ? mediaRefOf(m) : null
}

const listInclude = { heroImage: true } satisfies Prisma.ConcernInclude
type ConcernListRow = Prisma.ConcernGetPayload<{ include: typeof listInclude }>

const detailInclude = {
  heroImage: true,
  seoOgImage: true,
  facts: { orderBy: { position: 'asc' } },
  services: { orderBy: { position: 'asc' } },
  why: { orderBy: { position: 'asc' } },
  showcase: { orderBy: { position: 'asc' }, include: { image: true } },
  process: { orderBy: { position: 'asc' } },
  gallery: { orderBy: { position: 'asc' }, include: { media: true } },
  faqs: { orderBy: { position: 'asc' } },
} satisfies Prisma.ConcernInclude
type ConcernDetailRow = Prisma.ConcernGetPayload<{ include: typeof detailInclude }>

export function toListItem(c: ConcernListRow, opts: { includeAdmin?: boolean } = {}) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    short: c.short,
    tagline: c.tagline,
    hero_image: mediaRef(c.heroImage),
    is_default: c.isDefault,
    position: c.position,
    ...(opts.includeAdmin ? { content_status: c.status } : {}),
  }
}

function seoOf(c: ConcernDetailRow) {
  return {
    meta_title: c.seoMetaTitle,
    meta_description: c.seoMetaDescription,
    canonical_url: c.seoCanonicalUrl,
    og_image: c.seoOgImage ? mediaRefOf(c.seoOgImage) : null,
    og_title: c.seoOgTitle,
    og_description: c.seoOgDescription,
    noindex: c.seoNoindex,
  }
}

async function toDetail(c: ConcernDetailRow, opts: { includeAdmin?: boolean; related?: unknown[] }) {
  return {
    ...toListItem(c, opts),
    legacy_id: c.legacyId,
    intro: c.intro,
    established_year: c.establishedYear,
    display_est: c.establishedYear ? `Est. ${c.establishedYear}` : null,
    code: c.code,
    overview_title: c.overviewTitle,
    overview_body: c.overviewBody,
    overview_mission: c.overviewMission,
    facts: c.facts.map((f) => ({ id: f.id, big: f.big, label: f.label, sub: f.sub, position: f.position })),
    services: c.services.map((s) => ({ id: s.id, icon: s.icon, title: s.title, copy: s.copy, position: s.position })),
    why: c.why.map((w) => ({ id: w.id, number: w.number, title: w.title, copy: w.copy, position: w.position })),
    showcase: c.showcase.map((s) => ({ id: s.id, title: s.title, location: s.location, category: s.category, summary: s.summary, image: mediaRef(s.image), position: s.position })),
    process: c.process.map((p) => ({ id: p.id, step: p.step, title: p.title, copy: p.copy, position: p.position })),
    gallery: c.gallery.map((g) => ({ id: g.id, image: mediaRefOf(g.media), caption: g.caption, position: g.position })),
    faqs: c.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, position: f.position })),
    ...(opts.related ? { related: opts.related } : {}),
    ...(opts.includeAdmin ? { seo: seoOf(c), created_at: c.createdAt, updated_at: c.updatedAt, published_at: c.publishedAt } : {}),
  }
}

// ── Slug + ref validation ──────────────────────────────────────────────────

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const row = await db.concern.findUnique({ where: { slug }, select: { id: true } })
  return !!row && row.id !== excludeId
}
async function uniquifySlug(base: string, excludeId?: string): Promise<string> {
  const root = base || 'concern'
  let slug = root
  let n = 1
  while (await slugTaken(slug, excludeId)) slug = `${root}-${++n}`
  return slug
}
async function ensureAsset(id: string, field: string): Promise<void> {
  const a = await db.mediaAsset.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!a) throw new ValidationError(`${field} does not reference an existing asset`, [{ field }])
}
async function validateRefs(input: { hero_image_id?: string | null; seo?: { og_image_id?: string | null }; showcase?: { image_id?: string | null }[]; gallery?: { media_id: string }[] }): Promise<void> {
  const checks: Promise<void>[] = []
  if (input.hero_image_id) checks.push(ensureAsset(input.hero_image_id, 'hero_image_id'))
  if (input.seo?.og_image_id) checks.push(ensureAsset(input.seo.og_image_id, 'seo.og_image_id'))
  for (const s of input.showcase ?? []) if (s.image_id) checks.push(ensureAsset(s.image_id, 'showcase.image_id'))
  for (const g of input.gallery ?? []) checks.push(ensureAsset(g.media_id, 'gallery.media_id'))
  await Promise.all(checks)
}

// ── Field mapping ───────────────────────────────────────────────────────────

type WriteData = Prisma.ConcernUncheckedCreateInput
function buildScalarData(input: Partial<CreateConcernInput & UpdateConcernInput>): Partial<WriteData> {
  const d: Partial<WriteData> = {}
  const set = <K extends keyof WriteData>(k: K, v: WriteData[K] | undefined) => {
    if (v !== undefined) d[k] = v
  }
  set('name', input.name)
  set('short', input.short ?? undefined)
  set('tagline', input.tagline ?? undefined)
  set('intro', input.intro ?? undefined)
  set('establishedYear', input.established_year ?? undefined)
  set('code', input.code ?? undefined)
  set('heroImageId', input.hero_image_id ?? undefined)
  set('position', input.position)
  set('overviewTitle', input.overview_title ?? undefined)
  set('overviewBody', input.overview_body)
  set('overviewMission', input.overview_mission ?? undefined)
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

function childCreates(input: Partial<CreateConcernInput & UpdateConcernInput>) {
  return {
    facts: input.facts?.map((f, i) => ({ big: f.big, label: f.label, sub: f.sub ?? null, position: i })),
    services: input.services?.map((s, i) => ({ icon: s.icon ?? null, title: s.title, copy: s.copy ?? null, position: i })),
    why: input.why?.map((w, i) => ({ number: w.number ?? null, title: w.title, copy: w.copy ?? null, position: i })),
    showcase: input.showcase?.map((s, i) => ({ title: s.title, location: s.location ?? null, category: s.category ?? null, summary: s.summary ?? null, imageId: s.image_id ?? null, position: i })),
    process: input.process?.map((p, i) => ({ step: p.step ?? null, title: p.title, copy: p.copy ?? null, position: i })),
    gallery: input.gallery?.map((g, i) => ({ mediaId: g.media_id, caption: g.caption ?? null, position: i })),
    faqs: input.faqs?.map((f, i) => ({ question: f.question, answer: f.answer ?? null, position: i })),
  }
}

// ── Admin reads ────────────────────────────────────────────────────────────

export async function listConcerns(filters: ListConcernsInput = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))
  const where: Prisma.ConcernWhereInput = {}
  if (!filters.includeDeleted) where.deletedAt = null
  if (filters.contentStatus) where.status = filters.contentStatus
  if (filters.q) where.OR = [{ name: { contains: filters.q, mode: 'insensitive' } }, { short: { contains: filters.q, mode: 'insensitive' } }]
  const [rows, total] = await Promise.all([
    db.concern.findMany({ where, include: listInclude, orderBy: { position: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
    db.concern.count({ where }),
  ])
  return { data: rows.map((r) => toListItem(r, { includeAdmin: true })), meta: { page, pageSize, total } }
}

export async function getConcern(id: string) {
  const c = await db.concern.findUnique({ where: { id }, include: detailInclude })
  if (!c) throw new NotFoundError('Concern not found')
  return toDetail(c, { includeAdmin: true })
}

// ── Create / update / delete ───────────────────────────────────────────────

export async function createConcern(actorId: string | null, input: CreateConcernInput) {
  await validateRefs(input)
  let slug: string
  if (input.slug) {
    if (await slugTaken(input.slug)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  } else {
    slug = await uniquifySlug(slugify(input.name))
  }
  const position = input.position ?? ((await db.concern.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1
  const ch = childCreates(input)
  const created = await db.concern.create({
    data: {
      ...(buildScalarData(input) as WriteData),
      name: input.name,
      slug,
      position,
      status: 'draft',
      isDefault: false,
      createdById: actorId,
      updatedById: actorId,
      facts: ch.facts ? { create: ch.facts } : undefined,
      services: ch.services ? { create: ch.services } : undefined,
      why: ch.why ? { create: ch.why } : undefined,
      showcase: ch.showcase ? { create: ch.showcase } : undefined,
      process: ch.process ? { create: ch.process } : undefined,
      gallery: ch.gallery ? { create: ch.gallery } : undefined,
      faqs: ch.faqs ? { create: ch.faqs } : undefined,
    },
  })
  return getConcern(created.id)
}

export async function updateConcern(actorId: string | null, id: string, input: UpdateConcernInput) {
  const existing = await db.concern.findFirst({ where: { id, deletedAt: null } })
  if (!existing) throw new NotFoundError('Concern not found')
  await validateRefs(input)
  let slug = existing.slug
  if (input.slug && input.slug !== existing.slug) {
    if (await slugTaken(input.slug, id)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  }
  const ch = childCreates(input)
  await db.$transaction(async (tx) => {
    await tx.concern.update({ where: { id }, data: { ...buildScalarData(input), slug, updatedById: actorId } })
    if (ch.facts) {
      await tx.concernFact.deleteMany({ where: { concernId: id } })
      if (ch.facts.length) await tx.concernFact.createMany({ data: ch.facts.map((x) => ({ ...x, concernId: id })) })
    }
    if (ch.services) {
      await tx.concernService.deleteMany({ where: { concernId: id } })
      if (ch.services.length) await tx.concernService.createMany({ data: ch.services.map((x) => ({ ...x, concernId: id })) })
    }
    if (ch.why) {
      await tx.concernWhy.deleteMany({ where: { concernId: id } })
      if (ch.why.length) await tx.concernWhy.createMany({ data: ch.why.map((x) => ({ ...x, concernId: id })) })
    }
    if (ch.showcase) {
      await tx.concernShowcaseProject.deleteMany({ where: { concernId: id } })
      if (ch.showcase.length) await tx.concernShowcaseProject.createMany({ data: ch.showcase.map((x) => ({ ...x, concernId: id })) })
    }
    if (ch.process) {
      await tx.concernProcessStep.deleteMany({ where: { concernId: id } })
      if (ch.process.length) await tx.concernProcessStep.createMany({ data: ch.process.map((x) => ({ ...x, concernId: id })) })
    }
    if (ch.gallery) {
      await tx.concernGalleryItem.deleteMany({ where: { concernId: id } })
      if (ch.gallery.length) await tx.concernGalleryItem.createMany({ data: ch.gallery.map((x) => ({ ...x, concernId: id })) })
    }
    if (ch.faqs) {
      await tx.concernFaq.deleteMany({ where: { concernId: id } })
      if (ch.faqs.length) await tx.concernFaq.createMany({ data: ch.faqs.map((x) => ({ ...x, concernId: id })) })
    }
  })
  if (slug !== existing.slug && existing.status === 'published') {
    await recordRedirect(`${CONCERNS_BASE_PATH}/${existing.slug}`, `${CONCERNS_BASE_PATH}/${slug}`, actorId)
  }
  return getConcern(id)
}

/** The default concern cannot be removed/unpublished until another is made default (BR-3). */
async function assertNotDefault(id: string, verb: string): Promise<void> {
  const c = await db.concern.findUnique({ where: { id }, select: { isDefault: true } })
  if (c?.isDefault) throw new ConflictError(`Cannot ${verb} the default concern — set another published concern as default first.`, [{ rule: 'is_default' }])
}

export async function softDeleteConcern(actorId: string | null, id: string): Promise<void> {
  const c = await db.concern.findFirst({ where: { id, deletedAt: null } })
  if (!c) throw new NotFoundError('Concern not found')
  await assertNotDefault(id, 'delete')
  await db.concern.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId } })
}

export async function restoreConcern(actorId: string | null, id: string) {
  const c = await db.concern.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!c) throw new NotFoundError('Soft-deleted concern not found')
  await db.concern.update({ where: { id }, data: { deletedAt: null, updatedById: actorId } })
  return getConcern(id)
}

export async function duplicateConcern(actorId: string | null, id: string) {
  const src = await db.concern.findFirst({ where: { id, deletedAt: null }, include: detailInclude })
  if (!src) throw new NotFoundError('Concern not found')
  const slug = await uniquifySlug(`${src.slug}-copy`)
  const position = ((await db.concern.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1
  const copy = await db.concern.create({
    data: {
      status: 'draft',
      publishedAt: null,
      slug,
      name: src.name,
      short: src.short,
      tagline: src.tagline,
      intro: src.intro,
      establishedYear: src.establishedYear,
      code: src.code,
      heroImageId: src.heroImageId,
      isDefault: false,
      position,
      overviewTitle: src.overviewTitle,
      overviewBody: src.overviewBody,
      overviewMission: src.overviewMission,
      seoMetaTitle: src.seoMetaTitle,
      seoMetaDescription: src.seoMetaDescription,
      seoCanonicalUrl: src.seoCanonicalUrl,
      seoOgImageId: src.seoOgImageId,
      seoOgTitle: src.seoOgTitle,
      seoOgDescription: src.seoOgDescription,
      seoNoindex: src.seoNoindex,
      createdById: actorId,
      updatedById: actorId,
      facts: { create: src.facts.map((f) => ({ big: f.big, label: f.label, sub: f.sub, position: f.position })) },
      services: { create: src.services.map((s) => ({ icon: s.icon, title: s.title, copy: s.copy, position: s.position })) },
      why: { create: src.why.map((w) => ({ number: w.number, title: w.title, copy: w.copy, position: w.position })) },
      showcase: { create: src.showcase.map((s) => ({ title: s.title, location: s.location, category: s.category, summary: s.summary, imageId: s.imageId, position: s.position })) },
      process: { create: src.process.map((p) => ({ step: p.step, title: p.title, copy: p.copy, position: p.position })) },
      gallery: { create: src.gallery.map((g) => ({ mediaId: g.mediaId, caption: g.caption, position: g.position })) },
      faqs: { create: src.faqs.map((f) => ({ question: f.question, answer: f.answer, position: f.position })) },
    },
  })
  return getConcern(copy.id)
}

// ── Publishing & workflow ──────────────────────────────────────────────────

export async function collectPublishIssues(id: string): Promise<{ field: string; issue: string }[]> {
  const c = await db.concern.findFirst({ where: { id, deletedAt: null }, include: { heroImage: true, showcase: { orderBy: { position: 'asc' }, include: { image: true } }, gallery: { orderBy: { position: 'asc' }, include: { media: true } } } })
  if (!c) throw new NotFoundError('Concern not found')
  const issues: { field: string; issue: string }[] = []
  const req = (cond: boolean, field: string, issue = 'required') => {
    if (!cond) issues.push({ field, issue })
  }
  req(!!c.name?.trim(), 'name')
  req(!!c.short?.trim(), 'short')
  req(!!c.tagline?.trim(), 'tagline')
  req(!!c.intro?.trim(), 'intro')
  req(c.overviewBody.length > 0, 'overview_body', 'at least one paragraph required')
  req(!!c.heroImageId, 'hero_image')
  const altOk = (m: MediaAsset | null, field: string) => {
    if (m && (!m.altText?.trim() || m.deletedAt)) issues.push({ field, issue: 'alt text required' })
  }
  if (c.heroImage) altOk(c.heroImage, 'hero_image.alt')
  c.showcase.forEach((s, i) => altOk(s.image, `showcase[${i}].alt`))
  c.gallery.forEach((g, i) => altOk(g.media, `gallery[${i}].alt`))
  return issues
}

export async function publishConcern(actorId: string | null, id: string) {
  const existing = await db.concern.findFirst({ where: { id, deletedAt: null }, select: { id: true, publishedAt: true } })
  if (!existing) throw new NotFoundError('Concern not found')
  const issues = await collectPublishIssues(id)
  if (issues.length) throw new PublishValidationError(issues, 'Concern cannot be published.')
  await db.concern.update({ where: { id }, data: { status: 'published', publishedAt: existing.publishedAt ?? new Date(), updatedById: actorId } })
  return getConcern(id)
}

async function transition(actorId: string | null, id: string, status: 'draft' | 'archived', verb: string) {
  const c = await db.concern.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!c) throw new NotFoundError('Concern not found')
  await assertNotDefault(id, verb)
  await db.concern.update({ where: { id }, data: { status, updatedById: actorId } })
  return getConcern(id)
}
export const unpublishConcern = (actorId: string | null, id: string) => transition(actorId, id, 'draft', 'unpublish')
export const archiveConcern = (actorId: string | null, id: string) => transition(actorId, id, 'archived', 'archive')

// ── Default + ordering ──────────────────────────────────────────────────────

export async function setDefaultConcern(actorId: string | null, id: string) {
  const c = await db.concern.findFirst({ where: { id, deletedAt: null }, select: { id: true, status: true } })
  if (!c) throw new NotFoundError('Concern not found')
  if (c.status !== 'published') throw new ValidationError('Only a published concern can be the default', [{ rule: 'published_only' }])
  await db.$transaction([
    db.concern.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } }),
    db.concern.update({ where: { id }, data: { isDefault: true, updatedById: actorId } }),
  ])
  return getConcern(id)
}

export async function reorderConcerns(actorId: string | null, input: OrderInput) {
  const ids = input.ordered_ids
  if (new Set(ids).size !== ids.length) throw new ValidationError('ordered_ids must be distinct', [{ field: 'ordered_ids' }])
  const existing = await db.concern.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true } })
  if (existing.length !== ids.length) throw new ValidationError('ordered_ids must reference existing concerns', [{ field: 'ordered_ids' }])
  await db.$transaction(ids.map((id, i) => db.concern.update({ where: { id }, data: { position: i, updatedById: actorId } })))
  const rows = await db.concern.findMany({ where: { deletedAt: null }, include: listInclude, orderBy: { position: 'asc' } })
  return { concerns: rows.map((r) => toListItem(r, { includeAdmin: true })) }
}

export async function getPreviewUrl(id: string): Promise<{ preview_url: string }> {
  const c = await db.concern.findFirst({ where: { id, deletedAt: null }, select: { slug: true } })
  if (!c) throw new NotFoundError('Concern not found')
  const { createHmac } = await import('node:crypto')
  const exp = Date.now() + 1000 * 60 * 30
  const sig = createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-secret').update(`${id}.${exp}`).digest('hex').slice(0, 32)
  const settings = await db.seoSettings.findFirst({ select: { metadataBase: true } })
  const base = (settings?.metadataBase ?? '').replace(/\/$/, '')
  return { preview_url: `${base}${CONCERNS_BASE_PATH}/${c.slug}?preview=${exp}.${sig}` }
}

export const CONCERNS_REVALIDATE_TAG = CONCERNS_TAG

// ── Public reads (published, non-deleted only) ─────────────────────────────

export async function getPublishedConcerns() {
  const rows = await db.concern.findMany({ where: { status: 'published', deletedAt: null }, include: listInclude, orderBy: { position: 'asc' } })
  return { data: rows.map((r) => toListItem(r)) }
}

/** Other published concerns in position order (derived `related`, BR-4). */
async function getRelated(excludeId: string) {
  const rows = await db.concern.findMany({ where: { status: 'published', deletedAt: null, id: { not: excludeId } }, include: listInclude, orderBy: { position: 'asc' } })
  return rows.map((r) => toListItem(r))
}

export async function getPublishedConcernBySlug(slug: string) {
  const c = await db.concern.findFirst({ where: { slug, status: 'published', deletedAt: null }, include: detailInclude })
  if (!c) return null
  const related = await getRelated(c.id)
  return toDetail(c, { includeAdmin: false, related })
}

export async function getDefaultConcern() {
  const c = await db.concern.findFirst({ where: { isDefault: true, status: 'published', deletedAt: null }, include: detailInclude })
  if (!c) return null
  const related = await getRelated(c.id)
  return toDetail(c, { includeAdmin: false, related })
}

// ── Cross-module wiring (consumed by SEO sitemap/redirect stubs) ───────────

export async function getPublishedConcernSitemapEntries(): Promise<{ loc: string; lastmod: string }[]> {
  const rows = await db.concern.findMany({ where: { status: 'published', deletedAt: null, seoNoindex: false }, select: { slug: true, updatedAt: true } })
  return rows.map((r) => ({ loc: `${CONCERNS_BASE_PATH}/${r.slug}`, lastmod: r.updatedAt.toISOString() }))
}

export async function isPublishedConcernPath(path: string): Promise<boolean> {
  const m = path.match(/^\/concern-detail\/([^/?#]+)$/)
  if (!m) return false
  const row = await db.concern.findFirst({ where: { slug: decodeURIComponent(m[1]), status: 'published', deletedAt: null }, select: { id: true } })
  return !!row
}
