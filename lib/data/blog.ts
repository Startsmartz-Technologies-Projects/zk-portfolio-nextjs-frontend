import { db } from '@/lib/db'
import { Prisma, type MediaAsset } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import { mediaRefOf, resolveMediaRefs, type MediaRef } from '@/lib/data/media'
import { recordRedirect } from '@/lib/data/seo'
import type { CreateArticleInput, UpdateArticleInput, ListArticlesInput, PublicListArticlesInput } from '@/lib/validation/blog'

// Blog admin + published-read data layer (blog-be-2). Mirrors the Projects template;
// the rich content is a single JSONB `body` block document rather than child tables,
// related articles are auto-derived (same category → recent), and read_time/
// display_date are derived. Articles live at /blogs/<slug>.

export const BLOG_TAG = 'blog'
export const BLOG_BASE_PATH = '/blogs'
const WORDS_PER_MIN = 200

/** Fallback author bio when an article leaves `author_bio` empty (SRS §11.C, SITE default). */
const DEFAULT_AUTHOR_BIO =
  "Writing from Zakir Enterprise's live project portfolio — field-tested engineering and delivery practice across Bangladesh."

// ── Pure helpers (exported for unit tests) ─────────────────────────────────

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
  heading?: string
  items?: unknown[]
  media_id?: string
  caption?: string
}
interface BodyShape {
  sections?: { id: string; heading: string; level: number; blocks: BlockShape[] }[]
}

function asBody(body: Prisma.JsonValue | null): BodyShape {
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as BodyShape) : {}
}

function countWords(s: string | null | undefined): number {
  return s ? s.trim().split(/\s+/).filter(Boolean).length : 0
}

/** Word count across the lead + every text-bearing block (BR-8 read_time source). */
export function bodyWordCount(bodyLead: string | null, body: Prisma.JsonValue | null): number {
  let n = countWords(bodyLead)
  for (const section of asBody(body).sections ?? []) {
    n += countWords(section.heading)
    for (const b of section.blocks) {
      n += countWords(b.text) + countWords(b.heading)
      if (Array.isArray(b.items)) for (const item of b.items) n += countWords(typeof item === 'string' ? item : JSON.stringify(item))
    }
  }
  return n
}

export function deriveReadTimeMinutes(bodyLead: string | null, body: Prisma.JsonValue | null): number {
  return Math.max(1, Math.round(bodyWordCount(bodyLead, body) / WORDS_PER_MIN))
}

function readTimeLabel(minutes: number): string {
  return `${minutes} min read`
}

/** Collect every `img` block's media id from a body document. */
function bodyMediaIds(body: Prisma.JsonValue | null): string[] {
  const ids: string[] = []
  for (const s of asBody(body).sections ?? []) for (const b of s.blocks) if (b.kind === 'img' && b.media_id) ids.push(b.media_id)
  return ids
}

/** Resolve a body document's `img` blocks (`media_id` → `media` MediaRef) for public render. */
async function resolveBodyImages(body: Prisma.JsonValue | null): Promise<BodyShape> {
  const doc = asBody(body)
  const ids = bodyMediaIds(body)
  if (!ids.length) return doc
  const refs = await resolveMediaRefs(ids)
  const byId = new Map(refs.map((r) => [r.id, r]))
  return {
    sections: (doc.sections ?? []).map((s) => ({
      ...s,
      blocks: s.blocks.map((b) => {
        if (b.kind !== 'img' || !b.media_id) return b
        const { media_id, ...rest } = b
        return { ...rest, media: byId.get(media_id) ?? { id: media_id, withdrawn: true } }
      }),
    })),
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

const listInclude = { category: true, coverImage: true } satisfies Prisma.ArticleInclude
type ArticleRow = Prisma.ArticleGetPayload<{ include: typeof listInclude }>
const detailInclude = { category: true, coverImage: true, seoOgImage: true } satisfies Prisma.ArticleInclude
type ArticleDetailRow = Prisma.ArticleGetPayload<{ include: typeof detailInclude }>

function readTimeOf(a: { readTimeMinutes: number | null; bodyLead: string | null; body: Prisma.JsonValue | null }): string {
  return readTimeLabel(a.readTimeMinutes ?? deriveReadTimeMinutes(a.bodyLead, a.body))
}

export function toListItem(a: ArticleRow, opts: { includeAdmin?: boolean } = {}) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: termRef(a.category),
    tags: a.tags,
    author_name: a.authorName,
    author_role: a.authorRole,
    cover_image: mediaRef(a.coverImage),
    article_date: a.articleDate,
    display_date: formatDisplayDate(a.articleDate),
    read_time: readTimeOf(a),
    featured: a.featured,
    ...(opts.includeAdmin ? { popularity: a.popularity, content_status: a.status } : {}),
  }
}

