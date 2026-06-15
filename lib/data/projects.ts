import { db } from '@/lib/db'
import { Prisma, type DeliveryStatus, type MediaAsset, type Project } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import { mediaRefOf, type MediaRef } from '@/lib/data/media'
import { recordRedirect } from '@/lib/data/seo'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsInput,
  PublicListProjectsInput,
  FeaturedInput,
} from '@/lib/validation/projects'

// Projects admin + published-read data layer (projects-be-2). Admin functions span
// all statuses and stamp the actor; published reads are scoped to published +
// non-deleted only (BR-4) and are cacheable by the consuming server component. This
// module is the structural template the other Wave-3 collections follow.

const PROJECTS_TAG = 'projects'
export const PROJECTS_BASE_PATH = '/projects'

// ── Pure helpers (exported for unit tests) ─────────────────────────────────

/** Lowercase, hyphenated slug from a title (matches SLUG_RE / FR conventions §9). */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Derive the displayed delivery year + duration label from the structured dates
 * (BR-7, §11.D). Year is the end year (fallback start year); duration is the span
 * in months/years, or "Ongoing" for an open-ended (`Ongoing`/`Planning`) project
 * with no end date (edge 14). Pure — SSR and admin preview agree.
 */
export function deriveYearDuration(
  startDate: Date | null,
  endDate: Date | null,
  deliveryStatus: DeliveryStatus,
): { year: number | null; durationLabel: string | null } {
  const year = endDate?.getUTCFullYear() ?? startDate?.getUTCFullYear() ?? null
  let durationLabel: string | null = null
  if (startDate && endDate) {
    const months = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 + (endDate.getUTCMonth() - startDate.getUTCMonth())
    // Months read more naturally up to ~2 years; years (1dp) beyond.
    if (months < 24) durationLabel = `${Math.max(months, 1)} months`
    else {
      const years = months / 12
      durationLabel = Number.isInteger(years) ? `${years} years` : `${years.toFixed(1)} years`
    }
  } else if (startDate && deliveryStatus !== 'Completed') {
    durationLabel = 'Ongoing'
  }
  return { year, durationLabel }
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
function coverRef(m: MediaAsset | null): MediaRef | null {
  return m ? mediaRefOf(m) : null
}

const listInclude = { category: true, location: true, coverImage: true } satisfies Prisma.ProjectInclude
type ProjectListRow = Prisma.ProjectGetPayload<{ include: typeof listInclude }>

const detailInclude = {
  category: true,
  location: true,
  coverImage: true,
  seoOgImage: true,
  scopes: { orderBy: { position: 'asc' } },
  highlights: { orderBy: { position: 'asc' } },
  gallery: { orderBy: { position: 'asc' }, include: { media: true } },
  related: { orderBy: { position: 'asc' }, include: { relatedProject: { include: listInclude } } },
} satisfies Prisma.ProjectInclude
type ProjectDetailRow = Prisma.ProjectGetPayload<{ include: typeof detailInclude }>

export function toListItem(p: ProjectListRow, opts: { includeStatus?: boolean } = {}) {
  const { year, durationLabel } = deriveYearDuration(p.startDate, p.endDate, p.deliveryStatus)
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    category: termRef(p.category),
    location: termRef(p.location),
    location_detail: p.locationDetail,
    client_type: p.clientType,
    delivery_status: p.deliveryStatus,
    year,
    duration_label: durationLabel,
    cover_image: coverRef(p.coverImage),
    badge_text: p.badgeText,
    badge_style: p.badgeStyle,
    featured: p.featured,
    featured_order: p.featuredOrder,
    ...(opts.includeStatus ? { content_status: p.status } : {}),
    updated_at: p.updatedAt,
  }
}

function seoOf(p: ProjectDetailRow) {
  return {
    meta_title: p.seoMetaTitle,
    meta_description: p.seoMetaDescription,
    canonical_url: p.seoCanonicalUrl,
    og_image: p.seoOgImage ? mediaRefOf(p.seoOgImage) : null,
    og_title: p.seoOgTitle,
    og_description: p.seoOgDescription,
    noindex: p.seoNoindex,
  }
}

