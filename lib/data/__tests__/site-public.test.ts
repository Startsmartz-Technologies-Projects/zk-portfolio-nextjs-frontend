import { describe, it, expect, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { NotFoundError } from '@/lib/errors'
import { getSiteBundle, getPublicTaxonomies, getPublicTermList, getPublicCompanyStats } from '@/lib/data/site'

const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('site public reads (integration)', () => {
  afterAll(async () => {
    await db.$disconnect()
  })

  it('returns the site bundle with only public settings and establishment_year', async () => {
    const bundle = await getSiteBundle()
    expect(bundle.company?.establishment_year).toBe(2010)
    // Only is_public settings appear; all seeded max_* are public.
    expect(bundle.settings.max_featured_projects).toBe(3) // decoded int (number, not "3")
    expect(typeof bundle.settings.max_featured_projects).toBe('number')
    // No admin-only/secret keys leak: every key present must be an is_public setting.
    const publicKeys = (await db.settingValue.findMany({ where: { isPublic: true }, select: { key: true } })).map((s) => s.key)
    expect(Object.keys(bundle.settings).sort()).toEqual(publicKeys.sort())
    // Brand slots resolved as MediaRef.
    expect(bundle.brand.logo_primary?.url).toContain('res.cloudinary.com')
    expect(bundle.socials.length).toBeGreaterThanOrEqual(4)
    // The company object never carries a password/secret-shaped field.
    expect((bundle.company as Record<string, unknown>).passwordHash).toBeUndefined()
  })

  it('lists vocabularies and returns an ordered active TermRef list', async () => {
    const vocabs = await getPublicTaxonomies()
    expect(vocabs.find((v) => v.slug === 'location')?.isShared).toBe(true)

    const terms = await getPublicTermList('projects-category')
    expect(terms.length).toBeGreaterThanOrEqual(6)
    expect(terms[0]).toMatchObject({ slug: 'building-construction' })
    expect(terms[0]).toHaveProperty('label')
    expect(terms[0]).not.toHaveProperty('isActive') // TermRef projection only
  })

  it('404s an unknown vocabulary', async () => {
    await expect(getPublicTermList('no-such-vocab')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('returns authored company stats in order (no derived metrics)', async () => {
    const stats = await getPublicCompanyStats()
    expect(stats.map((s) => s.key)).toContain('team_size')
    // derived metrics are never stored as stats
    expect(stats.map((s) => s.key)).not.toContain('years_experience')
  })
})
