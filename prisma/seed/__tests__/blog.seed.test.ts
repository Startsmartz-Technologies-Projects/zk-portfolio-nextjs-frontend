import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { seedMedia } from '../media.seed'
import { seedSite } from '../site.seed'
import { seedBlog, parseReadTime } from '../blog.seed'

const hasDb = !!process.env.DATABASE_URL

describe('blog seed helpers', () => {
  it('parses read time minutes', () => {
    expect(parseReadTime('8 min read')).toBe(8)
    expect(parseReadTime('No number')).toBeNull()
  })
})

describe.skipIf(!hasDb)('seedBlog (integration)', () => {
  it('imports articles idempotently with category, tags, and a transformed body', async () => {
    await seedMedia(db)
    await seedSite(db) // ensures blog-category incl. Company News / Equipment terms
    await seedBlog(db)
    const countAfterFirst = await db.article.count()
    expect(countAfterFirst).toBeGreaterThanOrEqual(12)

    await seedBlog(db)
    expect(await db.article.count()).toBe(countAfterFirst)
  }, 60000)

  it('maps the featured article onto fields + a JSONB block body', async () => {
    const a = await db.article.findUnique({ where: { slug: 'quality-foundation-work' }, include: { category: true } })
    expect(a).not.toBeNull()
    expect(a!.status).toBe('published')
    expect(a!.featured).toBe(true)
    expect(a!.popularity).toBe(98)
    expect(a!.readTimeMinutes).toBe(8)
    expect(a!.category!.slug).toBe('construction')
    expect(a!.articleDate?.toISOString().slice(0, 10)).toBe('2026-03-22')
    expect(a!.tags).toContain('Foundation')
    expect(a!.bodyLead).toBeTruthy()
    const body = a!.body as { sections: { blocks: { kind: string }[] }[] }
    expect(body.sections.length).toBeGreaterThan(0)
    // stats blocks were transformed (lbl → label); img blocks (Unsplash) dropped.
    const kinds = body.sections.flatMap((s) => s.blocks.map((b) => b.kind))
    expect(kinds).toContain('stats')
    expect(kinds).not.toContain('img')
  })
})
