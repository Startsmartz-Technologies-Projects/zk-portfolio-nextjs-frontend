import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { seedPages } from '../pages.seed'
import { PERMITTED_SECTION_TYPES, isSectionTypePermitted, pageKeyToPublic, publicToPageKey } from '@/lib/pages/permitted-section-types'

const hasDb = !!process.env.DATABASE_URL

describe('pages permitted-section-types', () => {
  it('covers all 8 page keys and enforces the per-page set', () => {
    expect(Object.keys(PERMITTED_SECTION_TYPES)).toHaveLength(8)
    expect(isSectionTypePermitted('about', 'timeline')).toBe(true)
    expect(isSectionTypePermitted('home', 'timeline')).toBe(false)
    expect(isSectionTypePermitted('lets_collaborate', 'intent_cards')).toBe(true)
  })
  it('translates between the public hyphenated key and the enum member', () => {
    expect(pageKeyToPublic('lets_collaborate')).toBe('lets-collaborate')
    expect(pageKeyToPublic('projects_index')).toBe('projects-index')
    expect(publicToPageKey('lets-collaborate')).toBe('lets_collaborate')
    expect(publicToPageKey('nope')).toBeNull()
  })
})

describe.skipIf(!hasDb)('seedPages (integration)', () => {
  it('imports exactly the 8 fixed pages idempotently', async () => {
    await seedPages(db)
    expect(await db.page.count()).toBe(8)
    await seedPages(db)
    expect(await db.page.count()).toBe(8)
  }, 60000)

  it('seeds the home composition incl. hidden sections and stat_key items (no stored numbers)', async () => {
    const home = await db.page.findUnique({ where: { key: 'home' }, include: { sections: { orderBy: { position: 'asc' }, include: { items: true } } } })
    expect(home).not.toBeNull()
    expect(home!.status).toBe('published')
    const types = home!.sections.map((s) => s.type)
    expect(types[0]).toBe('hero')
    expect(types).toContain('featured_projects')
    // Coded-but-commented home sections are seeded hidden.
    const hidden = home!.sections.filter((s) => !s.isVisible).map((s) => s.type)
    expect(hidden).toEqual(expect.arrayContaining(['network_strip', 'insights_strip', 'news_strip']))
    // featured strips carry source_key + max_items, no records.
    const fp = home!.sections.find((s) => s.type === 'featured_projects')!
    expect(fp.sourceKey).toBe('projects.featured')
    expect(fp.maxItems).toBe(6)
    // stat items store a stat_key and NO numeric value (BR-3).
    const stat = home!.sections.find((s) => s.type === 'stat_strip')!
    expect(stat.items.length).toBe(4)
    expect(stat.items.every((i) => i.statKey && !i.value)).toBe(true)
  })

  it('seeds About timeline with an active step and hidden team/culture', async () => {
    const about = await db.page.findUnique({ where: { key: 'about' }, include: { sections: { include: { items: true } } } })
    const timeline = about!.sections.find((s) => s.type === 'timeline')!
    expect(timeline.items.some((i) => i.isActive)).toBe(true)
    const hidden = about!.sections.filter((s) => !s.isVisible).map((s) => s.type)
    expect(hidden).toEqual(expect.arrayContaining(['leadership_team', 'culture']))
  })
})
