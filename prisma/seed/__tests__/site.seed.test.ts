import { describe, it, expect, beforeAll } from 'vitest'
import { db } from '@/lib/db'
import { seedSite, termSlug } from '../site.seed'

const hasDb = !!process.env.DATABASE_URL

// ── Pure slug helper (no DB) ──────────────────────────────────────────────

describe('termSlug', () => {
  it('lowercases and hyphenates, collapsing non-alphanumerics', () => {
    expect(termSlug('Bridge Works')).toBe('bridge-works')
    expect(termSlug('Trade & Licensing')).toBe('trade-licensing')
    expect(termSlug('Dhaka')).toBe('dhaka')
    expect(termSlug('CSR Activity')).toBe('csr-activity')
  })
})

// ── Seed integration ──────────────────────────────────────────────────────

describe.skipIf(!hasDb)('seedSite (integration)', () => {
  // Re-seed over the already-seeded DB; exact counts below prove idempotency.
  // Generous timeout — the remote pooler makes the ~45 sequential upserts slow.
  beforeAll(async () => {
    await seedSite(db)
  }, 60000)

  it('keeps the company profile a singleton with its socials', async () => {
    expect(await db.companyProfile.count()).toBe(1)

    const profile = await db.companyProfile.findFirst({ include: { socialLinks: true } })
    expect(profile!.name).toBe('Zakir Enterprise')
    expect(profile!.establishmentYear).toBe(2010)
    expect(profile!.email).toBe('zakirenterprise307@gmail.com')
    expect(profile!.socialLinks).toHaveLength(4)
    expect(profile!.socialLinks.map((s) => s.platform).sort()).toEqual(['facebook', 'instagram', 'linkedin', 'youtube'])
  })

  it('seeds authored KPI stats keyed by key', async () => {
    const team = await db.companyStat.findUnique({ where: { key: 'team_size' } })
    expect(team).toMatchObject({ value: '250', unit: '+' })
    expect(await db.companyStat.count()).toBe(3)
  })

  it('seeds the four brand slots; og_default reuses the primary logo with alt text', async () => {
    const slots = await db.brandAsset.findMany()
    expect(slots.map((s) => s.key).sort()).toEqual(['favicon', 'logo_footer', 'logo_primary', 'og_default'])

    const primary = slots.find((s) => s.key === 'logo_primary')!
    const og = slots.find((s) => s.key === 'og_default')!
    expect(og.mediaId).toBe(primary.mediaId)

    const primaryMedia = await db.mediaAsset.findUnique({ where: { id: primary.mediaId } })
    expect(primaryMedia!.publicId).toBe('Heading_28_nm42pj')
    expect(primaryMedia!.altText).toBe('Zakir Enterprise logo')
  })

  it('seeds the five vocabularies with ordered terms', async () => {
    expect(await db.taxonomy.count()).toBe(5)

    const location = await db.taxonomy.findUnique({ where: { slug: 'location' } })
    expect(location!.isShared).toBe(true)

    const projects = await db.taxonomy.findUnique({
      where: { slug: 'projects-category' },
      include: { terms: { orderBy: { position: 'asc' } } },
    })
    expect(projects!.isShared).toBe(false)
    expect(projects!.terms).toHaveLength(6)
    expect(projects!.terms[0]).toMatchObject({ slug: 'building-construction', position: 0 })

    const news = await db.taxonomy.findUnique({ where: { slug: 'news-category' }, include: { terms: true } })
    expect(news!.terms).toHaveLength(7)
  })

  it('seeds the three public max_* settings', async () => {
    const cap = await db.settingValue.findUnique({ where: { key: 'max_featured_projects' } })
    expect(cap).toMatchObject({ type: 'int', value: '3', isPublic: true })
    expect(await db.settingValue.count({ where: { isPublic: true } })).toBeGreaterThanOrEqual(3)
  })
})