function seoOf(a: ArticleDetailRow) {
  return {
    meta_title: a.seoMetaTitle,
    meta_description: a.seoMetaDescription,
    canonical_url: a.seoCanonicalUrl,
    og_image: a.seoOgImage ? mediaRefOf(a.seoOgImage) : null,
    og_title: a.seoOgTitle,
    og_description: a.seoOgDescription,
    noindex: a.seoNoindex,
  }
}

async function toDetail(a: ArticleDetailRow, opts: { includeAdmin?: boolean; resolveBody?: boolean; related?: unknown[] }) {
  return {
    ...toListItem(a, opts),
    legacy_id: a.legacyId,
    author_bio: a.authorBio?.trim() || DEFAULT_AUTHOR_BIO,
    body_lead: a.bodyLead,
    body: opts.resolveBody ? await resolveBodyImages(a.body) : a.body,
    ...(opts.related ? { related: opts.related } : {}),
    ...(opts.includeAdmin ? { seo: seoOf(a), created_at: a.createdAt, updated_at: a.updatedAt, published_at: a.publishedAt } : {}),
  }
}

// ── Slug + ref validation ──────────────────────────────────────────────────

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const row = await db.article.findUnique({ where: { slug }, select: { id: true } })
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
async function validateRefs(input: { cover_image_id?: string | null; category_id?: string | null; seo?: { og_image_id?: string | null } }): Promise<void> {
  const checks: Promise<void>[] = []
  if (input.cover_image_id) checks.push(ensureAsset(input.cover_image_id, 'cover_image_id'))
  if (input.seo?.og_image_id) checks.push(ensureAsset(input.seo.og_image_id, 'seo.og_image_id'))
  if (input.category_id) {
    checks.push(
      db.taxonomyTerm.findFirst({ where: { id: input.category_id, taxonomy: { slug: 'blog-category' } }, select: { id: true } }).then((t) => {
        if (!t) throw new ValidationError('category_id does not reference a blog-category term', [{ field: 'category_id' }])
      }),
    )
  }
  await Promise.all(checks)
}

// ── Field mapping ───────────────────────────────────────────────────────────

type WriteData = Prisma.ArticleUncheckedCreateInput
function buildScalarData(input: Partial<CreateArticleInput & UpdateArticleInput>): Partial<WriteData> {
  const d: Partial<WriteData> = {}
  const set = <K extends keyof WriteData>(k: K, v: WriteData[K] | undefined) => {
    if (v !== undefined) d[k] = v
  }
  set('title', input.title)
  set('excerpt', input.excerpt ?? undefined)
  set('coverImageId', input.cover_image_id ?? undefined)
  set('categoryId', input.category_id ?? undefined)
  set('tags', input.tags)
  set('authorName', input.author_name ?? undefined)
  set('authorRole', input.author_role ?? undefined)
  set('authorBio', input.author_bio ?? undefined)
  set('articleDate', input.article_date ?? undefined)
  set('readTimeMinutes', input.read_time_minutes ?? undefined)
  set('featured', input.featured)
  set('popularity', input.popularity)
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

// ── Admin reads ────────────────────────────────────────────────────────────

function buildWhere(filters: ListArticlesInput, publicOnly: boolean): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {}
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
      { authorName: { contains: filters.q, mode: 'insensitive' } },
      { category: { label: { contains: filters.q, mode: 'insensitive' } } },
      { tags: { has: filters.q } },
    ]
  }
  return where
}