export function toDetail(p: ProjectDetailRow, opts: { includeStatus?: boolean; includeRelated?: boolean } = {}) {
  const related = opts.includeRelated
    ? p.related
        .filter((r) => r.relatedProject.status === 'published' && !r.relatedProject.deletedAt)
        .map((r) => toListItem(r.relatedProject))
    : undefined
  return {
    ...toListItem(p, opts),
    legacy_id: p.legacyId,
    start_date: p.startDate,
    end_date: p.endDate,
    client: p.client,
    overview_title: p.overviewTitle,
    overview_body: p.overviewBody,
    pull_quote: p.pullQuote,
    services_delivered: p.servicesDelivered,
    scope_description: p.scopeDescription,
    scopes: p.scopes.map((s) => ({ id: s.id, icon: s.icon, value: s.value, title: s.title, description: s.description, position: s.position })),
    gallery_heading: p.galleryHeading,
    gallery_description: p.galleryDescription,
    gallery: p.gallery.map((g) => ({ id: g.id, media: mediaRefOf(g.media), caption: g.caption, position: g.position })),
    highlights_description: p.highlightsDescription,
    highlights: p.highlights.map((h) => ({ id: h.id, number: h.number, unit: h.unit, title: h.title, body: h.body, position: h.position })),
    case_study_challenge: p.caseStudyChallenge,
    case_study_approach: p.caseStudyApproach,
    case_study_result: p.caseStudyResult,
    cta_heading: p.ctaHeading,
    seo: seoOf(p),
    ...(related ? { related } : {}),
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    published_at: p.publishedAt,
  }
}

// ── Slug + reference validation ────────────────────────────────────────────

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const row = await db.project.findUnique({ where: { slug }, select: { id: true } })
  return !!row && row.id !== excludeId
}

/** Append `-2`, `-3`, … until the slug is free (used for auto-generated slugs / copies). */
async function uniquifySlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let n = 1
  while (await slugTaken(slug, excludeId)) slug = `${base}-${++n}`
  return slug
}

/** Validate the optional category/location/cover/og references exist (else 422). */
async function validateRefs(input: { category_id?: string | null; location_id?: string | null; cover_image_id?: string | null; seo?: { og_image_id?: string | null } }): Promise<void> {
  const checks: Promise<void>[] = []
  if (input.category_id) checks.push(ensureTerm(input.category_id, 'projects-category', 'category_id'))
  if (input.location_id) checks.push(ensureTerm(input.location_id, 'location', 'location_id'))
  if (input.cover_image_id) checks.push(ensureAsset(input.cover_image_id, 'cover_image_id'))
  const ogId = input.seo?.og_image_id
  if (ogId) checks.push(ensureAsset(ogId, 'seo.og_image_id'))
  await Promise.all(checks)
}
async function ensureTerm(id: string, vocab: string, field: string): Promise<void> {
  const term = await db.taxonomyTerm.findFirst({ where: { id, taxonomy: { slug: vocab } }, select: { id: true } })
  if (!term) throw new ValidationError(`${field} does not reference a term in '${vocab}'`, [{ field }])
}
async function ensureAsset(id: string, field: string): Promise<void> {
  const a = await db.mediaAsset.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!a) throw new ValidationError(`${field} does not reference an existing asset`, [{ field }])
}

// ── Field mapping (snake_case input → Prisma columns) ──────────────────────

