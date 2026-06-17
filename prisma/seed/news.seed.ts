import type { PrismaClient, Prisma } from '@prisma/client'
import { NEWS_DATA, getNewsBody, type NewsBodyBlock } from '../../src/data/news-data'
import { parseCloudinaryUrl } from './media.seed'
import { termSlug } from './site.seed'
import { parseReadTime } from './blog.seed'

// One-time import of the News Corner (`src/data/news-data.ts`, 12 stories) into the
// News collection (news-be-1). The flat legacy body (`getNewsBody`: authored where
// present, generated placeholder otherwise) is transformed into the stored JSONB
// flat block document (§8.2): block `type`→`kind`, callout `stats` `lbl`→`label`,
// `image` blocks resolved to a MediaAsset `media_id` (non-Cloudinary stock dropped).
// `category` maps to the SITE news-category vocab. The legacy per-detail gallery was
// a static placeholder, so stories import with an empty gallery (re-author later).
// Idempotent (keyed on slug).

async function ensureMedia(db: PrismaClient, rawUrl: string, actorId: string | null): Promise<string | null> {
  const url = rawUrl.trim()
  const parsed = parseCloudinaryUrl(url)
  if (!parsed) return null
  const existing = await db.mediaAsset.findFirst({ where: { publicId: parsed.publicId }, select: { id: true } })
  if (existing) return existing.id
  const filename = parsed.publicId.split('/').pop() ?? parsed.publicId
  const created = await db.mediaAsset.create({
    data: { resourceType: 'image', provider: 'cloudinary', publicId: parsed.publicId, url, format: parsed.format, originalFilename: `${filename}.${parsed.format}`, tags: ['news'], createdById: actorId, updatedById: actorId },
  })
  return created.id
}

async function transformBlock(db: PrismaClient, b: NewsBodyBlock, actorId: string | null): Promise<Prisma.JsonObject | null> {
  switch (b.type) {
    case 'h2':
    case 'h3':
      return { kind: b.type, text: b.text }
    case 'p':
      return { kind: 'p', text: b.text }
    case 'ul':
      return { kind: 'ul', items: b.items }
    case 'quote':
      return { kind: 'quote', text: b.text, ...(b.cite ? { cite: b.cite } : {}) }
    case 'callout':
      return { kind: 'callout', items: b.stats.map((s) => ({ big: s.big, label: s.lbl })) }
    case 'image': {
      const mediaId = await ensureMedia(db, b.src, actorId)
      if (!mediaId) return null
      return { kind: 'img', media_id: mediaId, ...(b.cap ? { caption: b.cap } : {}) }
    }
  }
}

export async function seedNews(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  const catTax = await db.taxonomy.findUnique({ where: { slug: 'news-category' }, include: { terms: { select: { slug: true, id: true } } } })
  const catBySlug = new Map((catTax?.terms ?? []).map((t) => [t.slug, t.id]))

  const warnings: string[] = []
  let created = 0
  let skipped = 0

  for (const story of NEWS_DATA) {
    const existing = await db.newsStory.findUnique({ where: { slug: story.id }, select: { id: true } })
    if (existing) {
      skipped++
      continue
    }

    const catSlug = termSlug(story.category)
    const categoryId = catBySlug.get(catSlug) ?? null
    if (!categoryId) warnings.push(`${story.id}: category "${story.category}" (→ ${catSlug}) not in news-category vocab → left null`)

    const coverImageId = await ensureMedia(db, story.image, actorId)
    if (!coverImageId) warnings.push(`${story.id}: cover is not a Cloudinary URL → left null (re-author)`)

    const fullBody = getNewsBody(story)
    const blocks = []
    for (const b of fullBody.sections) {
      const tb = await transformBlock(db, b, actorId)
      if (tb) blocks.push(tb)
    }

    await db.newsStory.create({
      data: {
        status: 'published',
        publishedAt: new Date(),
        legacyId: story.id,
        slug: story.id,
        title: story.title,
        excerpt: story.excerpt,
        coverImageId,
        categoryId,
        tags: fullBody.tags,
        articleDate: new Date(story.dateISO),
        readTimeMinutes: parseReadTime(story.readTime),
        featured: story.featured ?? false,
        bodyLead: fullBody.lead,
        body: { blocks } as Prisma.InputJsonValue,
        createdById: actorId,
        updatedById: actorId,
      },
    })
    created++
  }

  if (warnings.length > 0) {
    console.log(`News seed: ${warnings.length} mapping note(s):`)
    for (const w of warnings) console.log(`  - ${w}`)
  }
  console.log(`News seed: ${created} imported, ${skipped} already present (${NEWS_DATA.length} in source). Idempotent.`)
}
