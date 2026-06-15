import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import {
  slugify,
  listConcerns,
  getConcern,
  createConcern,
  updateConcern,
  publishConcern,
  collectPublishIssues,
  setDefaultConcern,
  unpublishConcern,
  reorderConcerns,
  getPublishedConcerns,
  getPublishedConcernBySlug,
  getDefaultConcern,
} from '@/lib/data/concerns'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-concern-${RID}`

describe('concerns pure helpers', () => {
  it('slugifies', () => {
    expect(slugify('Zakir Construction Ltd.')).toBe('zakir-construction-ltd')
  })
})

describe.skipIf(!hasDb)('concerns data layer (integration)', () => {
  let coverId = ''
  const createdIds: string[] = []
  const createdRedirects: string[] = []

  beforeAll(async () => {
    const cover = await db.mediaAsset.create({
      data: { resourceType: 'image', provider: 'cloudinary', publicId: `${PREFIX}-hero`, url: 'https://res.cloudinary.com/x/image/upload/v1/h.jpg', format: 'jpg', altText: 'Hero alt', tags: ['test'] },
    })
    coverId = cover.id
  })

  afterAll(async () => {
    await db.concern.deleteMany({ where: { id: { in: createdIds } } })
    await db.concern.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    if (createdRedirects.length) await db.redirect.deleteMany({ where: { fromPath: { in: createdRedirects } } })
    await db.mediaAsset.delete({ where: { id: coverId } }).catch(() => {})
    await db.$disconnect()
  })

  async function newDraft(extra: Record<string, unknown> = {}) {
    const c = await createConcern(null, { name: `${PREFIX} Concern`, slug: `${PREFIX}-${createdIds.length}`, overview_body: [], facts: [], services: [], why: [], showcase: [], process: [], gallery: [], faqs: [], ...extra })
    createdIds.push(c.id)
    return c
  }

  it('creates a draft, rejects a duplicate slug', async () => {
    const a = await newDraft()
    expect(a.content_status).toBe('draft')
    expect(a.is_default).toBe(false)
    await expect(createConcern(null, { name: 'x', slug: a.slug, overview_body: [], facts: [], services: [], why: [], showcase: [], process: [], gallery: [], faqs: [] })).rejects.toBeInstanceOf(ConflictError)
  })

  it('get-one returns full detail with child collections; unknown is NotFound', async () => {
    const d = await newDraft({ facts: [{ big: '10', label: 'Years' }] })
    const full = await getConcern(d.id)
    expect(full.facts).toHaveLength(1)
    expect(full).toHaveProperty('seo')
    await expect(getConcern('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('publish gate lists missing fields, then publishes a complete concern', async () => {
    const bare = await newDraft()
    const issues = await collectPublishIssues(bare.id)
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['short', 'tagline', 'intro', 'overview_body', 'hero_image']))
    await expect(publishConcern(null, bare.id)).rejects.toBeInstanceOf(PublishValidationError)

    const complete = await newDraft({ short: 's', tagline: 't', intro: 'i', overview_body: ['para'], hero_image_id: coverId })
    const published = await publishConcern(null, complete.id)
    expect(published.content_status).toBe('published')
  })

  it('records a redirect on a published concern slug change', async () => {
    const oldSlug = `${PREFIX}-pub`
    const created = await db.concern.create({ data: { status: 'published', publishedAt: new Date(), slug: oldSlug, name: 'Pub', overviewBody: [] } })
    createdIds.push(created.id)
    const newSlug = `${oldSlug}-renamed`
    await updateConcern(null, created.id, { slug: newSlug })
    createdRedirects.push(`/concern-detail/${oldSlug}`)
    const r = await db.redirect.findUnique({ where: { fromPath: `/concern-detail/${oldSlug}` } })
    expect(r?.toPath).toBe(`/concern-detail/${newSlug}`)
  })

  it('set-default requires a published concern and guards unpublish of the default', async () => {
    const draft = await newDraft()
    await expect(setDefaultConcern(null, draft.id)).rejects.toBeInstanceOf(ValidationError) // not published

    const pub = await newDraft({ short: 's', tagline: 't', intro: 'i', overview_body: ['p'], hero_image_id: coverId })
    await publishConcern(null, pub.id)
    const def = await setDefaultConcern(null, pub.id)
    expect(def.is_default).toBe(true)
    // The default cannot be unpublished until another is made default.
    await expect(unpublishConcern(null, pub.id)).rejects.toBeInstanceOf(ConflictError)
    // Hand the default back to a seeded concern so cleanup can remove the test one.
    const seededDefault = await db.concern.findFirst({ where: { slug: 'zakir-enterprise' }, select: { id: true } })
    if (seededDefault) await setDefaultConcern(null, seededDefault.id)
  })

  it('reorders concerns and rejects an unknown id', async () => {
    const a = await newDraft()
    const b = await newDraft()
    const res = await reorderConcerns(null, { ordered_ids: [b.id, a.id] })
    expect(res.concerns.find((c) => c.id === b.id)!.position).toBeLessThan(res.concerns.find((c) => c.id === a.id)!.position)
    await expect(reorderConcerns(null, { ordered_ids: ['00000000-0000-0000-0000-000000000000'] })).rejects.toBeInstanceOf(ValidationError)
  })

  it('public reads expose only published concerns; detail carries derived + related; default resolves', async () => {
    const draft = await newDraft()
    const list = await getPublishedConcerns()
    expect(list.data.every((c) => !('content_status' in c))).toBe(true)
    expect(list.data.find((c) => c.id === draft.id)).toBeUndefined()
    expect(list.data.length).toBeGreaterThanOrEqual(4) // seeded concerns

    const bySlug = await getPublishedConcernBySlug('zakir-enterprise')
    expect(bySlug).not.toBeNull()
    expect(bySlug!.display_est).toBe('Est. 2012')
    expect(Array.isArray(bySlug!.related)).toBe(true)
    expect((bySlug!.related as unknown[]).length).toBeGreaterThan(0)

    const def = await getDefaultConcern()
    expect(def).not.toBeNull()
    expect(def!.is_default).toBe(true)
  })

  it('admin list searches', async () => {
    const list = await listConcerns({ q: PREFIX })
    expect(list.data.every((c) => 'content_status' in c)).toBe(true)
  })
})