type WriteData = Prisma.ProjectUncheckedCreateInput
function buildScalarData(input: Partial<CreateProjectInput & UpdateProjectInput>): Partial<WriteData> {
  const d: Partial<WriteData> = {}
  const set = <K extends keyof WriteData>(k: K, v: WriteData[K] | undefined) => {
    if (v !== undefined) d[k] = v
  }
  set('title', input.title)
  set('summary', input.summary ?? undefined)
  set('categoryId', input.category_id ?? undefined)
  set('locationId', input.location_id ?? undefined)
  set('locationDetail', input.location_detail ?? undefined)
  set('clientType', input.client_type ?? undefined)
  set('deliveryStatus', input.delivery_status)
  set('startDate', input.start_date ?? undefined)
  set('endDate', input.end_date ?? undefined)
  set('coverImageId', input.cover_image_id ?? undefined)
  set('badgeText', input.badge_text ?? undefined)
  set('badgeStyle', input.badge_style)
  set('client', input.client ?? undefined)
  set('overviewTitle', input.overview_title ?? undefined)
  set('overviewBody', input.overview_body ?? undefined)
  set('pullQuote', input.pull_quote ?? undefined)
  set('servicesDelivered', input.services_delivered)
  set('scopeDescription', input.scope_description ?? undefined)
  set('galleryHeading', input.gallery_heading ?? undefined)
  set('galleryDescription', input.gallery_description ?? undefined)
  set('highlightsDescription', input.highlights_description ?? undefined)
  set('caseStudyChallenge', input.case_study_challenge ?? undefined)
  set('caseStudyApproach', input.case_study_approach ?? undefined)
  set('caseStudyResult', input.case_study_result ?? undefined)
  set('ctaHeading', input.cta_heading ?? undefined)
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

function buildWhere(filters: ListProjectsInput, opts: { publicOnly?: boolean }): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {}
  if (opts.publicOnly) {
    where.status = 'published'
    where.deletedAt = null
  } else {
    if (!filters.includeDeleted) where.deletedAt = null
    if (filters.contentStatus) where.status = filters.contentStatus
    if (filters.featured !== undefined) where.featured = filters.featured
  }
  if (filters.category) where.category = { slug: filters.category }
  if (filters.location) where.location = { slug: filters.location }
  if (filters.clientType) where.clientType = filters.clientType
  if (filters.deliveryStatus) where.deliveryStatus = filters.deliveryStatus
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { locationDetail: { contains: filters.q, mode: 'insensitive' } },
    ]
  }
  return where
}

function buildOrderBy(sort: string | undefined): Prisma.ProjectOrderByWithRelationInput[] {
  switch (sort) {
    case 'oldest':
      return [{ startDate: 'asc' }, { createdAt: 'asc' }]
    case 'title':
      return [{ title: 'asc' }]
    case 'featured':
      return [{ featuredOrder: 'asc' }, { updatedAt: 'desc' }]
    case 'recent':
    default:
      // Recency: end_date, then start_date, then published_at (FR-PROJ-003).
      return [{ endDate: 'desc' }, { startDate: 'desc' }, { publishedAt: 'desc' }]
  }
}

async function paginatedList(filters: ListProjectsInput, opts: { publicOnly?: boolean }) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))
  const where = buildWhere(filters, opts)
  const [rows, total] = await Promise.all([
    db.project.findMany({ where, include: listInclude, orderBy: buildOrderBy(filters.sort), skip: (page - 1) * pageSize, take: pageSize }),
    db.project.count({ where }),
  ])
  return { data: rows.map((r) => toListItem(r, { includeStatus: !opts.publicOnly })), meta: { page, pageSize, total } }
}

export function listProjects(filters: ListProjectsInput = {}) {
  return paginatedList(filters, { publicOnly: false })
}

export async function getProject(id: string) {
  const p = await db.project.findUnique({ where: { id }, include: detailInclude })
  if (!p) throw new NotFoundError('Project not found')
  return toDetail(p, { includeStatus: true })
}

// ── Create / update / delete ───────────────────────────────────────────────

