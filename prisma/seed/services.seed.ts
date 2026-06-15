import type { PrismaClient } from '@prisma/client'
import { SERVICES } from '../../src/data/services-data'
import { parseCloudinaryUrl } from './media.seed'

// One-time import of the hard-coded service catalog (`src/data/services-data.ts`,
// 11 services) into the Services collection (services-be-1). Services are already
// slug-addressed (no legacy_id remap); `position` is the array order. Hero/machine/
// cta images become MediaAsset refs — non-Cloudinary stock URLs (the shared CTA
// image, a few machine images) resolve to null so the CTA falls back to the SITE
// default (FR-SVC-016). Empty FAQ rows in the source are dropped (BR-7). Idempotent:
// keyed on `slug`, a re-run skips services already imported.

/** Ensure a MediaAsset for a Cloudinary image URL; null (logged) for non-Cloudinary. */
async function ensureMedia(db: PrismaClient, rawUrl: string, actorId: string | null): Promise<string | null> {
  const url = rawUrl.trim()
  const parsed = parseCloudinaryUrl(url)
  if (!parsed) return null
  const existing = await db.mediaAsset.findFirst({ where: { publicId: parsed.publicId }, select: { id: true } })
  if (existing) return existing.id
  const filename = parsed.publicId.split('/').pop() ?? parsed.publicId
  const created = await db.mediaAsset.create({
    data: {
      resourceType: 'image',
      provider: 'cloudinary',
      publicId: parsed.publicId,
      url,
      format: parsed.format,
      originalFilename: `${filename}.${parsed.format}`,
      tags: ['services'],
      createdById: actorId,
      updatedById: actorId,
    },
  })
  return created.id
}

export async function seedServices(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  const warnings: string[] = []
  let created = 0
  let skipped = 0

  for (const [index, s] of SERVICES.entries()) {
    const existing = await db.service.findUnique({ where: { slug: s.slug }, select: { id: true } })
    if (existing) {
      skipped++
      continue
    }

    const heroImageId = await ensureMedia(db, s.heroImage, actorId)
    if (!heroImageId) warnings.push(`${s.slug}: hero image is not a Cloudinary URL → left null`)
    const machineImageId = await ensureMedia(db, s.machineImage, actorId)
    const ctaImageId = await ensureMedia(db, s.ctaImage, actorId) // shared Unsplash CTA → null (SITE default)

    const faq = s.faq.filter((f) => f.q.trim() || f.a.trim())

    await db.service.create({
      data: {
        status: 'published',
        publishedAt: new Date(),
        slug: s.slug,
        title: s.title,
        subtitle: s.subtitle,
        icon: s.icon,
        position: index,
        heroImageId,
        machineImageId,
        ctaImageId,
        overviewTitle: s.overview.title,
        overviewLead: s.overview.lead,
        overviewBody: s.overview.body,
        overviewBullets: s.overview.bullets,
        scopeTitle: s.scopeTitle,
        scopeLead: s.scopeLead,
        processTitle: s.processTitle,
        processLead: s.processLead,
        benefitsTitle: s.benefitsTitle,
        benefitsLead: s.benefitsLead,
        capabilityTitle: s.capabilityTitle,
        capabilityLead: s.capabilityLead,
        capabilityBodyTitle: s.capabilityBodyTitle,
        capabilityBodyDesc: s.capabilityBodyDesc,
        faqTitle: s.faqTitle,
        faqLead: s.faqLead,
        createdById: actorId,
        updatedById: actorId,
        meta: { create: s.meta.map((m, i) => ({ key: m.k, value: m.v, position: i })) },
        scope: { create: s.scope.map((sc, i) => ({ icon: sc.icon, title: sc.title.trim(), body: sc.body || null, position: i })) },
        process: { create: s.process.map((p, i) => ({ tag: p.tag, title: p.title.trim(), body: p.body || null, position: i })) },
        benefits: { create: s.benefits.map((b, i) => ({ icon: b.icon, title: b.title, body: b.body || null, position: i })) },
        machine: { create: s.machine.map((mc, i) => ({ title: mc.t, description: mc.d || null, position: i })) },
        faq: { create: faq.map((f, i) => ({ question: f.q.trim(), answer: f.a || null, position: i })) },
      },
    })
    created++
  }

  if (warnings.length > 0) {
    console.log(`Services seed: ${warnings.length} media note(s):`)
    for (const w of warnings) console.log(`  - ${w}`)
  }
  console.log(`Services seed: ${created} imported, ${skipped} already present (${SERVICES.length} in source). Idempotent.`)
}
