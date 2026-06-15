import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import {
  slugify,
  formatDisplayDate,
  deriveReadTimeMinutes,
  listStories,
  getStory,
  createStory,
  updateStory,
  publishStory,
  collectPublishIssues,
  setFeatured,
  getPublishedStories,
  getFeaturedStories,
  getStoryFacets,
  getPublishedStoryBySlug,
} from '@/lib/data/news'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-news-${RID}`

describe('news pure helpers', () => {
  it('slugify + display date + read time', () => {
    expect(slugify('A News Story!')).toBe('a-news-story')
    expect(formatDisplayDate(new Date('2026-03-18T00:00:00Z'))).toBe('18/03/2026')
    expect(deriveReadTimeMinutes('w '.repeat(600), { blocks: [] })).toBe(3) // 600/200
  })
})

describe.skipIf(!hasDb)('news data layer (integration)', () => {
  let coverId = ''
  let categoryId = ''
  const createdIds: string[] = []
  const createdRedirects: string[] = []

  beforeAll(async () => {
    const cover = await db.mediaAsset.create({
      data: { resourceType: 'image', provider: 'cloudinary', publicId: `${PREFIX}-cover`, url: 'https://res.cloudinary.com/x/image/upload/v1/n.jpg', format: 'jpg', altText: 'Cover alt', tags: ['test'] },
    })
    coverId = cover.id
    const cat = await db.taxonomyTerm.findFirst({ where: { slug: 'milestone', taxonomy: { slug: 'news-category' } } })
    categoryId = cat!.id
  })

  afterAll(async () => {
    await db.newsStory.deleteMany({ where: { id: { in: createdIds } } })
    await db.newsStory.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    if (createdRedirects.length) await db.redirect.deleteMany({ where: { fromPath: { in: createdRedirects } } })
    await db.mediaAsset.delete({ where: { id: coverId } }).catch(() => {})
    await db.$disconnect()
  })

  async function newDraft(extra: Record<string, unknown> = {}) {
    const s = await createStory(null, { title: `${PREFIX} Draft`, slug: `${PREFIX}-${createdIds.length}`, tags: [], featured: false, body: { blocks: [] }, gallery: [], ...extra })
    createdIds.push(s.id)
    return s
  }

  it('creates a draft and rejects a duplicate slug', async () => {
    const a = await newDraft()
    expect(a.content_status).toBe('draft')
    await expect(createStory(null, { title: 'x', slug: a.slug, tags: [], featured: false, body: { blocks: [] }, gallery: [] })).rejects.toBeInstanceOf(ConflictError)
  })

  it('get-one returns full detail; unknown id is NotFound', async () => {
    const d = await newDraft()
    const full = await getStory(d.id)
    expect(full).toHaveProperty('body')
    expect(full).toHaveProperty('gallery')
    await expect(getStory('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('publish gate lists every missing field; publishes a complete story; resolves body images', async () => {
    const bare = await newDraft()
    const issues = await collectPublishIssues(bare.id)
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['excerpt', 'category', 'article_date', 'cover_image', 'body']))
    await expect(publishStory(null, bare.id)).rejects.toBeInstanceOf(PublishValidationError)

    const body = { blocks: [{ kind: 'p', text: 'Story body content here.' }, { kind: 'img', media_id: coverId, caption: 'cap' }] }
    const d = await newDraft({ excerpt: 'ex', category_id: categoryId, article_date: new Date('2026-02-01T00:00:00Z'), cover_image_id: coverId, body_lead: 'Lead.', body })
    const published = await publishStory(null, d.id)
    expect(published.content_status).toBe('published')

    const pub = await getPublishedStoryBySlug(published.slug)
    const pubBody = pub!.body as { blocks: { kind: string; media?: unknown; media_id?: string }[] }
    const img = pubBody.blocks.find((b) => b.kind === 'img')!
    expect(img.media).toBeDefined()
    expect(img.media_id).toBeUndefined()
    expect(pub).toHaveProperty('related')
  })

  it('records a redirect on a published story slug change', async () => {
    const oldSlug = `${PREFIX}-pub`
    const created = await db.newsStory.create({ data: { status: 'published', publishedAt: new Date(), slug: oldSlug, title: 'Pub', tags: [] } })
    createdIds.push(created.id)
    const newSlug = `${oldSlug}-renamed`
    await updateStory(null, created.id, { slug: newSlug })
    createdRedirects.push(`/news/${oldSlug}`)
    const r = await db.redirect.findUnique({ where: { fromPath: `/news/${oldSlug}` } })
    expect(r?.toPath).toBe(`/news/${newSlug}`)
  })

  it('featuring requires a published story', async () => {
    const draft = await newDraft()
    await expect(setFeatured(null, draft.id, true)).rejects.toBeInstanceOf(ValidationError)
  })

  it('public reads expose only published stories with facets and derived fields', async () => {
    const draft = await newDraft()
    const pub = await getPublishedStories({})
    expect(pub.data.every((s) => !('content_status' in s))).toBe(true)
    expect(pub.data.find((s) => s.id === draft.id)).toBeUndefined()
    expect(pub.data[0]).toHaveProperty('read_time')
    expect(pub.data[0]).toHaveProperty('display_date')

    const featured = await getFeaturedStories()
    expect(Array.isArray(featured.data)).toBe(true)

    const facets = await getStoryFacets()
    expect(facets.categories.length).toBeGreaterThan(0)
  })

  it('admin list searches', async () => {
    const list = await listStories({ q: PREFIX })
    expect(list.data.every((s) => 'content_status' in s)).toBe(true)
  })
})