export async function createProject(actorId: string | null, input: CreateProjectInput) {
  await validateRefs(input)
  let slug: string
  if (input.slug) {
    if (await slugTaken(input.slug)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  } else {
    slug = await uniquifySlug(slugify(input.title))
  }

  const created = await db.project.create({
    data: {
      ...(buildScalarData(input) as WriteData),
      title: input.title,
      slug,
      status: 'draft',
      createdById: actorId,
      updatedById: actorId,
      scopes: input.scopes ? { create: input.scopes.map((s, i) => ({ icon: s.icon, value: s.value ?? '', title: s.title, description: s.description ?? null, position: i })) } : undefined,
      highlights: input.highlights ? { create: input.highlights.map((h, i) => ({ number: h.number ?? '', unit: h.unit ?? null, title: h.title, body: h.body ?? null, position: i })) } : undefined,
      gallery: input.gallery ? { create: input.gallery.map((g, i) => ({ mediaId: g.media_id, caption: g.caption ?? null, position: i })) } : undefined,
    },
    include: detailInclude,
  })

  if (input.related_project_ids?.length) {
    await replaceRelated(created.id, input.related_project_ids)
    return getProject(created.id)
  }
  return toDetail(created, { includeStatus: true })
}

/** Replace a project's curated related set after validating it (FR-PROJ-039, §12). */
async function replaceRelated(projectId: string, relatedIds: string[]): Promise<void> {
  const ids = [...new Set(relatedIds)].slice(0, 3)
  if (ids.includes(projectId)) throw new ValidationError('A project cannot relate to itself', [{ field: 'related_project_ids' }])
  if (ids.length) {
    const valid = await db.project.findMany({ where: { id: { in: ids }, status: 'published', deletedAt: null }, select: { id: true } })
    if (valid.length !== ids.length) {
      throw new ValidationError('related_project_ids must reference distinct published projects', [{ field: 'related_project_ids' }])
    }
  }
  await db.$transaction([
    db.projectRelatedItem.deleteMany({ where: { projectId } }),
    ...ids.map((relatedProjectId, position) => db.projectRelatedItem.create({ data: { projectId, relatedProjectId, position } })),
  ])
}

export async function updateProject(actorId: string | null, id: string, input: UpdateProjectInput) {
  const existing = await db.project.findFirst({ where: { id, deletedAt: null } })
  if (!existing) throw new NotFoundError('Project not found')
  await validateRefs(input)

  // Slug change → uniqueness + redirect on a published project (FR-PROJ-027).
  let slug = existing.slug
  if (input.slug && input.slug !== existing.slug) {
    if (await slugTaken(input.slug, id)) throw new ConflictError(`Slug '${input.slug}' is already in use`, [{ field: 'slug' }])
    slug = input.slug
  }

  await db.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: { ...buildScalarData(input), slug, updatedById: actorId },
    })
    if (input.scopes) {
      await tx.projectScope.deleteMany({ where: { projectId: id } })
      if (input.scopes.length) await tx.projectScope.createMany({ data: input.scopes.map((s, i) => ({ projectId: id, icon: s.icon, value: s.value ?? '', title: s.title, description: s.description ?? null, position: i })) })
    }
    if (input.highlights) {
      await tx.projectHighlight.deleteMany({ where: { projectId: id } })
      if (input.highlights.length) await tx.projectHighlight.createMany({ data: input.highlights.map((h, i) => ({ projectId: id, number: h.number ?? '', unit: h.unit ?? null, title: h.title, body: h.body ?? null, position: i })) })
    }
    if (input.gallery) {
      await tx.projectGalleryItem.deleteMany({ where: { projectId: id } })
      if (input.gallery.length) await tx.projectGalleryItem.createMany({ data: input.gallery.map((g, i) => ({ projectId: id, mediaId: g.media_id, caption: g.caption ?? null, position: i })) })
    }
  })

  if (input.related_project_ids) await replaceRelated(id, input.related_project_ids)

  if (slug !== existing.slug && existing.status === 'published') {
    await recordRedirect(`${PROJECTS_BASE_PATH}/${existing.slug}`, `${PROJECTS_BASE_PATH}/${slug}`, actorId)
  }
  return getProject(id)
}

export async function softDeleteProject(actorId: string | null, id: string): Promise<void> {
  const p = await db.project.findFirst({ where: { id, deletedAt: null } })
  if (!p) throw new NotFoundError('Project not found')
  await db.project.update({ where: { id }, data: { deletedAt: new Date(), featured: false, featuredOrder: null, updatedById: actorId } })
}

export async function restoreProject(actorId: string | null, id: string) {
  const p = await db.project.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!p) throw new NotFoundError('Soft-deleted project not found')
  await db.project.update({ where: { id }, data: { deletedAt: null, updatedById: actorId } })
  return getProject(id)
}

