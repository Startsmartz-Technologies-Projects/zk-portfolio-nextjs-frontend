import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { seedMedia } from '../media.seed'
import { seedSite } from '../site.seed'
import { seedNews } from '../news.seed'

const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasDb)('seedNews (integration)', () => {
  it('imports stories idempotently with category, tags, and a flat JSONB body', async () => {
    await seedMedia(db)
    await seedSite(db)
    await seedNews(db)
    const countAfterFirst = await db.newsStory.count()
    expect(countAfterFirst).toBeGreaterThanOrEqual(12)

    await seedNews(db)
    expect(await db.newsStory.count()).toBe(countAfterFirst)
  }, 60000)

  it('maps the featured story onto fields + a flat block body', async () => {
    const s = await db.newsStory.findUnique({ where: { slug: 'road-dhaka-awarded' }, include: { category: true, gallery: true } })
    expect(s).not.toBeNull()
    expect(s!.status).toBe('published')
    expect(s!.featured).toBe(true)
    expect(s!.category!.slug).toBe('awarded-project')
    expect(s!.articleDate?.toISOString().slice(0, 10)).toBe('2026-03-18')
    expect(s!.gallery).toHaveLength(0) // legacy gallery was a static placeholder
    const body = s!.body as { blocks: { kind: string }[] }
    expect(Array.isArray(body.blocks)).toBe(true)
    const kinds = body.blocks.map((b) => b.kind)
    expect(kinds).toContain('callout') // stats transformed (lbl → label)
    expect(kinds).toContain('h2')
    expect(kinds).not.toContain('img') // Unsplash image blocks dropped
  })
})