function buildOrderBy(sort: string | undefined): Prisma.ArticleOrderByWithRelationInput[] {
  switch (sort) {
    case 'popular':
      return [{ popularity: 'desc' }, { articleDate: 'desc' }]
    case 'featured':
      return [{ featured: 'desc' }, { articleDate: 'desc' }]
    case 'latest':
    default:
      return [{ articleDate: 'desc' }, { publishedAt: 'desc' }]
  }
}

async function paginatedList(filters: ListArticlesInput, publicOnly: boolean) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? (publicOnly ? 6 : 20)))
  const where = buildWhere(filters, publicOnly)
  const [rows, total] = await Promise.all([
    db.article.findMany({ where, include: listInclude, orderBy: buildOrderBy(filters.sort), skip: (page - 1) * pageSize, take: pageSize }),
    db.article.count({ where }),
  ])
  return { data: rows.map((r) => toListItem(r, { includeAdmin: !publicOnly })), meta: { page, pageSize, total } }
}

export function listArticles(filters: ListArticlesInput = {}) {
  return paginatedList(filters, false)
}

export async function getArticle(id: string) {
  const a = await db.article.findUnique({ where: { id }, include: detailInclude })
  if (!a) throw new NotFoundError('Article not found')
  return toDetail(a, { includeAdmin: true })
}

// ── Create / update / delete ───────────────────────────────────────────────