export async function duplicateProject(actorId: string | null, id: string) {
  const src = await db.project.findFirst({ where: { id, deletedAt: null }, include: detailInclude })
  if (!src) throw new NotFoundError('Project not found')
  const slug = await uniquifySlug(`${src.slug}-copy`)

  const copy = await db.project.create({
    data: {
      status: 'draft',
      publishedAt: null,
      slug,
      title: src.title,
      summary: src.summary,
      categoryId: src.categoryId,
      clientType: src.clientType,
      deliveryStatus: src.deliveryStatus,
      locationId: src.locationId,
      locationDetail: src.locationDetail,
      startDate: src.startDate,
      endDate: src.endDate,
      coverImageId: src.coverImageId,
      badgeText: src.badgeText,
      badgeStyle: src.badgeStyle,
      featured: false,
      overviewTitle: src.overviewTitle,
      overviewBody: src.overviewBody,
      pullQuote: src.pullQuote,
      client: src.client,
      servicesDelivered: src.servicesDelivered,
      scopeDescription: src.scopeDescription,
      galleryHeading: src.galleryHeading,
      galleryDescription: src.galleryDescription,
      highlightsDescription: src.highlightsDescription,
      caseStudyChallenge: src.caseStudyChallenge,
      caseStudyApproach: src.caseStudyApproach,
      caseStudyResult: src.caseStudyResult,
      ctaHeading: src.ctaHeading,
      seoMetaTitle: src.seoMetaTitle,
      seoMetaDescription: src.seoMetaDescription,
      seoCanonicalUrl: src.seoCanonicalUrl,
      seoOgImageId: src.seoOgImageId,
      seoOgTitle: src.seoOgTitle,
      seoOgDescription: src.seoOgDescription,
      seoNoindex: src.seoNoindex,
      createdById: actorId,
      updatedById: actorId,
      scopes: { create: src.scopes.map((s) => ({ icon: s.icon, value: s.value, title: s.title, description: s.description, position: s.position })) },
      highlights: { create: src.highlights.map((h) => ({ number: h.number, unit: h.unit, title: h.title, body: h.body, position: h.position })) },
      gallery: { create: src.gallery.map((g) => ({ mediaId: g.mediaId, caption: g.caption, position: g.position })) },
    },
  })
  return getProject(copy.id)
}

// ── Publishing & workflow ──────────────────────────────────────────────────

/** Collect every required-for-publish field / alt-text gap (§12, FR-PROJ-019/029). */
export async function collectPublishIssues(id: string): Promise<{ field: string; issue: string }[]> {
  const p = await db.project.findFirst({
    where: { id, deletedAt: null },
    include: { coverImage: true, gallery: { orderBy: { position: 'asc' }, include: { media: true } } },
  })
  if (!p) throw new NotFoundError('Project not found')
  const issues: { field: string; issue: string }[] = []
  const req = (cond: boolean, field: string, issue = 'required') => {
    if (!cond) issues.push({ field, issue })
  }
  req(!!p.title?.trim(), 'title')
  req(!!p.summary?.trim(), 'summary')
  req(!!p.categoryId, 'category')
  req(!!p.locationId, 'location')
  req(!!p.clientType, 'client_type')
  req(!!p.startDate, 'start_date')
  if (p.deliveryStatus === 'Completed') req(!!p.endDate, 'end_date')
  req(!!p.coverImageId, 'cover_image')
  if (p.coverImage) req(!!p.coverImage.altText?.trim() && !p.coverImage.deletedAt, 'cover_image.alt', 'alt text required')
  p.gallery.forEach((g, i) => {
    if (!g.media.altText?.trim() || g.media.deletedAt) issues.push({ field: `gallery[${i}].alt`, issue: 'alt text required' })
  })
  return issues
}

export async function publishProject(actorId: string | null, id: string) {
  const existing = await db.project.findFirst({ where: { id, deletedAt: null }, select: { id: true, slug: true, legacyId: true, publishedAt: true } })
  if (!existing) throw new NotFoundError('Project not found')
  const issues = await collectPublishIssues(id)
  if (issues.length) throw new PublishValidationError(issues, 'Project cannot be published.')

  await db.project.update({
    where: { id },
    data: { status: 'published', publishedAt: existing.publishedAt ?? new Date(), updatedById: actorId },
  })
  // Legacy URL → current slug (FR-PROJ-028), recorded once on publish.
  if (existing.legacyId) {
    await recordRedirect(`${PROJECTS_BASE_PATH}/${existing.legacyId}`, `${PROJECTS_BASE_PATH}/${existing.slug}`, actorId)
  }
  return getProject(id)
}

