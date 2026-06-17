import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ConflictError, NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import {
  slugify,
  listCertifications,
  getCertification,
  createCertification,
  publishCertification,
  collectPublishIssues,
  setHomeSeals,
  softDeleteCertification,
  restoreCertification,
  getPublishedCertifications,
  getCertificationFacets,
  getHomeSeals,
} from '@/lib/data/certifications'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-cert-${RID}`

describe('certifications pure helpers', () => {
  it('slugifies', () => {
    expect(slugify('ISO 9001 · Trust Bank')).toBe('iso-9001-trust-bank')
  })
})

describe.skipIf(!hasDb)('certifications data layer (integration)', () => {
  let categoryId = ''
  const createdIds: string[] = []

  beforeAll(async () => {
    const cat = await db.taxonomyTerm.findFirst({ where: { slug: 'compliance', taxonomy: { slug: 'certifications-category' } } })
    categoryId = cat!.id
  })

  afterAll(async () => {
    await db.certification.deleteMany({ where: { id: { in: createdIds } } })
    await db.certification.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    await db.$disconnect()
  })

  async function newDraft(extra: Record<string, unknown> = {}) {
    const c = await createCertification(null, { title: `${PREFIX} Cert`, slug: `${PREFIX}-${createdIds.length}`, status: 'Active', tone: 'paper', seal_shape: 'round', show_on_home: false, ...extra })
    createdIds.push(c.id)
    return c
  }

  it('creates a draft, rejects a duplicate slug, and serializes display dates', async () => {
    const a = await newDraft({ issued_date: new Date('2024-01-04T00:00:00Z') })
    expect(a.content_status).toBe('draft')
    expect(a.display_issued).toBe('04/01/2024')
    expect(a.display_expiry).toBe('—') // no expiry
    await expect(createCertification(null, { title: 'x', slug: a.slug, status: 'Active', tone: 'paper', seal_shape: 'round', show_on_home: false })).rejects.toBeInstanceOf(ConflictError)
  })

  it('get-one returns the record; unknown id is NotFound', async () => {
    const d = await newDraft()
    expect((await getCertification(d.id)).id).toBe(d.id)
    await expect(getCertification('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('publish gate lists missing fields, then publishes a complete record', async () => {
    const bare = await newDraft()
    const issues = await collectPublishIssues(bare.id)
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['authority', 'category', 'issued_date']))
    await expect(publishCertification(null, bare.id)).rejects.toBeInstanceOf(PublishValidationError)

    const complete = await newDraft({ authority: 'Trust Bank', category_id: categoryId, issued_date: new Date('2024-01-04T00:00:00Z') })
    const published = await publishCertification(null, complete.id)
    expect(published.content_status).toBe('published')
  })

  it('home seals require published records and a seal_label; sets order', async () => {
    // Unpublished draft cannot be a home seal.
    const draft = await newDraft({ seal_label: 'X' })
    await expect(setHomeSeals(null, { ordered_ids: [draft.id] })).rejects.toBeInstanceOf(ValidationError)

    // A published record without a seal_label is rejected.
    const noLabel = await newDraft({ authority: 'A', category_id: categoryId, issued_date: new Date('2024-01-01T00:00:00Z') })
    await publishCertification(null, noLabel.id)
    await expect(setHomeSeals(null, { ordered_ids: [noLabel.id] })).rejects.toBeInstanceOf(ValidationError)
  })

  it('soft-deletes and restores', async () => {
    const d = await newDraft()
    await softDeleteCertification(null, d.id)
    const list = await listCertifications({ q: PREFIX })
    expect(list.data.find((c) => c.id === d.id)).toBeUndefined()
    const restored = await restoreCertification(null, d.id)
    expect(restored.id).toBe(d.id)
  })

  it('public reads expose only published records with facets and home seals', async () => {
    const draft = await newDraft()
    const pub = await getPublishedCertifications({})
    expect(pub.data.every((c) => !('content_status' in c))).toBe(true)
    expect(pub.data.find((c) => c.id === draft.id)).toBeUndefined()
    expect(pub.meta.total).toBeGreaterThanOrEqual(13) // seeded directory

    const facets = await getCertificationFacets()
    expect(facets.categories.length).toBeGreaterThan(0)
    expect(facets.statuses.length).toBeGreaterThan(0)

    const seals = await getHomeSeals()
    expect(Array.isArray(seals.data)).toBe(true)
    expect(seals.data.length).toBeGreaterThanOrEqual(1) // seeded show-on-home subset
  })
})