export async function createArticle(actorId: string | null, input: CreateArticleInput) {
  await validateRefs(input)
  let slug: string
  if (input.slug) {
    if (await slugTaken(input.slug)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  } else {
    slug = await uniquifySlug(slugify(input.title))
  }
  const created = await db.article.create({
    data: { ...(buildScalarData(input) as WriteData), title: input.title, slug, status: 'draft', createdById: actorId, updatedById: actorId },
  })
  return getArticle(created.id)
}

export async function updateArticle(actorId: string | null, id: string, input: UpdateArticleInput) {
  const existing = await db.article.findFirst({ where: { id, deletedAt: null } })
  if (!existing) throw new NotFoundError('Article not found')
  await validateRefs(input)
  let slug = existing.slug
  if (input.slug && input.slug !== existing.slug) {
    if (await slugTaken(input.slug, id)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  }
  await db.article.update({ where: { id }, data: { ...buildScalarData(input), slug, updatedById: actorId } })
  if (slug !== existing.slug && existing.status === 'published') {
    await recordRedirect(`${BLOG_BASE_PATH}/${existing.slug}`, `${BLOG_BASE_PATH}/${slug}`, actorId)
  }
  return getArticle(id)
}

export async function softDeleteArticle(actorId: string | null, id: string): Promise<void> {
  const a = await db.article.findFirst({ where: { id, deletedAt: null } })
  if (!a) throw new NotFoundError('Article not found')
  await db.article.update({ where: { id }, data: { deletedAt: new Date(), featured: false, updatedById: actorId } })
}

export async function restoreArticle(actorId: string | null, id: string) {
  const a = await db.article.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!a) throw new NotFoundError('Soft-deleted article not found')
  await db.article.update({ where: { id }, data: { deletedAt: null, updatedById: actorId } })
  return getArticle(id)
}

export async function duplicateArticle(actorId: string | null, id: string) {
  const src = await db.article.findFirst({ where: { id, deletedAt: null } })
  if (!src) throw new NotFoundError('Article not found')
  const slug = await uniquifySlug(`${src.slug}-copy`)
  const copy = await db.article.create({
    data: {
      status: 'draft',
      publishedAt: null,
      slug,
      title: src.title,
      excerpt: src.excerpt,
      coverImageId: src.coverImageId,
      categoryId: src.categoryId,
      tags: src.tags,
      authorName: src.authorName,
      authorRole: src.authorRole,
      authorBio: src.authorBio,
      articleDate: src.articleDate,
      readTimeMinutes: src.readTimeMinutes,
      featured: false,
      popularity: src.popularity,
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
    },
  })
  return getArticle(copy.id)
}

// ── Publishing & workflow ──────────────────────────────────────────────────

export async function collectPublishIssues(id: string): Promise<{ field: string; issue: string }[]> {
  const a = await db.article.findFirst({ where: { id, deletedAt: null }, include: { coverImage: true } })
  if (!a) throw new NotFoundError('Article not found')
  const issues: { field: string; issue: string }[] = []
  const req = (cond: boolean, field: string, issue = 'required') => {
    if (!cond) issues.push({ field, issue })
  }
  req(!!a.title?.trim(), 'title')
  req(!!a.excerpt?.trim(), 'excerpt')
  req(!!a.categoryId, 'category')
  req(!!a.articleDate, 'article_date')
  req(!!a.coverImageId, 'cover_image')
  if (a.coverImage) req(!!a.coverImage.altText?.trim() && !a.coverImage.deletedAt, 'cover_image.alt', 'alt text required')

  // Body: at least a lead + one section with one block (§12).
  const body = asBody(a.body)
  const hasContent = !!a.bodyLead?.trim() && (body.sections?.some((s) => s.blocks.length > 0) ?? false)
  req(hasContent, 'body', 'a lead and at least one section with one block are required')

  // Every img block must reference an existing asset with alt text.
  const imgIds = bodyMediaIds(a.body)
  if (imgIds.length) {
    const assets = await db.mediaAsset.findMany({ where: { id: { in: imgIds } } })
    const byId = new Map(assets.map((x) => [x.id, x]))
    let idx = 0
    for (const s of body.sections ?? []) {
      for (let j = 0; j < s.blocks.length; j++) {
        const b = s.blocks[j]
        if (b.kind !== 'img' || !b.media_id) continue
        const asset = byId.get(b.media_id)
        if (!asset || asset.deletedAt || !asset.altText?.trim()) issues.push({ field: `body.sections[${idx}].blocks[${j}].img.alt`, issue: 'alt text required' })
      }
      idx++
    }
  }
  return issues
}

export async function publishArticle(actorId: string | null, id: string) {
  const existing = await db.article.findFirst({ where: { id, deletedAt: null }, select: { id: true, publishedAt: true } })
  if (!existing) throw new NotFoundError('Article not found')
  const issues = await collectPublishIssues(id)
  if (issues.length) throw new PublishValidationError(issues, 'Article cannot be published.')
  await db.article.update({ where: { id }, data: { status: 'published', publishedAt: existing.publishedAt ?? new Date(), updatedById: actorId } })
  return getArticle(id)
}

async function transition(actorId: string | null, id: string, status: 'draft' | 'archived') {
  const a = await db.article.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!a) throw new NotFoundError('Article not found')
  await db.article.update({ where: { id }, data: { status, featured: false, updatedById: actorId } })
  return getArticle(id)
}
export const unpublishArticle = (actorId: string | null, id: string) => transition(actorId, id, 'draft')
export const archiveArticle = (actorId: string | null, id: string) => transition(actorId, id, 'archived')

export async function setFeatured(actorId: string | null, id: string, featured: boolean) {
  const a = await db.article.findFirst({ where: { id, deletedAt: null }, select: { id: true, status: true } })
  if (!a) throw new NotFoundError('Article not found')
  if (featured && a.status !== 'published') throw new ValidationError('Only a published article can be featured', [{ rule: 'published_only' }])
  await db.article.update({ where: { id }, data: { featured, updatedById: actorId } })
  return getArticle(id)
}

export async function bulkArticles(actorId: string | null, ids: string[], action: 'publish' | 'unpublish' | 'archive' | 'delete') {
  const results: { id: string; ok: boolean; error?: string }[] = []
  for (const id of ids) {
    try {
      if (action === 'publish') await publishArticle(actorId, id)
      else if (action === 'unpublish') await unpublishArticle(actorId, id)
      else if (action === 'archive') await archiveArticle(actorId, id)
      else await softDeleteArticle(actorId, id)
      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'failed' })
    }
  }
  return { results }
}