async function transition(actorId: string | null, id: string, status: 'draft' | 'archived') {
  const p = await db.project.findFirst({ where: { id, deletedAt: null }, select: { id: true } })
  if (!p) throw new NotFoundError('Project not found')
  // Unpublish/archive auto-unfeatures (FR-PROJ-025).
  await db.project.update({ where: { id }, data: { status, featured: false, featuredOrder: null, updatedById: actorId } })
  return getProject(id)
}
export const unpublishProject = (actorId: string | null, id: string) => transition(actorId, id, 'draft')
export const archiveProject = (actorId: string | null, id: string) => transition(actorId, id, 'archived')

// ── Featured curation ──────────────────────────────────────────────────────

async function maxFeatured(): Promise<number> {
  const s = await db.settingValue.findUnique({ where: { key: 'max_featured_projects' } })
  const n = s ? Number(s.value) : 3
  return Number.isInteger(n) && n > 0 ? n : 3
}

export async function setFeatured(actorId: string | null, input: FeaturedInput) {
  const ids = input.ordered_ids
  if (new Set(ids).size !== ids.length) throw new ValidationError('Featured ids must be distinct', [{ field: 'ordered_ids' }])
  const max = await maxFeatured()
  if (ids.length > max) throw new ValidationError(`At most ${max} featured projects allowed`, [{ field: 'ordered_ids', rule: 'max_featured_projects', max }])
  if (ids.length) {
    const publishable = await db.project.findMany({ where: { id: { in: ids }, status: 'published', deletedAt: null }, select: { id: true } })
    if (publishable.length !== ids.length) throw new ValidationError('Only published projects can be featured', [{ field: 'ordered_ids', rule: 'published_only' }])
  }
  await db.$transaction([
    db.project.updateMany({ where: { featured: true, id: { notIn: ids.length ? ids : ['00000000-0000-0000-0000-000000000000'] } }, data: { featured: false, featuredOrder: null } }),
    ...ids.map((id, i) => db.project.update({ where: { id }, data: { featured: true, featuredOrder: i, updatedById: actorId } })),
  ])
  const rows = await db.project.findMany({ where: { featured: true, deletedAt: null }, include: listInclude, orderBy: { featuredOrder: 'asc' } })
  return { featured: rows.map((r) => toListItem(r, { includeStatus: true })) }
}

// ── Bulk ────────────────────────────────────────────────────────────────────

export async function bulkProjects(actorId: string | null, ids: string[], action: 'publish' | 'unpublish' | 'archive' | 'delete') {
  const results: { id: string; ok: boolean; error?: string }[] = []
  for (const id of ids) {
    try {
      if (action === 'publish') await publishProject(actorId, id)
      else if (action === 'unpublish') await unpublishProject(actorId, id)
      else if (action === 'archive') await archiveProject(actorId, id)
      else await softDeleteProject(actorId, id)
      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'failed' })
    }
  }
  return { results }
}

// ── Preview ──────────────────────────────────────────────────────────────────

/** Build a signed draft-preview URL (FR-PROJ-032). HMAC over `<id>.<exp>` with AUTH_SECRET. */
export async function getPreviewUrl(id: string): Promise<{ preview_url: string }> {
  const p = await db.project.findFirst({ where: { id, deletedAt: null }, select: { slug: true } })
  if (!p) throw new NotFoundError('Project not found')
  const { createHmac } = await import('node:crypto')
  const exp = Date.now() + 1000 * 60 * 30 // 30 min
  const secret = process.env.AUTH_SECRET ?? 'dev-secret'
  const sig = createHmac('sha256', secret).update(`${id}.${exp}`).digest('hex').slice(0, 32)
  const token = `${exp}.${sig}`
  const settings = await db.seoSettings.findFirst({ select: { metadataBase: true } })
  const base = (settings?.metadataBase ?? '').replace(/\/$/, '')
  return { preview_url: `${base}${PROJECTS_BASE_PATH}/${p.slug}?preview=${token}` }
}

export const PROJECTS_REVALIDATE_TAG = PROJECTS_TAG

