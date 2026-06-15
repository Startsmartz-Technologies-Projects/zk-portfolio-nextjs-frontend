import { db } from '@/lib/db'
import { Prisma, type BrandAssetKey, type SettingType } from '@prisma/client'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'
import { TERM_SLUG_RE, type ProfileUpdateInput, type BrandUpdateInput, type CompanyStatsInput } from '@/lib/validation/site'

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Company profile (singleton) ───────────────────────────────────────────

export function getCompanyProfile() {
  return db.companyProfile.findFirst({ include: { socialLinks: { orderBy: { position: 'asc' } } } })
}

export async function updateCompanyProfile(actorId: string | null, input: ProfileUpdateInput) {
  const existing = await db.companyProfile.findFirst()
  if (!existing) throw new NotFoundError('Company profile is not initialized')

  if (input.expectedUpdatedAt && existing.updatedAt.getTime() !== input.expectedUpdatedAt.getTime()) {
    throw new ConflictError('Company profile was modified by someone else — reload and retry.', [{ rule: 'stale_updated_at' }])
  }

  const { socials, expectedUpdatedAt: _ignored, ...fields } = input
  return db.$transaction(async (tx) => {
    await tx.companyProfile.update({
      where: { id: existing.id },
      data: { ...fields, updatedById: actorId } satisfies Prisma.CompanyProfileUncheckedUpdateInput,
    })
    if (socials) {
      await tx.socialLink.deleteMany({ where: { profileId: existing.id } })
      if (socials.length > 0) {
        await tx.socialLink.createMany({
          data: socials.map((s, i) => ({ profileId: existing.id, platform: s.platform, url: s.url, position: s.position ?? i })),
        })
      }
    }
    return tx.companyProfile.findUniqueOrThrow({
      where: { id: existing.id },
      include: { socialLinks: { orderBy: { position: 'asc' } } },
    })
  })
}

// ── Brand assets ──────────────────────────────────────────────────────────

export async function getBrandAssets() {
  const rows = await db.brandAsset.findMany({ include: { media: true } })
  const slot = (k: BrandAssetKey) => rows.find((r) => r.key === k) ?? null
  return {
    logo_primary: slot('logo_primary'),
    logo_footer: slot('logo_footer'),
    favicon: slot('favicon'),
    og_default: slot('og_default'),
  }
}

export async function updateBrandAssets(_actorId: string | null, input: BrandUpdateInput) {
  const ids = [input.logoPrimaryId, input.logoFooterId, input.faviconId, input.ogDefaultId].filter(
    (id): id is string => !!id,
  )
  const assets = await db.mediaAsset.findMany({ where: { id: { in: ids }, deletedAt: null } })
  const byId = new Map(assets.map((a) => [a.id, a]))

  const require = (id: string, slot: string) => {
    const a = byId.get(id)
    if (!a) throw new ValidationError(`Selected MediaAsset for ${slot} does not exist`, [{ slot, id }])
    return a
  }
  const primary = require(input.logoPrimaryId, 'logo_primary')
  const footer = require(input.logoFooterId, 'logo_footer')
  require(input.faviconId, 'favicon')
  if (input.ogDefaultId) require(input.ogDefaultId, 'og_default')

  // Logos must carry alt text before they can be set (FR-SITE-007).
  if (!primary.altText?.trim()) throw new ValidationError('logo_primary requires alt text', [{ slot: 'logo_primary', rule: 'alt_text_required' }])
  if (!footer.altText?.trim()) throw new ValidationError('logo_footer requires alt text', [{ slot: 'logo_footer', rule: 'alt_text_required' }])

  const slots: [BrandAssetKey, string | null][] = [
    ['logo_primary', input.logoPrimaryId],
    ['logo_footer', input.logoFooterId],
    ['favicon', input.faviconId],
    ['og_default', input.ogDefaultId],
  ]
  await db.$transaction(
    slots.map(([key, mediaId]) =>
      mediaId
        ? db.brandAsset.upsert({ where: { key }, create: { key, mediaId }, update: { mediaId } })
        : db.brandAsset.deleteMany({ where: { key } }),
    ),
  )
  return getBrandAssets()
}

// ── Company stats (authored KPIs) ─────────────────────────────────────────

export function listCompanyStats() {
  return db.companyStat.findMany({ orderBy: { position: 'asc' } })
}

export async function replaceCompanyStats(_actorId: string | null, input: CompanyStatsInput) {
  await db.$transaction(async (tx) => {
    await tx.companyStat.deleteMany({})
    await tx.companyStat.createMany({
      data: input.stats.map((s, i) => ({ key: s.key, label: s.label, value: s.value, unit: s.unit ?? null, position: i })),
    })
  })
  return listCompanyStats()
}

// ── Typed settings ────────────────────────────────────────────────────────

export function listSettings() {
  return db.settingValue.findMany({ orderBy: { key: 'asc' } })
}

/** Coerce + validate a setting value against its declared type and documented bounds. */
export function coerceSettingValue(type: SettingType, key: string, raw: unknown): string {
  switch (type) {
    case 'int': {
      const n = typeof raw === 'number' ? raw : Number(raw)
      if (!Number.isInteger(n)) throw new ValidationError(`Setting '${key}' must be an integer`, [{ key, expected: 'int' }])
      if (key.startsWith('max_') && n < 1) throw new ValidationError(`Setting '${key}' must be ≥ 1`, [{ key, rule: 'min_1' }])
      return String(n)
    }
    case 'bool':
      if (typeof raw === 'boolean') return String(raw)
      if (raw === 'true' || raw === 'false') return raw
      throw new ValidationError(`Setting '${key}' must be a boolean`, [{ key, expected: 'bool' }])
    case 'json':
      try {
        return typeof raw === 'string' ? JSON.stringify(JSON.parse(raw)) : JSON.stringify(raw)
      } catch {
        throw new ValidationError(`Setting '${key}' must be valid JSON`, [{ key, expected: 'json' }])
      }
    case 'media':
    case 'string':
    default:
      if (typeof raw !== 'string') throw new ValidationError(`Setting '${key}' must be a string`, [{ key, expected: type }])
      return raw
  }
}