export async function getPreviewUrl(id: string): Promise<{ preview_url: string }> {
  const a = await db.article.findFirst({ where: { id, deletedAt: null }, select: { slug: true } })
  if (!a) throw new NotFoundError('Article not found')
  const { createHmac } = await import('node:crypto')
  const exp = Date.now() + 1000 * 60 * 30
  const sig = createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-secret').update(`${id}.${exp}`).digest('hex').slice(0, 32)
  // Relative URL — resolves against the current origin (localhost in dev, live host in
  // prod). Don't prefix metadataBase: it points at the production domain and would send
  // local previews to the live site.
  return { preview_url: `${BLOG_BASE_PATH}/${a.slug}?preview=${exp}.${sig}` }
}

export const BLOG_REVALIDATE_TAG = BLOG_TAG

// ── Public reads (published, non-deleted only) ─────────────────────────────

export function getPublishedArticles(input: PublicListArticlesInput = {}) {
  return paginatedList(input, true)
}

export async function getFeaturedArticles() {
  const rows = await db.article.findMany({ where: { featured: true, status: 'published', deletedAt: null }, include: listInclude, orderBy: { articleDate: 'desc' } })
  return { data: rows.map((r) => toListItem(r)) }
}

export async function getArticleFacets() {
  const groups = await db.article.groupBy({ by: ['categoryId'], where: { status: 'published', deletedAt: null, categoryId: { not: null } }, _count: { _all: true } })
  const terms = await db.taxonomyTerm.findMany({ where: { id: { in: groups.map((g) => g.categoryId!) } }, select: { id: true, slug: true, label: true } })
  const byId = new Map(terms.map((t) => [t.id, t]))
  return {
    categories: groups
      .map((g) => ({ term: byId.get(g.categoryId!), count: g._count._all }))
      .filter((x) => x.term)
      .map((x) => ({ slug: x.term!.slug, label: x.term!.label, count: x.count })),
  }
}

/** Auto-related: up to 3 published articles in the same category (most recent), filled
 *  with the most-recent published overall, excluding the article itself (FR-BLOG-030). */
async function getRelated(article: { id: string; categoryId: string | null }) {
  const base = { status: 'published' as const, deletedAt: null, id: { not: article.id } }
  const sameCat = article.categoryId
    ? await db.article.findMany({ where: { ...base, categoryId: article.categoryId }, include: listInclude, orderBy: { articleDate: 'desc' }, take: 3 })
    : []
  let picks = sameCat
  if (picks.length < 3) {
    const excludeIds = [article.id, ...picks.map((p) => p.id)]
    const fill = await db.article.findMany({ where: { status: 'published', deletedAt: null, id: { notIn: excludeIds } }, include: listInclude, orderBy: { articleDate: 'desc' }, take: 3 - picks.length })
    picks = [...picks, ...fill]
  }
  return picks.map((p) => toListItem(p))
}

export async function getPublishedArticleBySlug(slug: string) {
  const a = await db.article.findFirst({ where: { slug, status: 'published', deletedAt: null }, include: detailInclude })
  if (!a) return null
  const related = await getRelated({ id: a.id, categoryId: a.categoryId })
  return toDetail(a, { includeAdmin: false, resolveBody: true, related })
}

// ── Cross-module wiring (consumed by SEO sitemap/redirect stubs) ───────────

export async function getPublishedArticleSitemapEntries(): Promise<{ loc: string; lastmod: string }[]> {
  const rows = await db.article.findMany({ where: { status: 'published', deletedAt: null, seoNoindex: false }, select: { slug: true, updatedAt: true } })
  return rows.map((r) => ({ loc: `${BLOG_BASE_PATH}/${r.slug}`, lastmod: r.updatedAt.toISOString() }))
}

export async function isPublishedArticlePath(path: string): Promise<boolean> {
  const m = path.match(/^\/blogs\/([^/?#]+)$/)
  if (!m) return false
  const row = await db.article.findFirst({ where: { slug: decodeURIComponent(m[1]), status: 'published', deletedAt: null }, select: { id: true } })
  return !!row
}
