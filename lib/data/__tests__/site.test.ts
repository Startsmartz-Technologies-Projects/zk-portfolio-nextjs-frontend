import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'
import {
  coerceSettingValue,
  getCompanyProfile,
  updateCompanyProfile,
  getBrandAssets,
  updateBrandAssets,
  updateSetting,
  addTerm,
  updateTerm,
  reorderTerms,
  deleteTerm,
  mergeTerm,
} from '@/lib/data/site'

const hasDb = !!process.env.DATABASE_URL
const VOCAB = `test-vocab-${Math.floor(Math.random() * 1e9)}`
let vocabId = ''

// ── Pure setting coercion (no DB) ─────────────────────────────────────────

describe('coerceSettingValue', () => {
  it('coerces and bounds int settings', () => {
    expect(coerceSettingValue('int', 'max_featured_projects', 4)).toBe('4')
    expect(coerceSettingValue('int', 'max_featured_projects', '4')).toBe('4')
    expect(() => coerceSettingValue('int', 'max_featured_projects', 'three')).toThrow(ValidationError)
    expect(() => coerceSettingValue('int', 'max_featured_projects', 0)).toThrow(ValidationError) // max_* ≥ 1
  })
  it('validates bool and json', () => {
    expect(coerceSettingValue('bool', 'flag', true)).toBe('true')
    expect(() => coerceSettingValue('bool', 'flag', 'maybe')).toThrow(ValidationError)
    expect(coerceSettingValue('json', 'cfg', { a: 1 })).toBe('{"a":1}')
    expect(() => coerceSettingValue('json', 'cfg', '{bad')).toThrow(ValidationError)
  })
})

describe.skipIf(!hasDb)('site admin data layer (integration)', () => {
  beforeAll(async () => {
    const tax = await db.taxonomy.create({ data: { slug: VOCAB, label: 'Test Vocab', isShared: false } })
    vocabId = tax.id
  })

  afterAll(async () => {
    await db.taxonomy.deleteMany({ where: { slug: VOCAB } }) // cascade-deletes its terms
    await db.$disconnect()
  })

  // Company profile — error paths + idempotent no-op (safe under parallel runs).
  it('rejects a stale updated_at precondition (409)', async () => {
    await expect(updateCompanyProfile(null, { tagline: 'x', expectedUpdatedAt: new Date(0) })).rejects.toBeInstanceOf(
      ConflictError,
    )
  })

  it('updates the profile and preserves socials when not replaced', async () => {
    const before = await getCompanyProfile()
    const updated = await updateCompanyProfile(null, { tagline: before!.tagline ?? undefined })
    expect(updated.socialLinks).toHaveLength(before!.socialLinks.length)
    expect(updated.tagline).toBe(before!.tagline)
  })

  // Brand — alt-text gate (throws before mutating) + read.
  it('rejects a logo without alt text (422)', async () => {
    const favicon = await db.brandAsset.findUnique({ where: { key: 'favicon' } })
    // The favicon MediaAsset has no alt text — using it as logo_primary must fail.
    await expect(
      updateBrandAssets(null, {
        logoPrimaryId: favicon!.mediaId,
        logoFooterId: favicon!.mediaId,
        faviconId: favicon!.mediaId,
        ogDefaultId: null,
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('reads the four brand slots', async () => {
    const brand = await getBrandAssets()
    expect(brand.logo_primary).not.toBeNull()
    expect(brand.og_default).not.toBeNull()
  })

  // Settings — type/bound + not-found.
  it('rejects an unknown setting and a type mismatch', async () => {
    await expect(updateSetting(null, 'does_not_exist', '1')).rejects.toBeInstanceOf(NotFoundError)
    await expect(updateSetting(null, 'max_featured_projects', 'three')).rejects.toBeInstanceOf(ValidationError)
  })

  // Taxonomy term CRUD on the dedicated test vocabulary.
  it('adds terms (auto-slug) and rejects duplicates', async () => {
    const a = await addTerm(null, VOCAB, { label: 'Bridge Works' })
    expect(a.slug).toBe('bridge-works')
    expect(a.position).toBe(0)
    await expect(addTerm(null, VOCAB, { label: 'Bridge Works' })).rejects.toBeInstanceOf(ConflictError)
  })

  it('edits, deactivates, reorders, deletes, and merges terms', async () => {
    const t1 = await addTerm(null, VOCAB, { label: 'Road Works' })
    const t2 = await addTerm(null, VOCAB, { label: 'Earthwork' })

    const edited = await updateTerm(null, VOCAB, t1.id, { isActive: false, label: 'Road & Highway' })
    expect(edited.isActive).toBe(false)
    expect(edited.label).toBe('Road & Highway')

    const reordered = await reorderTerms(null, VOCAB, [t2.id, t1.id])
    expect(reordered.find((t) => t.id === t2.id)!.position).toBe(0)

    // deleteTerm allowed when unreferenced (0 consumers in Wave 2).
    await deleteTerm(null, VOCAB, t1.id)
    expect(await db.taxonomyTerm.findUnique({ where: { id: t1.id } })).toBeNull()

    // merge t2 into the first 'bridge-works' term.
    const bridge = await db.taxonomyTerm.findFirst({ where: { taxonomyId: vocabId, slug: 'bridge-works' } })
    const result = await mergeTerm(null, VOCAB, t2.id, bridge!.id)
    expect(result.into.id).toBe(bridge!.id)
    expect(await db.taxonomyTerm.findUnique({ where: { id: t2.id } })).toBeNull()
  })

  it('rejects merging a term into itself', async () => {
    const bridge = await db.taxonomyTerm.findFirst({ where: { taxonomyId: vocabId, slug: 'bridge-works' } })
    await expect(mergeTerm(null, VOCAB, bridge!.id, bridge!.id)).rejects.toBeInstanceOf(ValidationError)
  })
})
