import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ValidationError } from '@/lib/errors'
import { RedirectConflictError } from '@/lib/seo/redirects'
import {
  updateSeoSettings,
  createRedirect,
  recordRedirect,
  listRedirects,
  getJsonldConfig,
  updateJsonldTypes,
  getSitemapPreview,
} from '@/lib/data/seo'

const hasDb = !!process.env.DATABASE_URL
const TAG = `/zz-${Math.floor(Math.random() * 1e9)}-`

describe.skipIf(!hasDb)('seo admin data layer (integration)', () => {
  afterAll(async () => {
    await db.redirect.deleteMany({ where: { OR: [{ fromPath: { startsWith: TAG } }, { toPath: { startsWith: TAG } }] } })
    await db.$disconnect()
  })

  it('rejects a default_og_image that does not exist (422)', async () => {
    await expect(
      updateSeoSettings(null, { defaultOgImageId: '00000000-0000-0000-0000-000000000000' }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('creates a manual redirect and rejects a duplicate from_path (409)', async () => {
    const r = await createRedirect(null, { fromPath: `${TAG}a`, toPath: `${TAG}dest`, source: 'manual' })
    expect(r.source).toBe('manual')
    expect(r.status).toBe('permanent')
    await expect(createRedirect(null, { fromPath: `${TAG}a`, toPath: `${TAG}other`, source: 'manual' })).rejects.toBeInstanceOf(
      RedirectConflictError,
    )
  })

  it('rejects a loop', async () => {
    await createRedirect(null, { fromPath: `${TAG}loop1`, toPath: `${TAG}loop2`, source: 'system' })
    await expect(
      createRedirect(null, { fromPath: `${TAG}loop2`, toPath: `${TAG}loop1`, source: 'system' }),
    ).rejects.toBeInstanceOf(RedirectConflictError)
  })

  it('collapses a chain: recording B→C after A→B repoints A→C', async () => {
    await recordRedirect(`${TAG}A`, `${TAG}B`)
    await recordRedirect(`${TAG}B`, `${TAG}C`)
    const a = await db.redirect.findUnique({ where: { fromPath: `${TAG}A` } })
    const b = await db.redirect.findUnique({ where: { fromPath: `${TAG}B` } })
    expect(a!.toPath).toBe(`${TAG}C`) // collapsed, not a served chain
    expect(b!.toPath).toBe(`${TAG}C`)
  })

  it('filters redirects by source', async () => {
    await createRedirect(null, { fromPath: `${TAG}man`, toPath: `${TAG}x`, source: 'manual' })
    const system = await listRedirects({ source: 'system' })
    const manual = await listRedirects({ source: 'manual' })
    expect(system.every((r) => r.source === 'system')).toBe(true)
    expect(manual.some((r) => r.fromPath === `${TAG}man`)).toBe(true)
  })

  it('returns JSON-LD config with the Organization resolved from SITE', async () => {
    const config = await getJsonldConfig()
    expect(config.enabledTypes.length).toBeGreaterThan(0)
    expect(config.organization).toMatchObject({ '@type': 'Organization', name: 'Zakir Enterprise' })
    // `#` placeholder social URLs are filtered out of sameAs.
    expect((config.organization as { sameAs?: string[] }).sameAs ?? []).not.toContain('#')
  })

  it('toggles enabled JSON-LD types (restored after)', async () => {
    const before = (await db.seoSettings.findFirst())!.jsonldTypes
    await updateJsonldTypes(null, ['Organization'])
    expect((await getJsonldConfig()).enabledTypes).toEqual(['Organization'])
    await updateJsonldTypes(null, before) // restore
  })

  it('sitemap preview reflects published content (projects)', async () => {
    const preview = await getSitemapPreview()
    expect(preview.meta.total).toBeGreaterThan(0)
    expect(preview.data.length).toBeGreaterThan(0)
  })
})
