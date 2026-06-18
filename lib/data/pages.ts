import { db } from '@/lib/db'
import { Prisma, type MediaAsset, type PageKey, type SectionType } from '@prisma/client'
import { NotFoundError, ValidationError, PublishValidationError } from '@/lib/errors'
import { mediaRefOf, type MediaRef } from '@/lib/data/media'
import { isSectionTypePermitted, pageKeyToPublic, publicToPageKey } from '@/lib/pages/permitted-section-types'
import type { UpdatePageInput, SectionInput, ItemInput, AddSectionInput, UpdateSectionInput, ReorderSectionsInput, ReplaceItemsInput } from '@/lib/validation/pages'

// Pages admin + published-read data layer (pages-be-2). Fixed 8-page set (no create/
// delete — BR-1). Admin spans draft+published; the public read returns published
// pages with **visible** sections only and resolves stat values + collection source
// keys (BR-3/BR-4). Pages live at their `path` (`/`, `/about`, `/projects`, …).

export const PAGES_TAG = 'pages'

function pageKeyOrThrow(publicKey: string): PageKey {
  const key = publicToPageKey(publicKey)
  if (!key) throw new NotFoundError(`Unknown page '${publicKey}'`)
  return key
}

// ── Serialization ───────────────────────────────────────────────────────────

function mediaRef(m: MediaAsset | null): MediaRef | null {
  return m ? mediaRefOf(m) : null
}
function cta(label: string | null, url: string | null): { label: string; url: string } | null {
  return label && url ? { label, url } : label || url ? { label: label ?? '', url: url ?? '' } : null
}

const sectionInclude = { backgroundImage: true, items: { orderBy: { position: 'asc' }, include: { image: true } } } satisfies Prisma.PageSectionInclude
const pageInclude = { seoOgImage: true, sections: { orderBy: { position: 'asc' }, include: sectionInclude } } satisfies Prisma.PageInclude
type SectionRow = Prisma.PageSectionGetPayload<{ include: typeof sectionInclude }>
type PageRow = Prisma.PageGetPayload<{ include: typeof pageInclude }>
type ItemRow = SectionRow['items'][number]

function toItemAdmin(i: ItemRow) {
  return {
    id: i.id,
    position: i.position,
    icon: i.icon,
    image: mediaRef(i.image),
    tag: i.tag,
    title: i.title,
    subtitle: i.subtitle,
    body: i.body,
    value: i.value,
    unit: i.unit,
    stat_key: i.statKey,
    is_active: i.isActive,
    link_url: i.linkUrl,
    link_label: i.linkLabel,
    meta: i.meta,
  }
}

function toSectionAdmin(s: SectionRow) {
  return {
    id: s.id,
    type: s.type,
    position: s.position,
    is_visible: s.isVisible,
    eyebrow: s.eyebrow,
    heading: s.heading,
    subheading: s.subheading,
    body: s.body,
    variant: s.variant,
    background_image: mediaRef(s.backgroundImage),
    cta_primary: cta(s.ctaPrimaryLabel, s.ctaPrimaryUrl),
    cta_secondary: cta(s.ctaSecondaryLabel, s.ctaSecondaryUrl),
    max_items: s.maxItems,
    source_key: s.sourceKey,
    settings: s.settings,
    items: s.items.map(toItemAdmin),
  }
}

function seoOf(p: PageRow) {
  return {
    meta_title: p.seoMetaTitle,
    meta_description: p.seoMetaDescription,
    canonical_url: p.seoCanonicalUrl,
    og_image: p.seoOgImage ? mediaRefOf(p.seoOgImage) : null,
    og_title: p.seoOgTitle,
    og_description: p.seoOgDescription,
    noindex: p.seoNoindex,
  }
}

function toPageAdmin(p: PageRow) {
  return {
    id: p.id,
    key: pageKeyToPublic(p.key),
    path: p.path,
    admin_title: p.adminTitle,
    content_status: p.status,
    seo: seoOf(p),
    sections: p.sections.map(toSectionAdmin),
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    published_at: p.publishedAt,
  }
}

// ── Stat resolution (FR-PAGES-018, BR-3) ───────────────────────────────────