export async function updateSetting(_actorId: string | null, key: string, rawValue: unknown) {
  const setting = await db.settingValue.findUnique({ where: { key } })
  if (!setting) throw new NotFoundError(`Setting '${key}' not found`)
  const value = coerceSettingValue(setting.type, key, rawValue)
  return db.settingValue.update({ where: { key }, data: { value } })
}

// ── Taxonomy & term management ────────────────────────────────────────────

export function listTaxonomies() {
  return db.taxonomy.findMany({ orderBy: { slug: 'asc' } })
}

async function getTaxonomyOrThrow(slug: string) {
  const tax = await db.taxonomy.findUnique({ where: { slug } })
  if (!tax) throw new NotFoundError(`Taxonomy '${slug}' not found`)
  return tax
}

export async function listTerms(slug: string, opts: { includeInactive?: boolean } = {}) {
  const tax = await getTaxonomyOrThrow(slug)
  return db.taxonomyTerm.findMany({
    where: { taxonomyId: tax.id, ...(opts.includeInactive ? {} : { isActive: true }) },
    orderBy: { position: 'asc' },
  })
}

export async function addTerm(_actorId: string | null, slug: string, input: { label: string; slug?: string; position?: number }) {
  const tax = await getTaxonomyOrThrow(slug)
  const termSlug = input.slug ?? slugify(input.label)
  if (!TERM_SLUG_RE.test(termSlug)) throw new ValidationError('Invalid term slug', [{ slug: termSlug }])

  const dupe = await db.taxonomyTerm.findUnique({ where: { taxonomyId_slug: { taxonomyId: tax.id, slug: termSlug } } })
  if (dupe) throw new ConflictError(`Term '${termSlug}' already exists in '${slug}'`, [{ slug: termSlug }])

  const position = input.position ?? (await db.taxonomyTerm.count({ where: { taxonomyId: tax.id } }))
  return db.taxonomyTerm.create({ data: { taxonomyId: tax.id, slug: termSlug, label: input.label, position, isActive: true } })
}

export async function updateTerm(
  _actorId: string | null,
  slug: string,
  termId: string,
  input: { label?: string; slug?: string; isActive?: boolean },
) {
  const tax = await getTaxonomyOrThrow(slug)
  const term = await db.taxonomyTerm.findFirst({ where: { id: termId, taxonomyId: tax.id } })
  if (!term) throw new NotFoundError('Term not found')

  if (input.slug && input.slug !== term.slug) {
    const dupe = await db.taxonomyTerm.findUnique({ where: { taxonomyId_slug: { taxonomyId: tax.id, slug: input.slug } } })
    if (dupe) throw new ConflictError(`Term '${input.slug}' already exists in '${slug}'`, [{ slug: input.slug }])
  }
  return db.taxonomyTerm.update({ where: { id: termId }, data: input })
}

export async function reorderTerms(_actorId: string | null, slug: string, orderedIds: string[]) {
  const tax = await getTaxonomyOrThrow(slug)
  const terms = await db.taxonomyTerm.findMany({ where: { taxonomyId: tax.id }, select: { id: true } })
  const known = new Set(terms.map((t) => t.id))
  for (const id of orderedIds) {
    if (!known.has(id)) throw new ValidationError(`Term ${id} is not in '${slug}'`, [{ id }])
  }
  await db.$transaction(orderedIds.map((id, i) => db.taxonomyTerm.update({ where: { id }, data: { position: i } })))
  return listTerms(slug, { includeInactive: true })
}

// Reference usage across consuming content modules (Projects/Blog/News/Cert — Wave 3).
// No consumer tables exist yet, so this is 0; each content module wires its references
// in here when it lands (FR-SITE-013). Until then delete is always permitted.
async function countTermReferences(_termId: string): Promise<number> {
  return 0
}
async function repointTermReferences(_fromTermId: string, _toTermId: string): Promise<number> {
  return 0
}

export async function deleteTerm(_actorId: string | null, slug: string, termId: string): Promise<void> {
  const tax = await getTaxonomyOrThrow(slug)
  const term = await db.taxonomyTerm.findFirst({ where: { id: termId, taxonomyId: tax.id } })
  if (!term) throw new NotFoundError('Term not found')

  const refs = await countTermReferences(termId)
  if (refs > 0) {
    throw new ConflictError(`Term is referenced by ${refs} published record(s); deactivate or merge instead.`, [
      { rule: 'term_in_use', count: refs },
    ])
  }
  await db.taxonomyTerm.delete({ where: { id: termId } })
}

export async function mergeTerm(_actorId: string | null, slug: string, termId: string, intoTermId: string) {
  if (termId === intoTermId) throw new ValidationError('Cannot merge a term into itself')
  const tax = await getTaxonomyOrThrow(slug)
  const [source, target] = await Promise.all([
    db.taxonomyTerm.findFirst({ where: { id: termId, taxonomyId: tax.id } }),
    db.taxonomyTerm.findFirst({ where: { id: intoTermId, taxonomyId: tax.id } }),
  ])
  if (!source || !target) throw new NotFoundError('Source or target term not found')

  const repointed = await repointTermReferences(termId, intoTermId)
  await db.taxonomyTerm.delete({ where: { id: termId } })
  return { into: target, repointed }
}
