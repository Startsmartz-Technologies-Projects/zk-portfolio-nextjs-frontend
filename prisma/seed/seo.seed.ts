import type { PrismaClient } from '@prisma/client'

const SETTINGS = {
  siteTitleTemplate: '%s · Zakir Enterprise',
  defaultMetaDescription:
    'Zakir Enterprise is a Bangladesh-based construction firm delivering government, commercial and private infrastructure with disciplined execution and dependable project management.',
  metadataBase: 'https://zakirenterprise.com',
  defaultRobots: 'index_follow' as const,
}

// Known legacy redirects determinable now (source=system). Project `P0xx` legacy-id
// redirects are deferred to the Projects seed (Wave 3), which assigns the target slugs.
const LEGACY_REDIRECTS = [
  { fromPath: '/service-details.html', toPath: '/services', note: 'legacy .html path (pre-Next static site)' },
]

/**
 * Idempotent seed of the SEO global defaults (seo-be-1). Creates the SeoSettings
 * singleton (create-if-absent — never clobbers admin edits), pointing its default
 * OG image at the SITE `og_default` brand asset when available, and seeds the known
 * legacy `.html` redirects as `system`.
 */
export async function seedSeo(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  // Default OG image ← SITE og_default brand slot (if seeded).
  const ogDefault = await db.brandAsset.findUnique({ where: { key: 'og_default' }, select: { mediaId: true } })

  const existing = await db.seoSettings.findFirst({ select: { id: true } })
  if (!existing) {
    await db.seoSettings.create({
      data: {
        ...SETTINGS,
        defaultOgImageId: ogDefault?.mediaId ?? null,
        createdById: actorId,
        updatedById: actorId,
      },
    })
  }

  for (const redirect of LEGACY_REDIRECTS) {
    await db.redirect.upsert({
      where: { fromPath: redirect.fromPath },
      create: {
        fromPath: redirect.fromPath,
        toPath: redirect.toPath,
        status: 'permanent',
        source: 'system',
        note: redirect.note,
        createdById: actorId,
        updatedById: actorId,
      },
      update: {},
    })
  }

  console.log(
    `SEO seed: settings ${existing ? 'present' : 'created'}` +
      `${ogDefault ? ' (default OG ← SITE og_default)' : ''}, ${LEGACY_REDIRECTS.length} legacy redirect(s) (idempotent).`,
  )
}
