import type { PrismaClient } from '@prisma/client'
import { CONCERNS, DEFAULT_CONCERN_ID } from '../../src/data/concerns-data'
import { parseCloudinaryUrl } from './media.seed'

// One-time import of the group/sister-company profiles (`src/data/concerns-data.ts`,
// 4 concerns) into the Concerns collection (concerns-be-1). Each CONCERNS key is the
// slug + legacy_id; the `Est. YYYY` label is parsed to `established_year`; the legacy
// `why.big` becomes `number`. The default landing concern is marked `is_default`.
// Hero/showcase/gallery images are Unsplash placeholders → null/empty (re-author).
// Idempotent (keyed on slug).

/** Year from an "Est. 2014" label, or null. */
export function parseEstYear(est: string | undefined): number | null {
  const m = (est ?? '').match(/\b(\d{4})\b/)
  return m ? Number(m[1]) : null
}

async function ensureMedia(db: PrismaClient, rawUrl: string, actorId: string | null): Promise<string | null> {
  const url = (rawUrl ?? '').trim()
  const parsed = parseCloudinaryUrl(url)
  if (!parsed) return null
  const existing = await db.mediaAsset.findFirst({ where: { publicId: parsed.publicId }, select: { id: true } })
  if (existing) return existing.id
  const filename = parsed.publicId.split('/').pop() ?? parsed.publicId
  const created = await db.mediaAsset.create({
    data: { resourceType: 'image', provider: 'cloudinary', publicId: parsed.publicId, url, format: parsed.format, originalFilename: `${filename}.${parsed.format}`, tags: ['concerns'], createdById: actorId, updatedById: actorId },
  })
  return created.id
}

// The legacy concern object shape (from concerns-data) — loosely typed for the import.
interface LegacyConcern {
  name: string
  short: string
  tagline: string
  intro: string
  hero: string
  est: string
  code: string
  overview: { title: string; body: string[]; mission: string }
  facts: { big: string; label: string; sub: string }[]
  services: { icon: string; title: string; copy: string }[]
  why: { big: string; title: string; copy: string }[]
  projects: { title: string; location: string; category: string; summary: string; image: string }[]
  process: { step: string; title: string; copy: string }[]
  gallery: string[]
  faqs: { q: string; a: string }[]
}

export async function seedConcerns(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  const entries = Object.entries(CONCERNS as unknown as Record<string, LegacyConcern>)
  const warnings: string[] = []
  let created = 0
  let skipped = 0

  for (const [index, [slug, c]] of entries.entries()) {
    const existing = await db.concern.findUnique({ where: { slug }, select: { id: true } })
    if (existing) {
      skipped++
      continue
    }

    const heroImageId = await ensureMedia(db, c.hero, actorId)
    if (!heroImageId) warnings.push(`${slug}: hero is not a Cloudinary URL → null (re-author)`)

    // Showcase project images + gallery are Unsplash placeholders → resolve where possible.
    const showcase: { title: string; location: string | null; category: string | null; summary: string | null; imageId: string | null; position: number }[] = []
    for (const [i, p] of c.projects.entries()) {
      showcase.push({ title: p.title, location: p.location || null, category: p.category || null, summary: p.summary || null, imageId: await ensureMedia(db, p.image, actorId), position: i })
    }
    const galleryItems: { mediaId: string; position: number }[] = []
    for (const url of c.gallery) {
      const mediaId = await ensureMedia(db, url, actorId)
      if (mediaId) galleryItems.push({ mediaId, position: galleryItems.length })
    }

    await db.concern.create({
      data: {
        status: 'published',
        publishedAt: new Date(),
        legacyId: slug,
        slug,
        name: c.name,
        short: c.short,
        tagline: c.tagline,
        intro: c.intro,
        establishedYear: parseEstYear(c.est),
        code: c.code,
        heroImageId,
        isDefault: slug === DEFAULT_CONCERN_ID,
        position: index,
        overviewTitle: c.overview.title,
        overviewBody: c.overview.body,
        overviewMission: c.overview.mission,
        createdById: actorId,
        updatedById: actorId,
        facts: { create: c.facts.map((f, i) => ({ big: f.big, label: f.label, sub: f.sub || null, position: i })) },
        services: { create: c.services.map((s, i) => ({ icon: s.icon, title: s.title, copy: s.copy || null, position: i })) },
        why: { create: c.why.map((w, i) => ({ number: w.big, title: w.title, copy: w.copy || null, position: i })) },
        showcase: { create: showcase },
        process: { create: c.process.map((p, i) => ({ step: p.step, title: p.title, copy: p.copy || null, position: i })) },
        gallery: { create: galleryItems },
        faqs: { create: c.faqs.map((f, i) => ({ question: f.q, answer: f.a || null, position: i })) },
      },
    })
    created++
  }

  if (warnings.length > 0) {
    console.log(`Concerns seed: ${warnings.length} media note(s) (hero/showcase/gallery placeholders → re-author).`)
  }
  console.log(`Concerns seed: ${created} imported, ${skipped} already present (${entries.length} in source; default '${DEFAULT_CONCERN_ID}'). Idempotent.`)
}
