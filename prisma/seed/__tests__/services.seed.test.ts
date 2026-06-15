import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { seedMedia } from '../media.seed'
import { seedServices } from '../services.seed'

const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('seedServices (integration)', () => {
  it('imports the service catalog idempotently in position order', async () => {
    await seedMedia(db) // prerequisite: image library
    await seedServices(db)
    const countAfterFirst = await db.service.count()
    expect(countAfterFirst).toBeGreaterThanOrEqual(11)

    await seedServices(db) // re-run adds nothing (keyed on slug)
    expect(await db.service.count()).toBe(countAfterFirst)
  }, 60000)

  it('maps the first service onto fields + ordered child collections', async () => {
    const s = await db.service.findUnique({
      where: { slug: 'heavy-civil-infrastructure-development' },
      include: { meta: true, scope: true, process: true, benefits: true, machine: true, faq: true },
    })
    expect(s).not.toBeNull()
    expect(s!.status).toBe('published')
    expect(s!.position).toBe(0)
    expect(s!.icon).toBe('building')
    expect(s!.heroImageId).not.toBeNull()
    expect(s!.ctaImageId).toBeNull() // shared Unsplash CTA → SITE default
    expect(s!.overviewBody.length).toBeGreaterThan(0)
    expect(s!.meta.length).toBe(4)
    expect(s!.process.length).toBe(5)
    expect(s!.machine.length).toBe(6)
    // Empty FAQ rows in the source are dropped.
    expect(s!.faq.every((f) => f.question.trim().length > 0)).toBe(true)
  })
})
