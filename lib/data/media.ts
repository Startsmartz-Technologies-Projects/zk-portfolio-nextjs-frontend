import { db } from '@/lib/db'
import { Prisma, type MediaAsset } from '@prisma/client'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'
import { validateUploadType, normalizeTags, type RegisterInput, type ListFiltersInput } from '@/lib/validation/media'

/** A record that references an asset (cover/gallery/og/brand-slot/document/…). */
export interface UsageRef {
  module: string
  record_id: string
  title: string
  role: string
}

/** Hard-delete blocked because the asset is still referenced (HTTP 409). */
export class AssetInUseError extends AppError {
  constructor(usage: UsageRef[]) {
    super(409, 'AssetInUse', `Asset is referenced by ${usage.length} record(s).`, usage)
  }
}

/**
 * Reference usage across consuming modules (FR-MEDIA-014, SRS §17 Q1 → **on-demand FK
 * lookups**, no maintained index in v1). Each Wave-3 module wires its MediaAsset FK
 * columns here as it lands: PROJ cover/gallery/og (below); SVC/BLOG/NEWS cover+og,
 * CERT `document`, CONC/PAGES section images, LEADS attachments to follow. The
 * delete-guard + `/usage` consume this (a referenced asset is 409-blocked from
 * hard delete).
 */
