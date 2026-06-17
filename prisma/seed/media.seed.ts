import type { PrismaClient, Prisma } from '@prisma/client'

// Front-end data modules whose hard-coded image URLs we import as MediaAsset rows
// (media-be-1, SRS media §11/§16). Plain data modules — safe to import here.
import * as projectsData from '../../src/data/projects-data'
import * as servicesData from '../../src/data/services-data'
import * as blogData from '../../src/data/blog-data'
import * as certData from '../../src/data/certifications'
import * as brandData from '../../src/data/brand-assets'
import * as siteData from '../../src/data/site-data'

const SOURCES: { tag: string; ns: Record<string, unknown> }[] = [
  { tag: 'projects', ns: projectsData },
  { tag: 'services', ns: servicesData },
  { tag: 'blog', ns: blogData },
  { tag: 'certifications', ns: certData },
  { tag: 'brand', ns: brandData },
  { tag: 'site', ns: siteData },
]

const CLOUDINARY_IMAGE = '/image/upload/'
const NON_CLOUDINARY_IMAGE = /(images\.unsplash\.com|\.(?:jpe?g|png|webp|gif|svg)(?:\?|$))/i

function isCloudinaryImage(s: string): boolean {
  return s.startsWith('https://res.cloudinary.com/') && s.includes(CLOUDINARY_IMAGE)
}

/** Recursively collect every string in a value into `out`. */
function walk(value: unknown, visit: (s: string) => void): void {
  if (typeof value === 'string') return visit(value)
  if (Array.isArray(value)) {
    for (const v of value) walk(v, visit)
    return
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) walk(v, visit)
  }
}

/**
 * Parse a Cloudinary delivery URL into its `public_id` + `format`, stripping any
 * transform segments (`q_auto/f_auto/…`) and the `v<version>` segment. Returns
 * null if the URL doesn't look like a Cloudinary upload URL.
 */
export function parseCloudinaryUrl(url: string): { publicId: string; format: string } | null {
  const withVersion = url.match(/\/image\/upload\/(?:.*?\/)?v\d+\/(.+)\.([a-z0-9]+)(?:\?.*)?$/i)
  if (withVersion) return { publicId: withVersion[1], format: withVersion[2].toLowerCase() }
  const noVersion = url.match(/\/image\/upload\/(?:.*?\/)?([^/]+)\.([a-z0-9]+)(?:\?.*)?$/i)
  if (noVersion) return { publicId: noVersion[1], format: noVersion[2].toLowerCase() }
  return null
}

interface ParsedAsset {
  publicId: string
  url: string
  format: string
  tags: Set<string>
}

/**
 * Idempotent seed of the MediaAsset library from the image URLs currently
 * hard-coded across the front-end (media-be-1).
 *
 * Only Cloudinary URLs are imported: `MediaProvider` is Cloudinary-only in v1
 * (SRS §8.3/§16), so the non-Cloudinary stock placeholders (Unsplash) have no
 * valid provider and are intentionally skipped (count logged) — editors replace
 * them with uploaded assets over time. No document URLs are hard-coded yet, so
 * every seeded row is `resource_type=image`. `alt_text`/`bytes`/dimensions are
 * left null for editors / a later re-register to backfill.
 *
 * Keyed on `public_id`: re-running inserts only assets not already present.
 */
export async function seedMedia(db: PrismaClient): Promise<void> {
  const byPublicId = new Map<string, ParsedAsset>()
  const firstUrlByPublicId = new Map<string, string>()
  const skippedNonCloudinary = new Set<string>()
  let unparsed = 0

  for (const { tag, ns } of SOURCES) {
    walk(Object.values(ns), (s) => {
      if (isCloudinaryImage(s)) {
        const parsed = parseCloudinaryUrl(s)
        if (!parsed) {
          unparsed++
          return
        }
        const existing = byPublicId.get(parsed.publicId)
        if (existing) {
          existing.tags.add(tag)
        } else {
          byPublicId.set(parsed.publicId, { ...parsed, url: s, tags: new Set([tag]) })
          firstUrlByPublicId.set(parsed.publicId, s)
        }
      } else if (s.startsWith('http') && NON_CLOUDINARY_IMAGE.test(s)) {
        skippedNonCloudinary.add(s)
      }
    })
  }

  if (byPublicId.size === 0) {
    console.log('Media seed: no Cloudinary image URLs found in front-end data — nothing to import.')
    return
  }

  // Attribute seeded assets to the bootstrap admin when present (System otherwise).
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  const publicIds = [...byPublicId.keys()]
  const existingRows = await db.mediaAsset.findMany({
    where: { publicId: { in: publicIds } },
    select: { publicId: true },
  })
  const existing = new Set(existingRows.map((r) => r.publicId))

  const toCreate: Prisma.MediaAssetCreateManyInput[] = []
  for (const [publicId, asset] of byPublicId) {
    if (existing.has(publicId)) continue
    const filename = publicId.split('/').pop() ?? publicId
    toCreate.push({
      resourceType: 'image',
      provider: 'cloudinary',
      publicId,
      url: asset.url,
      format: asset.format,
      altText: null,
      title: null,
      originalFilename: `${filename}.${asset.format}`,
      tags: [...asset.tags].sort(),
      createdById: actorId,
      updatedById: actorId,
    })
  }

  if (toCreate.length > 0) {
    await db.mediaAsset.createMany({ data: toCreate })
  }

  console.log(
    `Media seed: ${toCreate.length} new MediaAsset rows ` +
      `(${existing.size} already present, ${byPublicId.size} distinct Cloudinary images). ` +
      `Skipped ${skippedNonCloudinary.size} non-Cloudinary stock URLs (no v1 provider)` +
      (unparsed ? `, ${unparsed} unparsable Cloudinary URLs.` : '.'),
  )
}
