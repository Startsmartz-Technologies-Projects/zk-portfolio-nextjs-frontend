import type { PrismaClient, Prisma } from '@prisma/client'
import { BLOG_DATA, getBlogBody, type BlogBlock } from '../../src/data/blog-data'
import { parseCloudinaryUrl } from './media.seed'
import { termSlug } from './site.seed'

// One-time import of the editorial articles (`src/data/blog-data.ts`, 12 articles)
// into the Blog collection (blog-be-1). Each article's structured body comes from
// `getBlogBody` (real where authored, generated placeholder otherwise) and is
// transformed into the stored JSONB block document (§8.2): `stats` `lbl`→`label`,
// `img` blocks resolved to a MediaAsset `media_id` (non-Cloudinary stock images are
// dropped — the legacy bodies/covers are Unsplash placeholders to be re-authored).
// `category` maps to the SITE blog-category vocabulary. Idempotent (keyed on slug).

/** Ensure a MediaAsset for a Cloudinary image URL; null for non-Cloudinary. */
async function ensureMedia(db: PrismaClient, rawUrl: string, actorId: string | null): Promise<string | null> {
  const url = rawUrl.trim()
  const parsed = parseCloudinaryUrl(url)
  if (!parsed) return null
  const existing = await db.mediaAsset.findFirst({ where: { publicId: parsed.publicId }, select: { id: true } })
  if (existing) return existing.id
  const filename = parsed.publicId.split('/').pop() ?? parsed.publicId
  const created = await db.mediaAsset.create({
    data: { resourceType: 'image', provider: 'cloudinary', publicId: parsed.publicId, url, format: parsed.format, originalFilename: `${filename}.${parsed.format}`, tags: ['blog'], createdById: actorId, updatedById: actorId },
  })
  return created.id
}

/** Minutes from a "N min read" label, or null. */
export function parseReadTime(label: string): number | null {
  const m = label.match(/(\d+)/)
  return m ? Number(m[1]) : null
}

/** Transform a front-end block into the stored shape; `img` needs a resolved media id. */
async function transformBlock(db: PrismaClient, b: BlogBlock, actorId: string | null): Promise<Prisma.JsonObject | null> {
  switch (b.kind) {
    case 'p':
      return { kind: 'p', text: b.text }
    case 'h3':
      return { kind: 'h3', heading: b.heading }
    case 'ul':
      return { kind: 'ul', items: b.items }
    case 'quote':
      return { kind: 'quote', text: b.text, ...(b.cite ? { cite: b.cite } : {}) }
    case 'stats':
      return { kind: 'stats', items: b.items.map((i) => ({ big: i.big, label: i.lbl })) }
    case 'img': {
      const mediaId = await ensureMedia(db, b.url, actorId)
      if (!mediaId) return null // non-Cloudinary placeholder → drop the block
      return { kind: 'img', media_id: mediaId, ...(b.cap ? { caption: b.cap } : {}) }
    }
  }
}

export async function seedBlog(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  const catTax = await db.taxonomy.findUnique({ where: { slug: 'blog-category' }, include: { terms: { select: { slug: true, id: true } } } })
  const catBySlug = new Map((catTax?.terms ?? []).map((t) => [t.slug, t.id]))

  const warnings: string[] = []
  let created = 0
  let skipped = 0

  for (const article of BLOG_DATA) {
    const existing = await db.article.findUnique({ where: { slug: article.id }, select: { id: true } })
    if (existing) {
      skipped++
      continue
    }

    const catSlug = termSlug(article.category)
    const categoryId = catBySlug.get(catSlug) ?? null
    if (!categoryId) warnings.push(`${article.id}: category "${article.category}" (→ ${catSlug}) not in blog-category vocab → left null`)

    const coverImageId = await ensureMedia(db, article.image, actorId)
    if (!coverImageId) warnings.push(`${article.id}: cover is not a Cloudinary URL → left null (re-author)`)

    const fullBody = getBlogBody(article)
    const sections = []
    for (const s of fullBody.sections) {
      const blocks = []
      for (const b of s.blocks) {
        const tb = await transformBlock(db, b, actorId)
        if (tb) blocks.push(tb)
      }
      sections.push({ id: s.id, heading: s.heading, level: s.level, blocks })
    }
    const tags = [...new Set([...article.tags, ...fullBody.tags])]

    await db.article.create({
      data: {
        status: 'published',
        publishedAt: new Date(),
        legacyId: article.id,
        slug: article.id,
        title: article.title,
        excerpt: article.excerpt,
        coverImageId,
        categoryId,
        tags,
        authorName: article.author,
        authorRole: article.authorRole,
        articleDate: new Date(article.dateISO),
        readTimeMinutes: parseReadTime(article.readTime),
        featured: article.featured ?? false,
        popularity: article.popularity,
        bodyLead: fullBody.lead,
        body: { sections } as Prisma.InputJsonValue,
        createdById: actorId,
        updatedById: actorId,
      },
    })
    created++
  }

  if (warnings.length > 0) {
    console.log(`Blog seed: ${warnings.length} mapping note(s):`)
    for (const w of warnings) console.log(`  - ${w}`)
  }
  console.log(`Blog seed: ${created} imported, ${skipped} already present (${BLOG_DATA.length} in source). Idempotent.`)
}
