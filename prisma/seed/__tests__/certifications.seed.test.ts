import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { seedSite } from '../site.seed'
import { seedCertifications, parseLegacyDate, mapCertStatus, mapTone, mapSealShape, buildDeterministicSlugs } from '../certifications.seed'

const hasDb = !!process.env.DATABASE_URL
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null)

describe('certifications seed mappers', () => {
  it('parses messy legacy dates', () => {
    expect(iso(parseLegacyDate('4/1/2024'))).toBe('2024-04-01') // M/D/Y
    expect(iso(parseLegacyDate('19-06-22'))).toBe('2022-06-19') // D-M-YY
    expect(iso(parseLegacyDate('September 13th, 2013'))).toBe('2013-09-13')
    expect(iso(parseLegacyDate('02 November 2020.'))).toBe('2020-11-02')
    expect(parseLegacyDate('-')).toBeNull()
    expect(parseLegacyDate('')).toBeNull()
  })

  it('maps status / tone / seal shape', () => {
    expect(mapCertStatus('Present')).toBe('Active')
    expect(mapCertStatus('Fully Completed')).toBe('Completed')
    expect(mapTone('tone-slate')).toBe('slate')
    expect(mapSealShape('seal-hex')).toBe('hex')
  })

  it('builds deterministic unique slugs, resolving collisions by source order', () => {
    const slugs = buildDeterministicSlugs([
      { title: 'Work Experience Certificate', authority: 'Army', id: 'a' },
      { title: 'Work Experience Certificate', authority: 'Army', id: 'b' },
    ])
    expect(slugs[0]).toBe('work-experience-certificate-army')
    expect(slugs[1]).toBe('work-experience-certificate-army-2')
  })
})

describe.skipIf(!hasDb)('seedCertifications (integration)', () => {
  it('imports the directory idempotently with unique slugs', async () => {
    await seedSite(db) // certifications-category vocab
    await seedCertifications(db)
    const countAfterFirst = await db.certification.count()
    expect(countAfterFirst).toBeGreaterThanOrEqual(13)

    await seedCertifications(db)
    expect(await db.certification.count()).toBe(countAfterFirst)
  }, 60000)

  it('maps a record onto category FK, enums, dates, and home-seal fields', async () => {
    const c = await db.certification.findFirst({ where: { legacyRef: 'iso-9001' }, include: { category: true } })
    expect(c).not.toBeNull()
    expect(c!.status).toBe('published')
    expect(c!.certStatus).toBe('Active')
    expect(c!.category!.slug).toBe('compliance')
    expect(iso(c!.issuedDate)).toBe('2024-04-01')
    expect(c!.expiryDate).toBeNull()
    expect(c!.tone).toBe('slate')
    expect(c!.sealShape).toBe('hex')
    expect(c!.showOnHome).toBe(true)
    expect(c!.sealOrder).toBe(0)
    expect(c!.sealLabel).toBe('ISO 9001')
    expect(c!.documentId).toBeNull() // no legacy document scans
  })
})
