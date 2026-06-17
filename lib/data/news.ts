import { db } from '@/lib/db'
import { Prisma, type MediaAsset } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import { mediaRefOf, resolveMediaRefs, type MediaRef } from '@/lib/data/media'
import { recordRedirect } from '@/lib/data/seo'
import type { CreateStoryInput, UpdateStoryInput, ListStoriesInput, PublicListStoriesInput } from '@/lib/validation/news'

// News admin + published-read data layer (news-be-2). Blog's sibling: a JSONB *flat*
// block body, a managed gallery child collection, no author/popularity, and the
// latest/oldest/featured sorts. Stories live at /news/<slug>.

export const NEWS_TAG = 'news'
export const NEWS_BASE_PATH = '/news'
const WORDS_PER_MIN = 200

export function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function formatDisplayDate(date: Date | null): string | null {
  if (!date) return null
  const d = String(date.getUTCDate()).padStart(2, '0')
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${d}/${m}/${date.getUTCFullYear()}`
}

interface BlockShape {
  kind: string
  text?: string
  items?: unknown[]
  media_id?: string
  caption?: string
}
interface BodyShape {
  blocks?: BlockShape[]
}
function asBody(body: Prisma.JsonValue | null): BodyShape {
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as BodyShape) : {}
}
function countWords(s: string | null | undefined): number {
  return s ? s.trim().split(/\s+/).filter(Boolean).length : 0
}

export function bodyWordCount(bodyLead: string | null, body: Prisma.JsonValue | null): number {
  let n = countWords(bodyLead)
  for (const b of asBody(body).blocks ?? []) {
    n += countWords(b.text)
    if (Array.isArray(b.items)) for (const item of b.items) n += countWords(typeof item === 'string' ? item : JSON.stringify(item))
  }
  return n
}
export function deriveReadTimeMinutes(bodyLead: string | null, body: Prisma.JsonValue | null): number {
  return Math.max(1, Math.round(bodyWordCount(bodyLead, body) / WORDS_PER_MIN))
}
function readTimeLabel(minutes: number): string {
  return `${minutes} min read`
}

function bodyMediaIds(body: Prisma.JsonValue | null): string[] {
  const ids: string[] = []
  for (const b of asBody(body).blocks ?? []) if (b.kind === 'img' && b.media_id) ids.push(b.media_id)
  return ids
}

/** Resolve a flat body document's `img` blocks (`media_id` → `media` MediaRef) for public. */
async function resolveBodyImages(body: Prisma.JsonValue | null): Promise<BodyShape> {
  const doc = asBody(body)
  const ids = bodyMediaIds(body)
  if (!ids.length) return doc
  const refs = await resolveMediaRefs(ids)
  const byId = new Map(refs.map((r) => [r.id, r]))
  return {
    blocks: (doc.blocks ?? []).map((b) => {
      if (b.kind !== 'img' || !b.media_id) return b
      const { media_id, ...rest } = b
      return { ...rest, media: byId.get(media_id) ?? { id: media_id, withdrawn: true } }
    }),
  }
}

// ── Serialization ───────────────────────────────────────────────────────────

interface TermRef {
  id: string
  slug: string
  label: string
}
function termRef(t: { id: string; slug: string; label: string } | null): TermRef | null {
  return t ? { id: t.id, slug: t.slug, label: t.label } : null
}
function mediaRef(m: MediaAsset | null): MediaRef | null {
  return m ? mediaRefOf(m) : null
}

const listInclude = { category: true, coverImage: true } satisfies Prisma.NewsStoryInclude
type StoryRow = Prisma.NewsStoryGetPayload<{ include: typeof listInclude }>
const detailInclude = {
  category: true,
  coverImage: true,
  seoOgImage: true,
  gallery: { orderBy: { position: 'asc' }, include: { media: true } },
} satisfies Prisma.NewsStoryInclude
type StoryDetailRow = Prisma.NewsStoryGetPayload<{ include: typeof detailInclude }>

function readTimeOf(a: { readTimeMinutes: number | null; bodyLead: string | null; body: Prisma.JsonValue | null }): string {
  return readTimeLabel(a.readTimeMinutes ?? deriveReadTimeMinutes(a.bodyLead, a.body))
}

export function toListItem(s: StoryRow, opts: { includeAdmin?: boolean } = {}) {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    category: termRef(s.category),
    tags: s.tags,
    cover_image: mediaRef(s.coverImage),
    article_date: s.articleDate,
    display_date: formatDisplayDate(s.articleDate),
    read_time: readTimeOf(s),
    featured: s.featured,
    ...(opts.includeAdmin ? { content_status: s.status } : {}),
  }
}

function seoOf(s: StoryDetailRow) {
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

async function toDetail(s: StoryDetailRow, opts: { includeAdmin?: boolean; resolveBody?: boolean; related?: unknown[] }) {
  return {
    ...toListItem(s, opts),
    legacy_id: s.legacyId,
    body_lead: s.bodyLead,
    body: opts.resolveBody ? await resolveBodyImages(s.body) : s.body,
    gallery: s.gallery.map((g) => ({ id: g.id, media: mediaRefOf(g.media), caption: g.caption, position: g.position })),
    ...(opts.related ? { related: opts.related } : {}),
    ...(opts.includeAdmin ? { seo: seoOf(s), created_at: s.createdAt, updated_at: s.updatedAt, published_at: s.publishedAt } : {}),
  }
}

// ── Slug + ref validation ──────────────────────────────────────────────────

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const row = await db.newsStory.findUnique({ where: { slug }, select: { id: true } })
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
async function validateRefs(input: { cover_image_id?: string | null; category_id?: string | null; seo?: { og_image_id?: string | null }; gallery?: { media_id: string }[] }): Promise<void> {
  const checks: Promise<void>[] = []
  if (input.cover_image_id) checks.push(ensureAsset(input.cover_image_id, 'cover_image_id'))
  if (input.seo?.og_image_id) checks.push(ensureAsset(input.seo.og_image_id, 'seo.og_image_id'))
  if (input.category_id) {
    checks.push(
      db.taxonomyTerm.findFirst({ where: { id: input.category_id, taxonomy: { slug: 'news-category' } }, select: { id: true } }).then((t) => {
        if (!t) throw new ValidationError('category_id does not reference a news-category term', [{ field: 'category_id' }])
      }),
    )
  }
  await Promise.all(checks)
}

// ── Field mapping ───────────────────────────────────────────────────────────

type WriteData = Prisma.NewsStoryUncheckedCreateInput
function buildScalarData(input: Partial<CreateStoryInput & UpdateStoryInput>): Partial<WriteData> {
  const d: Partial<WriteData> = {}
  const set = <K extends keyof WriteData>(k: K, v: WriteData[K] | undefined) => {
    if (v !== undefined) d[k] = v
  }
  set('title', input.title)
  set('excerpt', input.excerpt ?? undefined)
  set('coverImageId', input.cover_image_id ?? undefined)
  set('categoryId', input.category_id ?? undefined)
  set('tags', input.tags)
  set('articleDate', input.article_date ?? undefined)
  set('readTimeMinutes', input.read_time_minutes ?? undefined)
  set('featured', input.featured)
  set('bodyLead', input.body_lead ?? undefined)
  if (input.body !== undefined) set('body', input.body as Prisma.InputJsonValue)
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

async function replaceGallery(tx: Prisma.TransactionClient, storyId: string, gallery: { media_id: string; caption?: string | null }[]): Promise<void> {
  await tx.newsGalleryItem.deleteMany({ where: { storyId } })
  if (gallery.length) await tx.newsGalleryItem.createMany({ data: gallery.map((g, i) => ({ storyId, mediaId: g.media_id, caption: g.caption ?? null, position: i })) })
}

// ── Admin reads ────────────────────────────────────────────────────────────

function buildWhere(filters: ListStoriesInput, publicOnly: boolean): Prisma.NewsStoryWhereInput {
  const where: Prisma.NewsStoryWhereInput = {}
  if (publicOnly) {
    where.status = 'published'
    where.deletedAt = null
  } else {
    if (!filters.includeDeleted) where.deletedAt = null
    if (filters.contentStatus) where.status = filters.contentStatus
    if (filters.featured !== undefined) where.featured = filters.featured
  }
  if (filters.category) where.category = { slug: filters.category }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { excerpt: { contains: filters.q, mode: 'insensitive' } },
      { category: { label: { contains: filters.q, mode: 'insensitive' } } },
    ]
  }
  return where
}

function buildOrderBy(sort: string | undefined): Prisma.NewsStoryOrderByWithRelationInput[] {
  switch (sort) {
    case 'oldest':
      return [{ articleDate: 'asc' }, { publishedAt: 'asc' }]
    case 'featured':
      return [{ featured: 'desc' }, { articleDate: 'desc' }]
    case 'latest':
    default:
      return [{ articleDate: 'desc' }, { publishedAt: 'desc' }]
  }
}

async function paginatedList(filters: ListStoriesInput, publicOnly: boolean) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? (publicOnly ? 9 : 20)))
  const where = buildWhere(filters, publicOnly)
  const [rows, total] = await Promise.all([
    db.newsStory.findMany({ where, include: listInclude, orderBy: buildOrderBy(filters.sort), skip: (page - 1) * pageSize, take: pageSize }),
    db.newsStory.count({ where }),
  ])
  return { data: rows.map((r) => toListItem(r, { includeAdmin: !publicOnly })), meta: { page, pageSize, total } }
}

export function listStories(filters: ListStoriesInput = {}) {
  return paginatedList(filters, false)
}

export async function getStory(id: string) {
  const s = await db.newsStory.findUnique({ where: { id }, include: detailInclude })
  if (!s) throw new NotFoundError('Story not found')
  return toDetail(s, { includeAdmin: true })
}

// ── Create / update / delete ───────────────────────────────────────────────

export async function createStory(actorId: string | null, input: CreateStoryInput) {
  await validateRefs(input)
  let slug: string
  if (input.slug) {
    if (await slugTaken(input.slug)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  } else {
    slug = await uniquifySlug(slugify(input.title))
  }
  const created = await db.newsStory.create({
    data: {
      ...(buildScalarData(input) as WriteData),
      title: input.title,
      slug,
      status: 'draft',
      createdById: actorId,
      updatedById: actorId,
      gallery: input.gallery ? { create: input.gallery.map((g, i) => ({ mediaId: g.media_id, caption: g.caption ?? null, position: i })) } : undefined,
    },
  })
  return getStory(created.id)
}

export async function updateStory(actorId: string | null, id: string, input: UpdateStoryInput) {
  const existing = await db.newsStory.findFirst({ where: { id, deletedAt: null } })
  if (!existing) throw new NotFoundError('Story not found')
  await validateRefs(input)
  let slug = existing.slug
  if (input.slug && input.slug !== existing.slug) {
    if (await slugTaken(input.slug, id)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  }
  await db.$transaction(async (tx) => {
    await tx.newsStory.update({ where: { id }, data: { ...buildScalarData(input), slug, updatedById: actorId } })
    if (input.gallery) await replaceGallery(tx, id, input.gallery)
  })
  if (slug !== existing.slug && existing.status === 'published') {
    await recordRedirect(`${NEWS_BASE_PATH}/${existing.slug}`, `${NEWS_BASE_PATH}/${slug}`, actorId)
  }
  return getStory(id)
}

export async function softDeleteStory(actorId: string | null, id: string): Promise<void> {
  const s = await db.newsStory.findFirst({ where: { id, deletedAt: null } })
  if (!s) throw new NotFoundError('Story not found')
  await db.newsStory.update({ where: { id }, data: { deletedAt: new Date(), featured: false, updatedById: actorId } })
}

export async function restoreStory(actorId: string | null, id: string) {
  const s = await db.newsStory.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!s) throw new NotFoundError('Soft-deleted story not found')
  await db.newsStory.update({ where: { id }, data: { deletedAt: null, updatedById: actorId } })
  return getStory(id)
}

export async function duplicateStory(actorId: string | null, id: string) {
  const src = await db.newsStory.findFirst({ where: { id, deletedAt: null }, include: { gallery: { orderBy: { position: 'asc' } } } })
  if (!src) throw new NotFoundError('Story not found')
  const slug = await uniquifySlug(`${src.slug}-copy`)
  const copy = await db.newsStory.create({
    data: {
      status: 'draft',
      publishedAt: null,
      slug,
      title: src.title,
      excerpt: src.excerpt,
      coverImageId: src.coverImageId,
      categoryId: src.categoryId,
      tags: src.tags,
      articleDate: src.articleDate,
      readTimeMinutes: src.readTimeMinutes,
      featured: false,
      bodyLead: src.bodyLead,
      body: src.body ?? Prisma.JsonNull,
      seoMetaTitle: src.seoMetaTitle,
      seoMetaDescription: src.seoMetaDescription,
      seoCanonicalUrl: src.seoCanonicalUrl,
      seoOgImageId: src.seoOgImageId,
      seoOgTitle: src.seoOgTitle,
      seoOgDescription: src.seoOgDescription,
      seoNoindex: src.seoNoindex,
      createdById: actorId,
      updatedById: actorId,
      gallery: { create: src.gallery.map((g) => ({ mediaId: g.mediaId, caption: g.caption, position: g.position })) },
    },
  })
  return getStory(copy.id)
}

// ── Publishing & workflow ──────────────────────────────────────────────────

export async function collectPublishIssues(id: string): Promise<{ field: string; issue: string }[]> {
  const s = await db.newsStory.findFirst({ where: { id, deletedAt: null }, include: { coverImage: true, gallery: { orderBy: { position: 'asc' }, include: { media: true } } } })
  if (!s) throw new NotFoundError('Story not found')
  const issues: { field: string; issue: string }[] = []
  const req = (cond: boolean, field: string, issue = 'required') => {
    if (!cond) issues.push({ field, issue })
  }
  req(!!s.title?.trim(), 'title')
  req(!!s.excerpt?.trim(), 'excerpt')
  req(!!s.categoryId, 'category')
  req(!!s.articleDate, 'article_date')
  req(!!s.coverImageId, 'cover_image')
  if (s.coverImage) req(!!s.coverImage.altText?.trim() && !s.coverImage.deletedAt, 'cover_image.alt', 'alt text required')

  const body = asBody(s.body)
  const hasContent = !!s.bodyLead?.trim() && (body.blocks?.length ?? 0) > 0
  req(hasContent, 'body', 'a lead and at least one block are required')

  const imgIds = bodyMediaIds(s.body)
  if (imgIds.length) {
    const assets = await db.mediaAsset.findMany({ where: { id: { in: imgIds } } })
    const byId = new Map(assets.map((x) => [x.id, x]))
    ;(body.blocks ?? []).forEach((b, j) => {
      if (b.kind !== 'img' || !b.media_id) return
      const asset = byId.get(b.media_id)
      if (!asset || asset.deletedAt || !asset.altText?.trim()) issues.push({ field: `body.blocks[${j}].img.alt`, issue: 'alt text required' })
    })
  }
  s.gallery.forEach((g, i) => {
    if (!g.media.altText?.trim() || g.media.deletedAt) issues.push({ field: `gallery[${i}].alt`, issue: 'alt text required' })
  })
  return issues
}

export async function publishStory(actorId: string | null, id: string) {
  const existing = await db.newsStory.findFirst({ where: { id, deletedAt: null }, select: { id: true, publishedAt: true } })
  if (!existing) throw new NotFoundError('Story not found')
  const issues = await collectPublishIssues(id)
  if (issues.length) throw new PublishValidationError(issues, 'Story cannot be published.')
  await db.newsStory.update({ where: { id }, data: { status: 'published', publishedAt: existing.publishedAt ?? new Date(), updatedById: actorId } })
  return getStory(id)
}

async function transition(actorId: string | null, id: string, status: 'draft' | 'archived') {
  const s = await db.newsStory.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!s) throw new NotFoundError('Story not found')
  await db.newsStory.update({ where: { id }, data: { status, featured: false, updatedById: actorId } })
  return getStory(id)
}
export const unpublishStory = (actorId: string | null, id: string) => transition(actorId, id, 'draft')
export const archiveStory = (actorId: string | null, id: string) => transition(actorId, id, 'archived')

export async function setFeatured(actorId: string | null, id: string, featured: boolean) {
  const s = await db.newsStory.findFirst({ where: { id, deletedAt: null }, select: { id: true, status: true } })
  if (!s) throw new NotFoundError('Story not found')
  if (featured && s.status !== 'published') throw new ValidationError('Only a published story can be featured', [{ rule: 'published_only' }])
  await db.newsStory.update({ where: { id }, data: { featured, updatedById: actorId } })
  return getStory(id)
}

export async function bulkStories(actorId: string | null, ids: string[], action: 'publish' | 'unpublish' | 'archive' | 'delete') {
  const results: { id: string; ok: boolean; error?: string }[] = []
  for (const id of ids) {
    try {
      if (action === 'publish') await publishStory(actorId, id)
      else if (action === 'unpublish') await unpublishStory(actorId, id)
      else if (action === 'archive') await archiveStory(actorId, id)
      else await softDeleteStory(actorId, id)
      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'failed' })
    }
  }
  return { results }
}

export async function getPreviewUrl(id: string): Promise<{ preview_url: string }> {
  const s = await db.newsStory.findFirst({ where: { id, deletedAt: null }, select: { slug: true } })
  if (!s) throw new NotFoundError('Story not found')
  const { createHmac } = await import('node:crypto')
  const exp = Date.now() + 1000 * 60 * 30
  const sig = createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-secret').update(`${id}.${exp}`).digest('hex').slice(0, 32)
  const settings = await db.seoSettings.findFirst({ select: { metadataBase: true } })
  const base = (settings?.metadataBase ?? '').replace(/\/$/, '')
  return { preview_url: `${base}${NEWS_BASE_PATH}/${s.slug}?preview=${exp}.${sig}` }
}

export const NEWS_REVALIDATE_TAG = NEWS_TAG

// ── Public reads (published, non-deleted only) ─────────────────────────────

export function getPublishedStories(input: PublicListStoriesInput = {}) {
  return paginatedList(input, true)
}

export async function getFeaturedStories() {
  const rows = await db.newsStory.findMany({ where: { featured: true, status: 'published', deletedAt: null }, include: listInclude, orderBy: { articleDate: 'desc' } })
  return { data: rows.map((r) => toListItem(r)) }
}

export async function getStoryFacets() {
  const groups = await db.newsStory.groupBy({ by: ['categoryId'], where: { status: 'published', deletedAt: null, categoryId: { not: null } }, _count: { _all: true } })
  const terms = await db.taxonomyTerm.findMany({ where: { id: { in: groups.map((g) => g.categoryId!) } }, select: { id: true, slug: true, label: true } })
  const byId = new Map(terms.map((t) => [t.id, t]))
  return {
    categories: groups
      .map((g) => ({ term: byId.get(g.categoryId!), count: g._count._all }))
      .filter((x) => x.term)
      .map((x) => ({ slug: x.term!.slug, label: x.term!.label, count: x.count })),
  }
}

async function getRelated(story: { id: string; categoryId: string | null }) {
  const base = { status: 'published' as const, deletedAt: null, id: { not: story.id } }
  let picks = story.categoryId
    ? await db.newsStory.findMany({ where: { ...base, categoryId: story.categoryId }, include: listInclude, orderBy: { articleDate: 'desc' }, take: 3 })
    : []
  if (picks.length < 3) {
    const excludeIds = [story.id, ...picks.map((p) => p.id)]
    const fill = await db.newsStory.findMany({ where: { status: 'published', deletedAt: null, id: { notIn: excludeIds } }, include: listInclude, orderBy: { articleDate: 'desc' }, take: 3 - picks.length })
    picks = [...picks, ...fill]
  }
  return picks.map((p) => toListItem(p))
}

export async function getPublishedStoryBySlug(slug: string) {
  const s = await db.newsStory.findFirst({ where: { slug, status: 'published', deletedAt: null }, include: detailInclude })
  if (!s) return null
  const related = await getRelated({ id: s.id, categoryId: s.categoryId })
  return toDetail(s, { includeAdmin: false, resolveBody: true, related })
}

// ── Cross-module wiring (consumed by SEO sitemap/redirect stubs) ───────────

export async function getPublishedStorySitemapEntries(): Promise<{ loc: string; lastmod: string }[]> {
  const rows = await db.newsStory.findMany({ where: { status: 'published', deletedAt: null, seoNoindex: false }, select: { slug: true, updatedAt: true } })
  return rows.map((r) => ({ loc: `${NEWS_BASE_PATH}/${r.slug}`, lastmod: r.updatedAt.toISOString() }))
}

export async function isPublishedStoryPath(path: string): Promise<boolean> {
  const m = path.match(/^\/news\/([^/?#]+)$/)
  if (!m) return false
  const row = await db.newsStory.findFirst({ where: { slug: decodeURIComponent(m[1]), status: 'published', deletedAt: null }, select: { id: true } })
  return !!row
}
