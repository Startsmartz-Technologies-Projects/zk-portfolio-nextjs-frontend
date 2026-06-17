import { describe, it, expect, afterAll } from 'vitest'
import { db } from '@/lib/db'
import {
  buildRobots,
  getPublicSeoDefaults,
  getPublicRobots,
  getPublicSitemap,
  resolveOgMediaRef,
  resolveRedirect,
  getActiveRedirects,
  createRedirect,
  OG_PLACEHOLDER_PATH,
} from '@/lib/data/seo'

const hasDb = !!process.env.DATABASE_URL
const TAG = `/zzpub-${Math.floor(Math.random() * 1e9)}-`

// ── Pure robots policy (no DB) ────────────────────────────────────────────

describe('buildRobots', () => {
  it('allows all under index_follow and disallows all under staging', () => {
    expect(buildRobots('index_follow', 'https://x.com')).toMatchObject({
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://x.com/sitemap.xml',
      discourageIndexing: false,
    })
    expect(buildRobots('noindex_nofollow', 'https://x.com/')).toMatchObject({
      rules: [{ userAgent: '*', disallow: '/' }],
      discourageIndexing: true,
    })
  })
})

describe.skipIf(!hasDb)('seo public reads (integration)', () => {
  afterAll(async () => {
    await db.redirect.deleteMany({ where: { fromPath: { startsWith: TAG } } })
    await db.$disconnect()
  })

  it('returns the SEO defaults bundle with Organization + enabled types', async () => {
    const d = await getPublicSeoDefaults()
    expect(d.site_title_template).toContain('%s')
    expect(d.metadata_base).toMatch(/^https?:\/\//)
    expect(d.enabled_jsonld_types.length).toBeGreaterThan(0)
    expect(d.organization).toMatchObject({ '@type': 'Organization', name: 'Zakir Enterprise' })
    expect(d.default_og_image).not.toBeNull()
  })

  it('falls back to a placeholder when the default OG asset is missing (edge 7)', async () => {
    expect(await resolveOgMediaRef(null)).toBeNull()
    expect(await resolveOgMediaRef('00000000-0000-0000-0000-000000000000')).toBeNull()
    // getPublicSeoDefaults turns a null ref into a placeholder URL.
    const d = await getPublicSeoDefaults()
    if (d.default_og_image?.id === null) {
      expect(d.default_og_image.url).toContain(OG_PLACEHOLDER_PATH)
    }
  })

  it('builds robots from the current settings', async () => {
    const r = await getPublicRobots()
    expect(r.sitemap).toMatch(/sitemap\.xml$/)
    expect(typeof r.discourageIndexing).toBe('boolean')
  })

  it('aggregates published content URLs (projects) into the sitemap', async () => {
    const entries = await getPublicSitemap()
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.every((e) => typeof e.loc === 'string' && typeof e.lastmod === 'string')).toBe(true)
    expect(entries.some((e) => e.loc.startsWith('/projects/'))).toBe(true)
  })

  it('resolves a redirect (hit + miss) and lists active redirects', async () => {
    await createRedirect(null, { fromPath: `${TAG}old`, toPath: `${TAG}new`, source: 'manual' })

    expect(await resolveRedirect(`${TAG}old`)).toEqual({ match: true, toPath: `${TAG}new`, status: 301 })
    expect(await resolveRedirect(`${TAG}missing`)).toEqual({ match: false })

    const active = await getActiveRedirects()
    expect(active.some((r) => r.fromPath === `${TAG}old` && r.status === 301)).toBe(true)
    // The seeded legacy redirect is active too.
    expect(active.some((r) => r.fromPath === '/service-details.html')).toBe(true)
  })

  it('does not resolve a deactivated redirect', async () => {
    const r = await createRedirect(null, { fromPath: `${TAG}inactive`, toPath: `${TAG}t`, source: 'manual' })
    await db.redirect.update({ where: { id: r.id }, data: { isActive: false } })
    expect(await resolveRedirect(`${TAG}inactive`)).toEqual({ match: false })
  })
})