interface StatResolver {
  resolve(statKey: string): { value: string; unit: string } | null
}
async function buildStatResolver(): Promise<StatResolver> {
  const [profile, companyStats, projStats] = await Promise.all([
    db.companyProfile.findFirst({ select: { establishmentYear: true } }),
    db.companyStat.findMany({ select: { key: true, value: true, unit: true } }),
    import('@/lib/data/projects').then((m) => m.getProjectStats()),
  ])
  const byKey = new Map(companyStats.map((s) => [s.key, { value: s.value, unit: s.unit ?? '' }]))
  const year = new Date().getUTCFullYear()
  return {
    resolve(statKey: string) {
      if (statKey === 'years_experience') {
        if (!profile?.establishmentYear) return null
        return { value: String(year - profile.establishmentYear + 1), unit: '+' }
      }
      if (statKey === 'projects_count') return { value: String(projStats.total_projects), unit: '+' }
      if (statKey === 'districts_covered') return { value: String(projStats.districts_covered), unit: '' }
      return byKey.get(statKey) ?? null
    },
  }
}

function toSectionPublic(s: SectionRow, stats: StatResolver) {
  const base = {
    type: s.type,
    eyebrow: s.eyebrow,
    heading: s.heading,
    subheading: s.subheading,
    body: s.body,
    variant: s.variant,
    background_image: mediaRef(s.backgroundImage),
    cta_primary: cta(s.ctaPrimaryLabel, s.ctaPrimaryUrl),
    cta_secondary: cta(s.ctaSecondaryLabel, s.ctaSecondaryUrl),
    settings: s.settings,
  }
  // Collection-backed sections: chrome + source key + cap (records fetched by web layer).
  if (s.sourceKey) return { ...base, source_key: s.sourceKey, max_items: s.maxItems }
  // Stat sections: resolve each item's value/unit; omit unresolvable (edge 5/6).
  if (s.type === 'stat_strip' || s.type === 'achievements') {
    const items = s.items
      .map((i) => {
        const r = i.statKey ? stats.resolve(i.statKey) : i.value ? { value: i.value, unit: i.unit ?? '' } : null
        return r ? { stat_key: i.statKey, label: i.title, sublabel: i.subtitle, value: r.value, unit: r.unit } : null
      })
      .filter(Boolean)
    return { ...base, items }
  }
  // Story: mixed items — stat items (statKey) get their value/unit resolved in place;
  // collage image items pass through unchanged.
  if (s.type === 'story') {
    const items = s.items.map((i) => {
      const item = toItemAdmin(i)
      if (i.statKey) {
        const r = stats.resolve(i.statKey)
        if (r) return { ...item, value: r.value, unit: r.unit }
      }
      return item
    })
    return { ...base, items }
  }
  return { ...base, items: s.items.map(toItemAdmin) }
}

// ── Admin reads ────────────────────────────────────────────────────────────

export async function listPages() {
  const rows = await db.page.findMany({
    orderBy: { key: 'asc' },
    select: { key: true, path: true, adminTitle: true, status: true, updatedAt: true, _count: { select: { sections: true } } },
  })
  return {
    data: rows.map((r) => ({ key: pageKeyToPublic(r.key), path: r.path, admin_title: r.adminTitle, content_status: r.status, section_count: r._count.sections, updated_at: r.updatedAt })),
  }
}

export async function getPage(publicKey: string) {
  const key = pageKeyOrThrow(publicKey)
  const p = await db.page.findUnique({ where: { key }, include: pageInclude })
  if (!p) throw new NotFoundError('Page not found')
  return toPageAdmin(p)
}

// ── Update (SEO + full sections replace) ───────────────────────────────────

function seoData(input: NonNullable<UpdatePageInput['seo']>): Prisma.PageUncheckedUpdateInput {
  const d: Prisma.PageUncheckedUpdateInput = {}
  if (input.meta_title !== undefined) d.seoMetaTitle = input.meta_title
  if (input.meta_description !== undefined) d.seoMetaDescription = input.meta_description
  if (input.canonical_url !== undefined) d.seoCanonicalUrl = input.canonical_url
  if (input.og_image_id !== undefined) d.seoOgImageId = input.og_image_id
  if (input.og_title !== undefined) d.seoOgTitle = input.og_title
  if (input.og_description !== undefined) d.seoOgDescription = input.og_description
  if (input.noindex !== undefined && input.noindex !== null) d.seoNoindex = input.noindex
  return d
}

