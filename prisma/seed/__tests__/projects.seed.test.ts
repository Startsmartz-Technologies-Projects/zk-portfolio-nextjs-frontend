import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { seedMedia } from '../media.seed'
import { seedSite } from '../site.seed'
import {
  seedProjects,
  mapClientType,
  categoryTermSlug,
  locationTermSlug,
  parseYear,
  parseDurationMonths,
  deriveDates,
  mapBadgeStyle,
} from '../projects.seed'

const hasDb = !!process.env.DATABASE_URL
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null)

// ── Pure legacy-value mappers (no DB) ─────────────────────────────────────

describe('projects seed mappers', () => {
  it('maps legacy type → ClientType, collapsing non-segment values to Commercial', () => {
    expect(mapClientType('Government')).toBe('Government')
    expect(mapClientType('Private')).toBe('Private')
    expect(mapClientType('Infrastructure')).toBe('Commercial')
    expect(mapClientType('Religious / Institutional Construction')).toBe('Commercial')
    expect(mapClientType('Spaceport')).toBeNull()
  })

  it('maps legacy cat → projects-category term slug (alias + slugify)', () => {
    expect(categoryTermSlug('Bridge work')).toBe('bridge-works')
    expect(categoryTermSlug('Government project')).toBe('government-projects')
    expect(categoryTermSlug('Building construction')).toBe('building-construction')
    expect(categoryTermSlug('Road Works')).toBe('road-works')
  })

  it('derives a district term from free-text location, incl. spelling drift', () => {
    expect(locationTermSlug('Rampura, Dhaka')).toBe('dhaka')
    expect(locationTermSlug('Mouza Lalalsarat, Cantonment, Dhaka')).toBe('dhaka')
    expect(locationTermSlug('Comilla University, Kotbari, Comilla')).toBe('cumilla')
    expect(locationTermSlug('Patuakhali, Bangladesh')).toBeNull()
  })

  it('parses year and duration', () => {
    expect(parseYear('2025')).toBe(2025)
    expect(parseYear('Ongoing')).toBeNull()
    expect(parseDurationMonths('22 months')).toBe(22)
    expect(parseDurationMonths('4-5 months')).toBe(5)
    expect(parseDurationMonths('2.5 Years')).toBe(30)
    expect(parseDurationMonths('Ongoing')).toBeNull()
  })

  it('derives structured dates (completed back-computes start; open-ended has null end)', () => {
    const completed = deriveDates('2025', '22 months', 'Completed')
    expect(iso(completed.endDate)).toBe('2025-01-01')
    expect(iso(completed.startDate)).toBe('2023-03-01')

    const ongoing = deriveDates('2026', '2.5 Years', 'Ongoing')
    expect(ongoing.endDate).toBeNull()
    expect(iso(ongoing.startDate)).toBe('2023-07-01')
  })

  it('maps badge style, falling back to default', () => {
    expect(mapBadgeStyle('lime')).toBe('lime')
    expect(mapBadgeStyle('black')).toBe('black')
    expect(mapBadgeStyle(undefined)).toBe('default')
    expect(mapBadgeStyle('neon')).toBe('default')
  })
})

// ── Seed integration ──────────────────────────────────────────────────────

describe.skipIf(!hasDb)('seedProjects (integration)', () => {
  // Re-runs the full owner→projects seed chain over the session pooler (many serial
  // round-trips) — well past vitest's 5s default, so give it room.
  it('imports the legacy portfolio idempotently with mapped fields', async () => {
    // Prerequisite owners (idempotent): MediaAsset library + SITE taxonomies.
    await seedMedia(db)
    await seedSite(db)

    await seedProjects(db)
    const countAfterFirst = await db.project.count()
    expect(countAfterFirst).toBeGreaterThanOrEqual(4)

    // Re-running imports nothing new (keyed on legacy_id).
    await seedProjects(db)
    expect(await db.project.count()).toBe(countAfterFirst)
  }, 60000)

  it('maps P001 onto taxonomy FKs, enums, dates, children, and featured order', async () => {
    const p = await db.project.findUnique({
      where: { legacyId: 'P001' },
      include: { category: true, location: true, scopes: true, gallery: true, highlights: true },
    })
    expect(p).not.toBeNull()
    expect(p!.slug).toBe('49m-all-traffic-steel-arch-bridge')
    expect(p!.status).toBe('published')
    expect(p!.publishedAt).not.toBeNull()
    expect(p!.clientType).toBe('Government')
    expect(p!.deliveryStatus).toBe('Completed')
    expect(p!.category!.slug).toBe('bridge-works')
    expect(p!.location!.slug).toBe('dhaka')
    expect(p!.locationDetail).toBe('Rampura, Dhaka')
    expect(p!.badgeStyle).toBe('lime')
    expect(p!.featured).toBe(true)
    expect(p!.featuredOrder).toBe(0)
    expect(iso(p!.startDate)).toBe('2023-03-01')
    expect(iso(p!.endDate)).toBe('2025-01-01')
    expect(p!.coverImageId).not.toBeNull()
    expect(p!.scopes).toHaveLength(8)
    expect(p!.gallery).toHaveLength(7)
    expect(p!.highlights.length).toBeGreaterThan(0)
    // Child collections are positioned 0..n-1.
    expect([...p!.scopes].sort((a, b) => a.position - b.position)[0].position).toBe(0)
  })

  it('leaves an unresolved district null but preserves the granular location detail', async () => {
    const p = await db.project.findUnique({ where: { legacyId: 'P002' }, select: { locationId: true, locationDetail: true } })
    expect(p!.locationId).toBeNull()
    expect(p!.locationDetail).toBe('Patuakhali, Bangladesh')
  })
})