export async function computeAssetUsage(assetId: string): Promise<UsageRef[]> {
  const refs: UsageRef[] = []

  // PROJECTS — cover image, SeoMeta OG image, and gallery items (projects-be-2).
  const [projCovers, projOg, galleryItems] = await Promise.all([
    db.project.findMany({ where: { coverImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.project.findMany({ where: { seoOgImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.projectGalleryItem.findMany({ where: { mediaId: assetId, project: { deletedAt: null } }, select: { project: { select: { id: true, title: true } } } }),
  ])
  for (const p of projCovers) refs.push({ module: 'projects', record_id: p.id, title: p.title, role: 'cover_image' })
  for (const p of projOg) refs.push({ module: 'projects', record_id: p.id, title: p.title, role: 'og_image' })
  for (const g of galleryItems) refs.push({ module: 'projects', record_id: g.project.id, title: g.project.title, role: 'gallery' })

  // SERVICES — hero, machine, cta, and SeoMeta OG images (services-be-2).
  const [svcHero, svcMachine, svcCta, svcOg] = await Promise.all([
    db.service.findMany({ where: { heroImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.service.findMany({ where: { machineImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.service.findMany({ where: { ctaImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.service.findMany({ where: { seoOgImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
  ])
  for (const s of svcHero) refs.push({ module: 'services', record_id: s.id, title: s.title, role: 'hero_image' })
  for (const s of svcMachine) refs.push({ module: 'services', record_id: s.id, title: s.title, role: 'machine_image' })
  for (const s of svcCta) refs.push({ module: 'services', record_id: s.id, title: s.title, role: 'cta_image' })
  for (const s of svcOg) refs.push({ module: 'services', record_id: s.id, title: s.title, role: 'og_image' })

  // BLOG — cover + SeoMeta OG columns, plus `img` blocks inside the JSONB body
  // (matched by id text — over-cautious for the delete-guard) (blog-be-2).
  const [artCover, artOg, artBody] = await Promise.all([
    db.article.findMany({ where: { coverImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.article.findMany({ where: { seoOgImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.$queryRaw<{ id: string; title: string }[]>`SELECT id, title FROM articles WHERE deleted_at IS NULL AND body::text LIKE ${'%' + assetId + '%'}`,
  ])
  for (const a of artCover) refs.push({ module: 'blog', record_id: a.id, title: a.title, role: 'cover_image' })
  for (const a of artOg) refs.push({ module: 'blog', record_id: a.id, title: a.title, role: 'og_image' })
  for (const a of artBody) refs.push({ module: 'blog', record_id: a.id, title: a.title, role: 'body_image' })

  // NEWS — cover + SeoMeta OG columns, gallery FK, and `img` blocks in the JSONB body
  // (matched by id text) (news-be-2).
  const [newsCover, newsOg, newsGallery, newsBody] = await Promise.all([
    db.newsStory.findMany({ where: { coverImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.newsStory.findMany({ where: { seoOgImageId: assetId, deletedAt: null }, select: { id: true, title: true } }),
    db.newsGalleryItem.findMany({ where: { mediaId: assetId, story: { deletedAt: null } }, select: { story: { select: { id: true, title: true } } } }),
    db.$queryRaw<{ id: string; title: string }[]>`SELECT id, title FROM news_stories WHERE deleted_at IS NULL AND body::text LIKE ${'%' + assetId + '%'}`,
  ])
  for (const s of newsCover) refs.push({ module: 'news', record_id: s.id, title: s.title, role: 'cover_image' })
  for (const s of newsOg) refs.push({ module: 'news', record_id: s.id, title: s.title, role: 'og_image' })
  for (const g of newsGallery) refs.push({ module: 'news', record_id: g.story.id, title: g.story.title, role: 'gallery' })
  for (const s of newsBody) refs.push({ module: 'news', record_id: s.id, title: s.title, role: 'body_image' })

  // CERTIFICATIONS — the certificate `document` asset (certifications-be-2).
  const certDocs = await db.certification.findMany({ where: { documentId: assetId, deletedAt: null }, select: { id: true, title: true } })
  for (const c of certDocs) refs.push({ module: 'certifications', record_id: c.id, title: c.title, role: 'document' })

  // CONCERNS — hero + SeoMeta OG columns, showcase-project images, gallery FKs (concerns-be-2).
  const [concHero, concOg, concShowcase, concGallery] = await Promise.all([
    db.concern.findMany({ where: { heroImageId: assetId, deletedAt: null }, select: { id: true, name: true } }),
    db.concern.findMany({ where: { seoOgImageId: assetId, deletedAt: null }, select: { id: true, name: true } }),
    db.concernShowcaseProject.findMany({ where: { imageId: assetId, concern: { deletedAt: null } }, select: { concern: { select: { id: true, name: true } } } }),
    db.concernGalleryItem.findMany({ where: { mediaId: assetId, concern: { deletedAt: null } }, select: { concern: { select: { id: true, name: true } } } }),
  ])
  for (const c of concHero) refs.push({ module: 'concerns', record_id: c.id, title: c.name, role: 'hero_image' })
  for (const c of concOg) refs.push({ module: 'concerns', record_id: c.id, title: c.name, role: 'og_image' })
  for (const s of concShowcase) refs.push({ module: 'concerns', record_id: s.concern.id, title: s.concern.name, role: 'showcase_image' })
  for (const g of concGallery) refs.push({ module: 'concerns', record_id: g.concern.id, title: g.concern.name, role: 'gallery' })

  return refs
}

function altPresent(a: Pick<MediaAsset, 'resourceType' | 'altText'>): boolean {
  return a.resourceType === 'image' && !!a.altText?.trim()
}

/** Admin view of an asset (contract §2.2): the row + derived `alt_present`/`in_use`. */
export function toAdminView(asset: MediaAsset, inUse: boolean) {
  return {
    id: asset.id,
    resource_type: asset.resourceType,
    provider: asset.provider,
    public_id: asset.publicId,
    url: asset.url,
    format: asset.format,
    bytes: asset.bytes,
    width: asset.width,
    height: asset.height,
    alt_text: asset.altText,
    alt_present: altPresent(asset),
    title: asset.title,
    original_filename: asset.originalFilename,
    tags: asset.tags,
    in_use: inUse,
    created_at: asset.createdAt,
    updated_at: asset.updatedAt,
    deleted_at: asset.deletedAt,
  }
}

export async function registerAsset(actorId: string | null, input: RegisterInput) {
  validateUploadType(input.resource_type, input.format, input.bytes)
  const asset = await db.mediaAsset.create({
    data: {
      resourceType: input.resource_type,
      provider: 'cloudinary',
      publicId: input.public_id,
      url: input.url,
      format: input.format.toLowerCase(),
      bytes: input.bytes,
      width: input.width ?? null,
      height: input.height ?? null,
      originalFilename: input.original_filename ?? null,
      tags: [],
      createdById: actorId,
      updatedById: actorId,
    },
  })
  return toAdminView(asset, false) // alt_present=false until alt added (FR-MEDIA-002)
}

export async function listAssets(filters: ListFiltersInput = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))
  const where: Prisma.MediaAssetWhereInput = {}
  if (!filters.includeDeleted) where.deletedAt = null
  if (filters.resourceType) where.resourceType = filters.resourceType
  if (filters.format) where.format = filters.format.toLowerCase()
  if (filters.tag) where.tags = { has: filters.tag.toLowerCase() }
  if (filters.q) {
    where.OR = [
      { originalFilename: { contains: filters.q, mode: 'insensitive' } },
      { title: { contains: filters.q, mode: 'insensitive' } },
      { altText: { contains: filters.q, mode: 'insensitive' } },
      { tags: { has: filters.q.toLowerCase() } },
    ]
  }

  const [rows, total] = await Promise.all([
    db.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    db.mediaAsset.count({ where }),
  ])

  if (filters.inUse === undefined) {
    return { data: rows.map((r) => toAdminView(r, false)), meta: { page, pageSize, total } }
  }
  // in_use filter: compute usage per row and filter the page (approximate vs total
  // — exact once content modules contribute references in media-be-3).
  const withUsage = await Promise.all(rows.map(async (r) => ({ r, inUse: (await computeAssetUsage(r.id)).length > 0 })))
  const data = withUsage.filter((x) => x.inUse === filters.inUse).map((x) => toAdminView(x.r, x.inUse))
  return { data, meta: { page, pageSize, total } }
}

export async function getAsset(id: string) {
  const asset = await db.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw new NotFoundError('Asset not found')
  const usage = await computeAssetUsage(id)
  return { ...toAdminView(asset, usage.length > 0), usage }
}

export async function updateAssetMetadata(
  actorId: string | null,
  id: string,
  input: { altText?: string | null; title?: string | null; tags?: string[] },
) {
  const asset = await db.mediaAsset.findFirst({ where: { id, deletedAt: null } })
  if (!asset) throw new NotFoundError('Asset not found')

  const data: Prisma.MediaAssetUncheckedUpdateInput = { updatedById: actorId }
  if (input.altText !== undefined) data.altText = input.altText
  if (input.title !== undefined) data.title = input.title
  if (input.tags !== undefined) data.tags = normalizeTags(input.tags)

  const updated = await db.mediaAsset.update({ where: { id }, data })
  return toAdminView(updated, false)
}

/** Replace the underlying file, keeping the MediaAsset id so references resolve (FR-MEDIA-012, BR-5). */
export async function replaceAsset(actorId: string | null, id: string, input: RegisterInput) {
  const asset = await db.mediaAsset.findFirst({ where: { id, deletedAt: null } })
  if (!asset) throw new NotFoundError('Asset not found')
  validateUploadType(input.resource_type, input.format, input.bytes)

  const updated = await db.mediaAsset.update({
    where: { id },
    data: {
      publicId: input.public_id,
      url: input.url,
      format: input.format.toLowerCase(),
      bytes: input.bytes,
      width: input.width ?? null,
      height: input.height ?? null,
      updatedById: actorId,
    },
  })
  // The previous Cloudinary object (asset.publicId) is scheduled for cleanup by the
  // media-be-3 cleanup job; the id is unchanged so existing references still resolve.
  return toAdminView(updated, false)
}

export async function softDeleteAsset(actorId: string | null, id: string): Promise<void> {
  const asset = await db.mediaAsset.findFirst({ where: { id, deletedAt: null } })
  if (!asset) throw new NotFoundError('Asset not found')
  await db.mediaAsset.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId } })
}

export async function restoreAsset(actorId: string | null, id: string) {
  const asset = await db.mediaAsset.findFirst({ where: { id, deletedAt: { not: null } } })
  if (!asset) throw new NotFoundError('Soft-deleted asset not found')
  const updated = await db.mediaAsset.update({ where: { id }, data: { deletedAt: null, updatedById: actorId } })
  return toAdminView(updated, false)
}

/** Hard-delete only when unreferenced (FR-MEDIA-015/017); else 409 AssetInUse. */
export async function hardDeleteAsset(_actorId: string | null, id: string): Promise<void> {
  const asset = await db.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw new NotFoundError('Asset not found')
  const usage = await computeAssetUsage(id)
  if (usage.length > 0) throw new AssetInUseError(usage)
  await db.mediaAsset.delete({ where: { id } })
  // The Cloudinary object removal is handled by the cleanup job (media-be-3).
}

// ── MediaRef resolution & reference integrity (media-be-3) ─────────────────
// The consumer-facing integration surface: a shared MediaRef serializer other
// modules import, batch resolve, on-demand reference usage, and a cleanup job.

export type MediaRef =
  | { id: string; url: string; alt: string | null; width: number | null; height: number | null }
  | { id: string; url: string; format: string; original_filename: string | null; bytes: number | null }
  | { id: string; withdrawn: true }

/**
 * The denormalized, read-only MediaRef a consumer embeds (FR-MEDIA-018). Images carry
 * dimensions + alt; documents carry filename/format/bytes; a soft-deleted asset
 * resolves to a `withdrawn` marker so consumers render the missing state (BR-4).
 * Imported directly (server-side) by consumer modules — no auth guard.
 */
export function mediaRefOf(asset: MediaAsset): MediaRef {
  if (asset.deletedAt) return { id: asset.id, withdrawn: true }
  if (asset.resourceType === 'image') {
    return { id: asset.id, url: asset.url, alt: asset.altText, width: asset.width, height: asset.height }
  }
  return { id: asset.id, url: asset.url, format: asset.format, original_filename: asset.originalFilename, bytes: asset.bytes }
}

/**
 * Batch-resolve asset ids to MediaRefs (FR-MEDIA-019), order-preserving and
 * de-duplicated at the DB. Unknown or soft-deleted ids resolve to `{ withdrawn }`
 * (edge 4). At most 100 ids per call (§15).
 */
export async function resolveMediaRefs(ids: string[]): Promise<MediaRef[]> {
  if (ids.length > 100) throw new ValidationError('At most 100 ids per resolve', [{ field: 'ids', max: 100 }])
  const unique = [...new Set(ids)]
  const assets = await db.mediaAsset.findMany({ where: { id: { in: unique } } }) // incl. soft-deleted → withdrawn marker
  const byId = new Map(assets.map((a) => [a.id, a]))
  return ids.map((id) => {
    const a = byId.get(id)
    return a ? mediaRefOf(a) : { id, withdrawn: true as const }
  })
}

export async function getAssetUsage(id: string): Promise<{ asset_id: string; references: UsageRef[] }> {
  const asset = await db.mediaAsset.findUnique({ where: { id }, select: { id: true } })
  if (!asset) throw new NotFoundError('Asset not found')
  return { asset_id: id, references: await computeAssetUsage(id) }
}

/**
 * Reap abandoned signed uploads and replaced-file leftovers on Cloudinary (edge 1/5).
 * No-op until the Cloudinary Admin API + orphan tracking are wired and `CLOUDINARY_*`
 * is provisioned (integration tested later); never touches referenced assets.
 */
export async function runMediaCleanup(): Promise<{ reaped: number; note: string }> {
  return { reaped: 0, note: 'no-op until Cloudinary admin API + orphan tracking are wired (deferred)' }
}
