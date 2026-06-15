import { describe, it, expect, beforeAll } from 'vitest'
import { db } from '@/lib/db'
import { seedSeo } from '../seo.seed'

const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('seedSeo (integration)', () => {
  // Re-seed over the already-seeded DB; the singleton count proves idempotency.
  beforeAll(async () => {
    await seedSeo(db)
  }, 30000)

  it('seeds the SeoSettings singleton with defaults, OG ← SITE og_default', async () => {
    expect(await db.seoSettings.count()).toBe(1)

    const settings = await db.seoSettings.findFirst()
    expect(settings!.siteTitleTemplate).toContain('%s')
    expect(settings!.metadataBase).toMatch(/^https?:\/\//)
    expect(settings!.defaultRobots).toBe('index_follow')

    const ogDefault = await db.brandAsset.findUnique({ where: { key: 'og_default' } })
    expect(settings!.defaultOgImageId).toBe(ogDefault!.mediaId)
  })

  it('seeds the legacy .html redirect as a system 301', async () => {
    const redirect = await db.redirect.findUnique({ where: { fromPath: '/service-details.html' } })
    expect(redirect).not.toBeNull()
    expect(redirect!.toPath).toBe('/services')
    expect(redirect!.status).toBe('permanent') // mapped to DB '301'
    expect(redirect!.source).toBe('system')
    expect(redirect!.isActive).toBe(true)
  })
})
