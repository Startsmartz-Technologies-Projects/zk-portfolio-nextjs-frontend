import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import {
  slugify,
  listServices,
  getService,
  createService,
  updateService,
  duplicateService,
  publishService,
  collectPublishIssues,
  reorderServices,
  softDeleteService,
  restoreService,
  getPublishedServices,
  getPublishedServiceBySlug,
} from '@/lib/data/services'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-svc-${RID}`

describe('services pure helpers', () => {
  it('slugifies a title', () => {
    expect(slugify('Heavy Civil Infrastructure')).toBe('heavy-civil-infrastructure')
  })
})

describe.skipIf(!hasDb)('services data layer (integration)', () => {
  let coverId = ''
  const createdIds: string[] = []
  const createdRedirects: string[] = []

  beforeAll(async () => {
    const cover = await db.mediaAsset.create({
      data: { resourceType: 'image', provider: 'cloudinary', publicId: `${PREFIX}-hero`, url: 'https://res.cloudinary.com/x/image/upload/v1/hero.jpg', format: 'jpg', altText: 'Hero alt', tags: ['test'] },
    })
    coverId = cover.id
  })

  afterAll(async () => {
    await db.service.deleteMany({ where: { id: { in: createdIds } } })
    await db.service.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    if (createdRedirects.length) await db.redirect.deleteMany({ where: { fromPath: { in: createdRedirects } } })
    await db.mediaAsset.delete({ where: { id: coverId } }).catch(() => {})
    await db.$disconnect()
  })

  async function newDraft(extra: Record<string, unknown> = {}) {
    const s = await createService(null, { title: `${PREFIX} Draft`, slug: `${PREFIX}-${createdIds.length}`, overview_body: [], overview_bullets: [], ...extra })
    createdIds.push(s.id)
    return s
  }

  it('creates a draft with appended position and rejects a duplicate slug', async () => {
    const a = await newDraft()
    expect(a.content_status).toBe('draft')
    expect(typeof a.position).toBe('number')
    await expect(createService(null, { title: 'x', slug: a.slug, overview_body: [], overview_bullets: [] })).rejects.toBeInstanceOf(ConflictError)
  })

  it('get-one returns full detail incl. cta fallback; unknown id is NotFound', async () => {
    const d = await newDraft()
    const full = await getService(d.id)
    expect(full).toHaveProperty('meta')
    expect(full).toHaveProperty('cta_image') // resolved (SITE default when unset)
    await expect(getService('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('publish lists every missing required field, then publishes a complete service', async () => {
    const bare = await newDraft()
    const issues = await collectPublishIssues(bare.id)
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['subtitle', 'overview_title', 'overview_lead', 'hero_image']))
    await expect(publishService(null, bare.id)).rejects.toBeInstanceOf(PublishValidationError)

    const complete = await newDraft({ subtitle: 'sub', overview_title: 'OT', overview_lead: 'OL', hero_image_id: coverId })
    const published = await publishService(null, complete.id)
    expect(published.content_status).toBe('published')
    expect(published.published_at).not.toBeNull()
  })

  it('records a redirect on a published service slug change', async () => {
    const oldSlug = `${PREFIX}-pub`
    const created = await db.service.create({ data: { status: 'published', publishedAt: new Date(), slug: oldSlug, title: 'Pub', overviewBody: [], overviewBullets: [] } })
    createdIds.push(created.id)
    const newSlug = `${oldSlug}-renamed`
    await updateService(null, created.id, { slug: newSlug })
    createdRedirects.push(`/service-details/${oldSlug}`)
    const r = await db.redirect.findUnique({ where: { fromPath: `/service-details/${oldSlug}` } })
    expect(r?.toPath).toBe(`/service-details/${newSlug}`)
  })

  it('reorders services and rejects an unknown id', async () => {
    const a = await newDraft()
    const b = await newDraft()
    const result = await reorderServices(null, { ordered_ids: [b.id, a.id] })
    expect(result.services.find((s) => s.id === b.id)!.position).toBeLessThan(result.services.find((s) => s.id === a.id)!.position)
    await expect(reorderServices(null, { ordered_ids: ['00000000-0000-0000-0000-000000000000'] })).rejects.toBeInstanceOf(ValidationError)
  })

  it('duplicates, soft-deletes and restores', async () => {
    const d = await newDraft({ subtitle: 'x' })
    const copy = await duplicateService(null, d.id)
    createdIds.push(copy.id)
    expect(copy.content_status).toBe('draft')
    expect(copy.slug).toContain('-copy')
    await softDeleteService(null, copy.id)
    const restored = await restoreService(null, copy.id)
    expect(restored.id).toBe(copy.id)
  })

  it('public directory returns only published services in position order with derived numbers', async () => {
    const draft = await newDraft()
    const dir = await getPublishedServices()
    expect(dir.data.every((s) => !('content_status' in s))).toBe(true)
    expect(dir.data.find((s) => s.id === draft.id)).toBeUndefined()
    expect(dir.data.length).toBeGreaterThanOrEqual(11) // seeded catalog
    expect(dir.data[0].service_number).toBe(1)
    expect(dir.data[0].total_services).toBe(dir.data.length)
    const positions = dir.data.map((s) => s.position)
    expect([...positions]).toEqual([...positions].sort((a, b) => a - b))

    const bySlug = await getPublishedServiceBySlug('heavy-civil-infrastructure-development')
    expect(bySlug).not.toBeNull()
    expect(bySlug).toHaveProperty('cta_image')
    expect(bySlug!.machine.length).toBeGreaterThan(0)
  })

  it('admin list paginates and filters', async () => {
    const list = await listServices({ q: PREFIX })
    expect(list.data.every((s) => 'content_status' in s)).toBe(true)
    expect(list.meta.total).toBeGreaterThan(0)
  })
})
