import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import {
  slugify,
  deriveYearDuration,
  listProjects,
  getProject,
  createProject,
  updateProject,
  softDeleteProject,
  restoreProject,
  duplicateProject,
  publishProject,
  collectPublishIssues,
  setFeatured,
  getPublishedProjects,
  getPublishedProjectBySlug,
  getFeaturedProjects,
  getProjectFacets,
  getProjectStats,
} from '@/lib/data/projects'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-proj-${RID}`

// ── Pure helpers (no DB) ────────────────────────────────────────────────────

describe('projects pure helpers', () => {
  it('slugifies a title', () => {
    expect(slugify('49m All Traffic Steel Arch Bridge')).toBe('49m-all-traffic-steel-arch-bridge')
    expect(slugify('SKCD Dream - G+7 Building')).toBe('skcd-dream-g-7-building')
  })

  it('derives year + duration label', () => {
    const d1 = deriveYearDuration(new Date(Date.UTC(2023, 2, 1)), new Date(Date.UTC(2025, 0, 1)), 'Completed')
    expect(d1.year).toBe(2025)
    expect(d1.durationLabel).toBe('22 months')

    const d2 = deriveYearDuration(new Date(Date.UTC(2023, 6, 1)), null, 'Ongoing')
    expect(d2.year).toBe(2023)
    expect(d2.durationLabel).toBe('Ongoing')

    const d3 = deriveYearDuration(new Date(Date.UTC(2020, 0, 1)), new Date(Date.UTC(2023, 0, 1)), 'Completed')
    expect(d3.durationLabel).toBe('3 years')
  })
})

// ── Admin + public data layer (integration) ─────────────────────────────────

describe.skipIf(!hasDb)('projects data layer (integration)', () => {
  let catId = ''
  let locId = ''
  let coverId = ''
  let publishedSeedId = ''
  const createdProjectIds: string[] = []
  const createdRedirectPaths: string[] = []

  beforeAll(async () => {
    const [cat, loc] = await Promise.all([
      db.taxonomyTerm.findFirst({ where: { slug: 'bridge-works', taxonomy: { slug: 'projects-category' } } }),
      db.taxonomyTerm.findFirst({ where: { slug: 'dhaka', taxonomy: { slug: 'location' } } }),
    ])
    catId = cat!.id
    locId = loc!.id
    // A cover asset WITH alt text so the publish gate passes.
    const cover = await db.mediaAsset.create({
      data: { resourceType: 'image', provider: 'cloudinary', publicId: `${PREFIX}-cover`, url: 'https://res.cloudinary.com/x/image/upload/v1/cover.jpg', format: 'jpg', altText: 'Test cover alt', tags: ['test'] },
    })
    coverId = cover.id
    const seeded = await db.project.findFirst({ where: { status: 'published', deletedAt: null }, select: { id: true } })
    publishedSeedId = seeded!.id
  })

  afterAll(async () => {
    await db.project.deleteMany({ where: { id: { in: createdProjectIds } } })
    await db.project.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    if (createdRedirectPaths.length) await db.redirect.deleteMany({ where: { fromPath: { in: createdRedirectPaths } } })
    await db.mediaAsset.delete({ where: { id: coverId } }).catch(() => {})
    await db.$disconnect()
  })

  async function newDraft(extra: Record<string, unknown> = {}) {
    const p = await createProject(null, { title: `${PREFIX} Draft`, slug: `${PREFIX}-${createdProjectIds.length}`, services_delivered: [], ...extra })
    createdProjectIds.push(p.id)
    return p
  }

  // Create / slug
  it('creates a draft with an auto-unique slug and rejects a duplicate provided slug', async () => {
    const a = await createProject(null, { title: `${PREFIX} Auto`, services_delivered: [] })
    createdProjectIds.push(a.id)
    expect(a.content_status).toBe('draft')
    expect(a.slug).toContain('test-proj')

    await expect(createProject(null, { title: 'x', slug: a.slug, services_delivered: [] })).rejects.toBeInstanceOf(ConflictError)
  })

  it('get-one returns full detail; unknown id is NotFound', async () => {
    const d = await newDraft()
    const full = await getProject(d.id)
    expect(full.id).toBe(d.id)
    expect(full).toHaveProperty('seo')
    expect(full).toHaveProperty('scopes')
    await expect(getProject('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  // Publish gate
  it('publish lists every missing required field + alt text', async () => {
    const d = await newDraft()
    const issues = await collectPublishIssues(d.id)
    const fields = issues.map((i) => i.field)
    expect(fields).toEqual(expect.arrayContaining(['summary', 'category', 'location', 'client_type', 'start_date', 'cover_image']))
    await expect(publishProject(null, d.id)).rejects.toBeInstanceOf(PublishValidationError)
  })

  it('publishes a complete project and sets published_at', async () => {
    const d = await newDraft({
      summary: 'A complete project',
      category_id: catId,
      location_id: locId,
      client_type: 'Government',
      delivery_status: 'Completed',
      start_date: new Date('2023-03-01T00:00:00Z'),
      end_date: new Date('2025-01-15T00:00:00Z'),
      cover_image_id: coverId,
    })
    const published = await publishProject(null, d.id)
    expect(published.content_status).toBe('published')
    expect(published.published_at).not.toBeNull()
  })

  // Slug change → redirect on a published project
  it('records a redirect when a published project changes slug', async () => {
    const oldSlug = `${PREFIX}-pub-${RID}`
    const created = await db.project.create({
      data: { status: 'published', publishedAt: new Date(), slug: oldSlug, title: 'Pub', deliveryStatus: 'Completed', servicesDelivered: [] },
    })
    createdProjectIds.push(created.id)
    const newSlug = `${oldSlug}-renamed`
    await updateProject(null, created.id, { slug: newSlug })
    createdRedirectPaths.push(`/projects/${oldSlug}`)
    const redirect = await db.redirect.findUnique({ where: { fromPath: `/projects/${oldSlug}` } })
    expect(redirect).not.toBeNull()
    expect(redirect!.toPath).toBe(`/projects/${newSlug}`)
  })

  // Related validation
  it('rejects related projects that are self or non-published', async () => {
    const draft = await newDraft()
    await expect(updateProject(null, draft.id, { related_project_ids: [draft.id] })).rejects.toBeInstanceOf(ValidationError)
    await expect(updateProject(null, draft.id, { related_project_ids: [draft.id, draft.id] })).rejects.toBeInstanceOf(ValidationError)
    // A published seed project is a valid relation.
    const ok = await updateProject(null, draft.id, { related_project_ids: [publishedSeedId] })
    expect(ok.id).toBe(draft.id)
  })

  // Featured rules (failure paths — no mutation)
  it('rejects featuring beyond the max and featuring a non-published project', async () => {
    const allPublished = await db.project.findMany({ where: { status: 'published', deletedAt: null }, select: { id: true }, take: 10 })
    const ids = allPublished.map((p) => p.id)
    expect(ids.length).toBeGreaterThanOrEqual(4) // seeded portfolio
    await expect(setFeatured(null, { ordered_ids: ids })).rejects.toBeInstanceOf(ValidationError) // > max_featured_projects (3)

    const draft = await newDraft()
    await expect(setFeatured(null, { ordered_ids: [draft.id] })).rejects.toBeInstanceOf(ValidationError) // not published
  })

  // Duplicate / soft-delete / restore
  it('duplicates as a draft copy and soft-deletes + restores', async () => {
    const copy = await duplicateProject(null, publishedSeedId)
    createdProjectIds.push(copy.id)
    expect(copy.content_status).toBe('draft')
    expect(copy.slug).toContain('-copy')
    expect(copy.published_at).toBeNull()

    await softDeleteProject(null, copy.id)
    const inList = await listProjects({ q: PREFIX })
    expect(inList.data.find((p) => p.id === copy.id)).toBeUndefined()
    const restored = await restoreProject(null, copy.id)
    expect(restored.id).toBe(copy.id)
  })

  // Public reads
  it('public reads expose only published, non-deleted projects with derived fields', async () => {
    const draft = await newDraft()
    const pub = await getPublishedProjects({})
    expect(pub.data.every((p) => !('content_status' in p))).toBe(true)
    expect(pub.data.find((p) => p.id === draft.id)).toBeUndefined()
    expect(pub.meta.total).toBeGreaterThanOrEqual(4)

    const stats = await getProjectStats()
    expect(stats.total_projects).toBeGreaterThanOrEqual(4)
    expect(stats.districts_covered).toBeGreaterThanOrEqual(1)

    const featured = await getFeaturedProjects()
    expect(featured.data.length).toBeGreaterThanOrEqual(1)
    const orders = featured.data.map((f) => f.featured_order!)
    expect([...orders]).toEqual([...orders].sort((a, b) => a - b))

    const facets = await getProjectFacets()
    expect(facets.categories.length).toBeGreaterThan(0)
    expect(facets.categories[0]).toHaveProperty('count')

    const bySlug = await getPublishedProjectBySlug('49m-all-traffic-steel-arch-bridge')
    expect(bySlug).not.toBeNull()
    expect(bySlug!.year).toBe(2025)
    expect(bySlug).toHaveProperty('related')
  })
})
