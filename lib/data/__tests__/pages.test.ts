import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { NotFoundError, ValidationError } from '@/lib/errors'
import {
  listPages,
  getPage,
  updatePage,
  addSection,
  deleteSection,
  collectPublishIssues,
  getPublishedPages,
  getPublishedPage,
} from '@/lib/data/pages'

const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('pages data layer (integration)', () => {
  it('lists the fixed 8 pages with section counts', async () => {
    const list = await listPages()
    expect(list.data).toHaveLength(8)
    expect(list.data.every((p) => typeof p.section_count === 'number')).toBe(true)
    expect(list.data.find((p) => p.key === 'lets-collaborate')).toBeDefined()
  })

  it('gets a page (hyphenated key) with sections incl. hidden + seo; unknown is NotFound', async () => {
    const home = await getPage('home')
    expect(home.key).toBe('home')
    expect(home.sections.some((s) => !s.is_visible)).toBe(true)
    expect(home).toHaveProperty('seo')
    await expect(getPage('does-not-exist')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('rejects a disallowed section type on update and rolls back (no section loss)', async () => {
    const before = (await getPage('home')).sections.length
    await expect(updatePage(null, 'home', { sections: [{ type: 'timeline' }] })).rejects.toBeInstanceOf(ValidationError)
    expect((await getPage('home')).sections.length).toBe(before)
  })

  it('adds a section, flags its missing required chrome at publish, then removes it', async () => {
    const before = (await getPage('home')).sections.length
    const added = await addSection(null, 'home', { type: 'cta_banner' })
    expect(added.sections.length).toBe(before + 1)
    const newSection = added.sections.find((s) => s.type === 'cta_banner' && !s.cta_primary)!
    expect(newSection).toBeDefined()

    // The new empty cta_banner is visible by default → publish gate flags its CTA.
    const issues = await collectPublishIssues('home')
    expect(issues.some((i) => i.section === 'cta_banner' && i.field === 'cta_primary')).toBe(true)

    await deleteSection(null, 'home', newSection.id)
    expect((await getPage('home')).sections.length).toBe(before)
  })

  it('public read drops hidden sections, resolves stat values, and passes through collection source keys', async () => {
    const pub = await getPublishedPage('home')
    expect(pub).not.toBeNull()
    const types = pub!.sections.map((s) => s.type)
    expect(types).not.toContain('network_strip') // hidden
    expect(types).not.toContain('insights_strip')

    const stat = pub!.sections.find((s) => s.type === 'stat_strip') as { items: { stat_key: string; value: string; unit: string; label: string }[] }
    expect(stat.items.length).toBeGreaterThan(0)
    // resolved numbers (years_experience / projects_count / districts_covered / team_size)
    expect(stat.items.every((i) => typeof i.value === 'string' && i.value.length > 0)).toBe(true)

    const fp = pub!.sections.find((s) => s.type === 'featured_projects') as { source_key: string; max_items: number }
    expect(fp.source_key).toBe('projects.featured')
    expect(fp.max_items).toBe(6)

    expect(await getPublishedPage('unknown-key')).toBeNull()
  })

  it('public pages list exposes keys + paths + seo', async () => {
    const list = await getPublishedPages()
    expect(list.data.length).toBeGreaterThanOrEqual(8)
    expect(list.data.find((p) => p.key === 'about')?.path).toBe('/about')
    expect(list.data[0].seo).toHaveProperty('noindex')
  })
})
