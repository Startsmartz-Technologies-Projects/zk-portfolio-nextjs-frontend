import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { seedConcerns, parseEstYear } from '../concerns.seed'

const hasDb = !!process.env.DATABASE_URL

describe('concerns seed helpers', () => {
  it('parses the established year', () => {
    expect(parseEstYear('Est. 2014')).toBe(2014)
    expect(parseEstYear('')).toBeNull()
  })
})

describe.skipIf(!hasDb)('seedConcerns (integration)', () => {
  it('imports the concerns idempotently with a single default', async () => {
    await seedConcerns(db)
    const countAfterFirst = await db.concern.count()
    expect(countAfterFirst).toBeGreaterThanOrEqual(4)

    await seedConcerns(db)
    expect(await db.concern.count()).toBe(countAfterFirst)

    const defaults = await db.concern.count({ where: { isDefault: true } })
    expect(defaults).toBe(1)
  }, 60000)

  it('maps the default concern onto fields + ordered child collections', async () => {
    const c = await db.concern.findUnique({
      where: { slug: 'zakir-enterprise' },
      include: { facts: true, services: true, why: true, showcase: true, process: true, faqs: true },
    })
    expect(c).not.toBeNull()
    expect(c!.status).toBe('published')
    expect(c!.isDefault).toBe(true)
    expect(c!.position).toBe(0)
    expect(c!.establishedYear).toBe(2012)
    expect(c!.overviewBody.length).toBeGreaterThan(0)
    expect(c!.facts.length).toBe(6)
    expect(c!.services.length).toBeGreaterThan(0)
    expect(c!.why.length).toBe(6)
    expect(c!.showcase.length).toBeGreaterThan(0)
    expect(c!.faqs.length).toBe(6)
    // why.big mapped to number
    expect(c!.why.some((w) => w.number === '01')).toBe(true)
  })
})