function sectionData(key: PageKey, s: SectionInput, position: number): Prisma.PageSectionUncheckedCreateWithoutPageInput {
  if (!isSectionTypePermitted(key, s.type)) {
    throw new ValidationError(`Section type '${s.type}' is not permitted on page '${pageKeyToPublic(key)}'`, [{ field: 'type', type: s.type }])
  }
  return {
    type: s.type,
    position,
    isVisible: s.is_visible ?? true,
    eyebrow: s.eyebrow ?? null,
    heading: s.heading ?? null,
    subheading: s.subheading ?? null,
    body: s.body ?? null,
    variant: s.variant ?? null,
    backgroundImageId: s.background_image_id ?? null,
    ctaPrimaryLabel: s.cta_primary?.label ?? null,
    ctaPrimaryUrl: s.cta_primary?.url ?? null,
    ctaSecondaryLabel: s.cta_secondary?.label ?? null,
    ctaSecondaryUrl: s.cta_secondary?.url ?? null,
    maxItems: s.max_items ?? null,
    sourceKey: s.source_key ?? null,
    settings: (s.settings as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    items: s.items ? { create: s.items.map((it, i) => itemData(it, i)) } : undefined,
  }
}

function itemData(it: ItemInput, position: number): Prisma.SectionItemUncheckedCreateWithoutSectionInput {
  return {
    position,
    icon: it.icon ?? null,
    imageId: it.image_id ?? null,
    tag: it.tag ?? null,
    title: it.title ?? null,
    subtitle: it.subtitle ?? null,
    body: it.body ?? null,
    value: it.value ?? null,
    unit: it.unit ?? null,
    statKey: it.stat_key ?? null,
    isActive: it.is_active ?? false,
    linkUrl: it.link_url ?? null,
    linkLabel: it.link_label ?? null,
    meta: (it.meta as Prisma.InputJsonValue) ?? Prisma.JsonNull,
  }
}

export async function updatePage(actorId: string | null, publicKey: string, input: UpdatePageInput) {
  const key = pageKeyOrThrow(publicKey)
  const existing = await db.page.findUnique({ where: { key }, select: { id: true } })
  if (!existing) throw new NotFoundError('Page not found')

  await db.$transaction(async (tx) => {
    const data: Prisma.PageUncheckedUpdateInput = { updatedById: actorId, ...(input.seo ? seoData(input.seo) : {}) }
    await tx.page.update({ where: { id: existing.id }, data })
    if (input.sections) {
      await tx.pageSection.deleteMany({ where: { pageId: existing.id } })
      for (const [i, s] of input.sections.entries()) {
        await tx.pageSection.create({ data: { pageId: existing.id, ...sectionData(key, s, i) } })
      }
    }
  })
  return getPage(publicKey)
}

// ── Section & item sub-resources ───────────────────────────────────────────

export async function addSection(actorId: string | null, publicKey: string, input: AddSectionInput) {
  const key = pageKeyOrThrow(publicKey)
  if (!isSectionTypePermitted(key, input.type)) {
    throw new ValidationError(`Section type '${input.type}' is not permitted on page '${publicKey}'`, [{ field: 'type', permitted: true }])
  }
  const page = await db.page.findUnique({ where: { key }, select: { id: true } })
  if (!page) throw new NotFoundError('Page not found')
  const position = input.position ?? ((await db.pageSection.aggregate({ where: { pageId: page.id }, _max: { position: true } }))._max.position ?? -1) + 1
  await db.pageSection.create({ data: { pageId: page.id, type: input.type, position } })
  await db.page.update({ where: { id: page.id }, data: { updatedById: actorId } })
  return getPage(publicKey)
}

async function loadSection(publicKey: string, sectionId: string) {
  const key = pageKeyOrThrow(publicKey)
  const section = await db.pageSection.findFirst({ where: { id: sectionId, page: { key } }, select: { id: true, pageId: true } })
  if (!section) throw new NotFoundError('Section not found')
  return section
}

export async function updateSection(actorId: string | null, publicKey: string, sectionId: string, input: UpdateSectionInput) {
  const section = await loadSection(publicKey, sectionId)
  const data: Prisma.PageSectionUncheckedUpdateInput = {}
  if (input.is_visible !== undefined) data.isVisible = input.is_visible
  if (input.eyebrow !== undefined) data.eyebrow = input.eyebrow
  if (input.heading !== undefined) data.heading = input.heading
  if (input.subheading !== undefined) data.subheading = input.subheading
  if (input.body !== undefined) data.body = input.body
  if (input.variant !== undefined) data.variant = input.variant
  if (input.background_image_id !== undefined) data.backgroundImageId = input.background_image_id
  if (input.cta_primary !== undefined) {
    data.ctaPrimaryLabel = input.cta_primary?.label ?? null
    data.ctaPrimaryUrl = input.cta_primary?.url ?? null
  }
  if (input.cta_secondary !== undefined) {
    data.ctaSecondaryLabel = input.cta_secondary?.label ?? null
    data.ctaSecondaryUrl = input.cta_secondary?.url ?? null
  }
  if (input.max_items !== undefined) data.maxItems = input.max_items
  if (input.source_key !== undefined) data.sourceKey = input.source_key
  if (input.settings !== undefined) data.settings = (input.settings as Prisma.InputJsonValue) ?? Prisma.JsonNull
  await db.pageSection.update({ where: { id: section.id }, data })
  await db.page.update({ where: { id: section.pageId }, data: { updatedById: actorId } })
  return getPage(publicKey)
}

export async function deleteSection(actorId: string | null, publicKey: string, sectionId: string) {
  const section = await loadSection(publicKey, sectionId)
  await db.pageSection.delete({ where: { id: section.id } })
  await db.page.update({ where: { id: section.pageId }, data: { updatedById: actorId } })
  return getPage(publicKey)
}

export async function reorderSections(actorId: string | null, publicKey: string, input: ReorderSectionsInput) {
  const key = pageKeyOrThrow(publicKey)
  const page = await db.page.findUnique({ where: { key }, select: { id: true, sections: { select: { id: true } } } })
  if (!page) throw new NotFoundError('Page not found')
  const known = new Set(page.sections.map((s) => s.id))
  if (input.ordered_ids.length !== known.size || input.ordered_ids.some((id) => !known.has(id))) {
    throw new ValidationError('ordered_ids must be the complete section set for this page', [{ field: 'ordered_ids' }])
  }
  await db.$transaction([
    ...input.ordered_ids.map((id, i) => db.pageSection.update({ where: { id }, data: { position: i } })),
    db.page.update({ where: { id: page.id }, data: { updatedById: actorId } }),
  ])
  return getPage(publicKey)
}

export async function replaceItems(actorId: string | null, publicKey: string, sectionId: string, input: ReplaceItemsInput) {
  const section = await loadSection(publicKey, sectionId)
  await db.$transaction([
    db.sectionItem.deleteMany({ where: { sectionId: section.id } }),
    ...input.items.map((it, i) => db.sectionItem.create({ data: { sectionId: section.id, ...itemData(it, i) } })),
    db.page.update({ where: { id: section.pageId }, data: { updatedById: actorId } }),
  ])
  return getPage(publicKey)
}

// ── Publishing & workflow ──────────────────────────────────────────────────

const REQUIRES_ITEMS: SectionType[] = ['stat_strip', 'achievements', 'expertise_cards', 'timeline', 'mvv', 'why_us', 'testimonials', 'intent_cards']

export async function collectPublishIssues(publicKey: string): Promise<{ section: string; field: string; issue: string }[]> {
  const key = pageKeyOrThrow(publicKey)
  const p = await db.page.findUnique({ where: { key }, include: pageInclude })
  if (!p) throw new NotFoundError('Page not found')
  const issues: { section: string; field: string; issue: string }[] = []
  for (const s of p.sections) {
    if (!s.isVisible) continue // hidden sections tolerate missing content (BR-7)
    const name = s.type
    // Required chrome per type (§12 / edge 2).
    if (s.type === 'hero' && !s.heading?.trim()) issues.push({ section: name, field: 'heading', issue: 'required' })
    if ((s.type === 'cta_banner' || s.type === 'final_cta') && !(s.ctaPrimaryLabel?.trim() && s.ctaPrimaryUrl?.trim())) issues.push({ section: name, field: 'cta_primary', issue: 'required' })
    if (s.sourceKey === null && REQUIRES_ITEMS.includes(s.type) && s.items.length === 0) issues.push({ section: name, field: 'items', issue: 'at least one item required' })
    if (s.type.startsWith('featured_') && !s.sourceKey) issues.push({ section: name, field: 'source_key', issue: 'required' })
    // Alt text on visible referenced media (§14 / edge 3).
    if (s.backgroundImage && (!s.backgroundImage.altText?.trim() || s.backgroundImage.deletedAt)) issues.push({ section: name, field: 'background_image.alt', issue: 'alt text required' })
    s.items.forEach((it, i) => {
      if (it.image && (!it.image.altText?.trim() || it.image.deletedAt)) issues.push({ section: name, field: `items[${i}].image.alt`, issue: 'alt text required' })
    })
  }
  return issues
}

export async function publishPage(actorId: string | null, publicKey: string) {
  const key = pageKeyOrThrow(publicKey)
  const existing = await db.page.findUnique({ where: { key }, select: { id: true, publishedAt: true } })
  if (!existing) throw new NotFoundError('Page not found')
  const issues = await collectPublishIssues(publicKey)
  if (issues.length) throw new PublishValidationError(issues, 'Page cannot be published.')
  await db.page.update({ where: { id: existing.id }, data: { status: 'published', publishedAt: existing.publishedAt ?? new Date(), updatedById: actorId } })
  return getPage(publicKey)
}

export async function unpublishPage(actorId: string | null, publicKey: string) {
  const key = pageKeyOrThrow(publicKey)
  const existing = await db.page.findUnique({ where: { key }, select: { id: true } })
  if (!existing) throw new NotFoundError('Page not found')
  await db.page.update({ where: { id: existing.id }, data: { status: 'draft', updatedById: actorId } })
  return getPage(publicKey)
}

export async function getPreviewUrl(publicKey: string): Promise<{ preview_url: string }> {
  const key = pageKeyOrThrow(publicKey)
  const p = await db.page.findUnique({ where: { key }, select: { id: true, path: true } })
  if (!p) throw new NotFoundError('Page not found')
  const { createHmac } = await import('node:crypto')
  const exp = Date.now() + 1000 * 60 * 30
  const sig = createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-secret').update(`${p.id}.${exp}`).digest('hex').slice(0, 32)
  // Relative URL — resolves against the current origin (localhost in dev, live host in
  // prod). Don't prefix metadataBase: it points at the production domain and would send
  // local previews to the live site.
  return { preview_url: `${p.path}?preview=${exp}.${sig}` }
}

export const PAGES_REVALIDATE_TAG = PAGES_TAG

// ── Public reads (published only) ──────────────────────────────────────────

export async function getPublishedPages() {
  const rows = await db.page.findMany({ where: { status: 'published', deletedAt: null }, select: { key: true, path: true, seoCanonicalUrl: true, seoNoindex: true } })
  return { data: rows.map((r) => ({ key: pageKeyToPublic(r.key), path: r.path, seo: { canonical_url: r.seoCanonicalUrl, noindex: r.seoNoindex } })) }
}

export async function getPublishedPage(publicKey: string) {
  const key = publicToPageKey(publicKey)
  if (!key) return null
  const p = await db.page.findFirst({ where: { key, status: 'published', deletedAt: null }, include: pageInclude })
  if (!p) return null
  const stats = await buildStatResolver()
  return {
    key: pageKeyToPublic(p.key),
    path: p.path,
    seo: seoOf(p),
    sections: p.sections.filter((s) => s.isVisible).map((s) => toSectionPublic(s, stats)),
  }
}

// ── Cross-module wiring (consumed by SEO sitemap/redirect stubs) ───────────

export async function getPublishedPageSitemapEntries(): Promise<{ loc: string; lastmod: string }[]> {
  const rows = await db.page.findMany({ where: { status: 'published', deletedAt: null, seoNoindex: false }, select: { path: true, updatedAt: true } })
  return rows.map((r) => ({ loc: r.path, lastmod: r.updatedAt.toISOString() }))
}

export async function isPublishedPagePath(path: string): Promise<boolean> {
  const row = await db.page.findFirst({ where: { path, status: 'published', deletedAt: null }, select: { id: true } })
  return !!row
}