// ── Public reads (published, non-deleted only) — projects-be-2 ─────────────
// Scoped to published + non-deleted (BR-4); cacheable by the consuming server
// component (the deferred public-site rework wires unstable_cache + revalidateTag).

export async function getPublishedProjects(input: PublicListProjectsInput = {}) {
  return paginatedList(input, { publicOnly: true })
}

export async function getPublishedProjectBySlug(slug: string) {
  const p = await db.project.findFirst({ where: { slug, status: 'published', deletedAt: null }, include: detailInclude })
  if (!p) return null
  return toDetail(p, { includeStatus: false, includeRelated: true })
}

export async function getFeaturedProjects() {
  const rows = await db.project.findMany({ where: { featured: true, status: 'published', deletedAt: null }, include: listInclude, orderBy: { featuredOrder: 'asc' } })
  return { data: rows.map((r) => toListItem(r)) }
}

export async function getProjectFacets() {
  const where: Prisma.ProjectWhereInput = { status: 'published', deletedAt: null }
  const [byCat, byLoc, byClient, byDelivery] = await Promise.all([
    db.project.groupBy({ by: ['categoryId'], where: { ...where, categoryId: { not: null } }, _count: { _all: true } }),
    db.project.groupBy({ by: ['locationId'], where: { ...where, locationId: { not: null } }, _count: { _all: true } }),
    db.project.groupBy({ by: ['clientType'], where: { ...where, clientType: { not: null } }, _count: { _all: true } }),
    db.project.groupBy({ by: ['deliveryStatus'], where, _count: { _all: true } }),
  ])
  const termIds = [...byCat.map((c) => c.categoryId!), ...byLoc.map((l) => l.locationId!)]
  const terms = await db.taxonomyTerm.findMany({ where: { id: { in: termIds } }, select: { id: true, slug: true, label: true } })
  const termById = new Map(terms.map((t) => [t.id, t]))
  const toTermFacets = (rows: { categoryId?: string | null; locationId?: string | null; _count: { _all: number } }[], key: 'categoryId' | 'locationId') =>
    rows
      .map((r) => ({ term: termById.get((r[key] as string)!), count: r._count._all }))
      .filter((x) => x.term)
      .map((x) => ({ slug: x.term!.slug, label: x.term!.label, count: x.count }))
  return {
    categories: toTermFacets(byCat, 'categoryId'),
    locations: toTermFacets(byLoc, 'locationId'),
    client_types: byClient.map((c) => ({ value: c.clientType!, count: c._count._all })),
    delivery_statuses: byDelivery.map((d) => ({ value: d.deliveryStatus, count: d._count._all })),
  }
}

export async function getProjectStats() {
  const where: Prisma.ProjectWhereInput = { status: 'published', deletedAt: null }
  const [total, districts] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({ where: { ...where, locationId: { not: null } }, distinct: ['locationId'], select: { locationId: true } }),
  ])
  return { total_projects: total, districts_covered: districts.length }
}

// ── Cross-module wiring helpers (consumed by SEO sitemap/redirect stubs) ───
// Exposed so SEO can aggregate published project URLs without re-deriving the
// route shape. Published + non-deleted + indexable (non-noindex) only.

export async function getPublishedProjectSitemapEntries(): Promise<{ loc: string; lastmod: string }[]> {
  const rows = await db.project.findMany({
    where: { status: 'published', deletedAt: null, seoNoindex: false },
    select: { slug: true, updatedAt: true, publishedAt: true },
  })
  return rows.map((r) => ({ path: `${PROJECTS_BASE_PATH}/${r.slug}`, lastmod: (r.updatedAt ?? r.publishedAt ?? new Date()).toISOString() })).map(({ path, lastmod }) => ({ loc: path, lastmod }))
}

/** Whether a path is a live published project URL (SEO redirect collision guard). */
export async function isPublishedProjectPath(path: string): Promise<boolean> {
  const m = path.match(/^\/projects\/([^/?#]+)$/)
  if (!m) return false
  const row = await db.project.findFirst({ where: { slug: decodeURIComponent(m[1]), status: 'published', deletedAt: null }, select: { id: true } })
  return !!row
}
