import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import {
  slugify,
  formatDisplayDate,
  deriveReadTimeMinutes,
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  publishArticle,
  collectPublishIssues,
  setFeatured,
  getPublishedArticles,
  getFeaturedArticles,
  getArticleFacets,
  getPublishedArticleBySlug,
} from '@/lib/data/blog'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-blog-${RID}`

describe('blog pure helpers', () => {
  it('slugify + display date + read time', () => {
    expect(slugify('My First Post!')).toBe('my-first-post')
    expect(formatDisplayDate(new Date('2026-03-22T00:00:00Z'))).toBe('22/03/2026')
    expect(formatDisplayDate(null)).toBeNull()
    const minutes = deriveReadTimeMinutes('word '.repeat(400), { sections: [] })
    expect(minutes).toBe(2) // 400 words / 200 wpm
  })
})

describe.skipIf(!hasDb)('blog data layer (integration)', () => {
  let coverId = ''
  let categoryId = ''
  const createdIds: string[] = []
  const createdRedirects: string[] = []

  beforeAll(async () => {
    const cover = await db.mediaAsset.create({
      data: { resourceType: 'image', provider: 'cloudinary', publicId: `${PREFIX}-cover`, url: 'https://res.cloudinary.com/x/image/upload/v1/c.jpg', format: 'jpg', altText: 'Cover alt', tags: ['test'] },
    })
    coverId = cover.id
    const cat = await db.taxonomyTerm.findFirst({ where: { slug: 'construction', taxonomy: { slug: 'blog-category' } } })
    categoryId = cat!.id
  })

  afterAll(async () => {
    await db.article.deleteMany({ where: { id: { in: createdIds } } })
    await db.article.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    if (createdRedirects.length) await db.redirect.deleteMany({ where: { fromPath: { in: createdRedirects } } })
    await db.mediaAsset.delete({ where: { id: coverId } }).catch(() => {})
    await db.$disconnect()
  })

  async function newDraft(extra: Record<string, unknown> = {}) {
    const a = await createArticle(null, { title: `${PREFIX} Draft`, slug: `${PREFIX}-${createdIds.length}`, tags: [], featured: false, popularity: 0, body: { sections: [] }, ...extra })
    createdIds.push(a.id)
    return a
  }

  it('creates a draft and rejects a duplicate slug', async () => {
    const a = await newDraft()
    expect(a.content_status).toBe('draft')
    await expect(createArticle(null, { title: 'x', slug: a.slug, tags: [], featured: false, popularity: 0, body: { sections: [] } })).rejects.toBeInstanceOf(ConflictError)
  })

  it('get-one returns full detail; unknown id is NotFound', async () => {
    const d = await newDraft()
    const full = await getArticle(d.id)
    expect(full).toHaveProperty('body')
    expect(full).toHaveProperty('author_bio') // default applied when empty
    await expect(getArticle('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('publish gate lists every missing field incl. empty body', async () => {
    const bare = await newDraft()
    const issues = await collectPublishIssues(bare.id)
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['excerpt', 'category', 'article_date', 'cover_image', 'body']))
    await expect(publishArticle(null, bare.id)).rejects.toBeInstanceOf(PublishValidationError)
  })

  it('publishes a complete article and resolves body images on the public read', async () => {
    const body = {
      sections: [
        { id: 'intro', heading: 'Intro', level: 2, blocks: [{ kind: 'p', text: 'Hello world body content.' }, { kind: 'img', media_id: coverId, caption: 'cap' }] },
      ],
    }
    const d = await newDraft({ excerpt: 'An excerpt', category_id: categoryId, article_date: new Date('2026-01-01T00:00:00Z'), cover_image_id: coverId, body_lead: 'The lead paragraph.', body })
    const published = await publishArticle(null, d.id)
    expect(published.content_status).toBe('published')

    const pub = await getPublishedArticleBySlug(published.slug)
    expect(pub).not.toBeNull()
    const pubBody = pub!.body as { sections: { blocks: { kind: string; media?: { id: string }; media_id?: string }[] }[] }
    const img = pubBody.sections[0].blocks.find((b) => b.kind === 'img')!
    expect(img.media).toBeDefined() // media_id resolved → MediaRef
    expect(img.media_id).toBeUndefined()
    expect(pub).toHaveProperty('related')
  })

  it('records a redirect on a published article slug change', async () => {
    const oldSlug = `${PREFIX}-pub`
    const created = await db.article.create({ data: { status: 'published', publishedAt: new Date(), slug: oldSlug, title: 'Pub', tags: [] } })
    createdIds.push(created.id)
    const newSlug = `${oldSlug}-renamed`
    await updateArticle(null, created.id, { slug: newSlug })
    createdRedirects.push(`/blogs/${oldSlug}`)
    const r = await db.redirect.findUnique({ where: { fromPath: `/blogs/${oldSlug}` } })
    expect(r?.toPath).toBe(`/blogs/${newSlug}`)
  })

  it('featuring requires a published article', async () => {
    const draft = await newDraft()
    await expect(setFeatured(null, draft.id, true)).rejects.toBeInstanceOf(ValidationError)
  })

  it('public reads expose only published articles with facets and derived fields', async () => {
    const draft = await newDraft()
    const pub = await getPublishedArticles({})
    expect(pub.data.every((a) => !('content_status' in a))).toBe(true)
    expect(pub.data.find((a) => a.id === draft.id)).toBeUndefined()
    expect(pub.meta.pageSize).toBe(6) // public default
    expect(pub.data[0]).toHaveProperty('read_time')
    expect(pub.data[0]).toHaveProperty('display_date')

    const featured = await getFeaturedArticles()
    expect(Array.isArray(featured.data)).toBe(true)

    const facets = await getArticleFacets()
    expect(facets.categories.length).toBeGreaterThan(0)
    expect(facets.categories[0]).toHaveProperty('count')
  })

  it('admin list searches and paginates', async () => {
    const list = await listArticles({ q: PREFIX })
    expect(list.data.every((a) => 'content_status' in a)).toBe(true)
  })
})
