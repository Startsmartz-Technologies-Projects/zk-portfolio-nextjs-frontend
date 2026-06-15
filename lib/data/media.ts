import { db } from '@/lib/db'
import { Prisma, type MediaAsset, type ResourceType } from '@prisma/client'
import { AppError, NotFoundError } from '@/lib/errors'
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
 * Reference usage across consuming modules (FR-MEDIA-014). On-demand FK lookups —
 * media-be-3 enriches this as content modules land; **no consumer tables exist yet**,
 * so it is empty (every asset is currently deletable).
 */
export async function computeAssetUsage(_assetId: string): Promise<UsageRef[]> {
  return []
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
