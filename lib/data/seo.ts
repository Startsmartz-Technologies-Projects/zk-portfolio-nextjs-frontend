import { db } from '@/lib/db'
import type { Prisma, RedirectSource, RobotsPolicy } from '@prisma/client'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { collapseChain, normalizePath, RedirectConflictError } from '@/lib/seo/redirects'
import type { SeoSettingsUpdateInput } from '@/lib/validation/seo'

// ── Global SEO defaults (singleton) ───────────────────────────────────────

export function getSeoSettings() {
  return db.seoSettings.findFirst()
}

export async function updateSeoSettings(actorId: string | null, input: SeoSettingsUpdateInput) {
  const existing = await db.seoSettings.findFirst()
  if (!existing) throw new NotFoundError('SEO settings are not initialized')

  if (input.defaultOgImageId) {
    const asset = await db.mediaAsset.findFirst({ where: { id: input.defaultOgImageId, deletedAt: null } })
    if (!asset) throw new ValidationError('default_og_image MediaAsset not found', [{ field: 'defaultOgImageId' }])
    if (asset.resourceType !== 'image') throw new ValidationError('default_og_image must be an image', [{ field: 'defaultOgImageId' }])
  }

  return db.seoSettings.update({
    where: { id: existing.id },
    data: { ...input, updatedById: actorId } satisfies Prisma.SeoSettingsUncheckedUpdateInput,
  })
}

// ── Redirects ─────────────────────────────────────────────────────────────

export interface RedirectFilters {
  source?: RedirectSource
  active?: boolean
  q?: string
}

export function listRedirects(filters: RedirectFilters = {}) {
  const where: Prisma.RedirectWhereInput = {}
  if (filters.source) where.source = filters.source
  if (filters.active !== undefined) where.isActive = filters.active
  if (filters.q) where.OR = [{ fromPath: { contains: filters.q } }, { toPath: { contains: filters.q } }]
  return db.redirect.findMany({ where, orderBy: { createdAt: 'desc' } })
}

// Whether a path is a live, published content URL (FR-SEO-010 collision guard).
// Each content module contributes its published-URL check as it lands. Dynamic
// import avoids a static cycle (projects.ts → recordRedirect here).
async function isLivePublishedUrl(path: string): Promise<boolean> {
  const [{ isPublishedProjectPath }, { isPublishedServicePath }, { isPublishedArticlePath }] = await Promise.all([
    import('@/lib/data/projects'),
    import('@/lib/data/services'),
    import('@/lib/data/blog'),
  ])
  if (await isPublishedProjectPath(path)) return true
  if (await isPublishedServicePath(path)) return true
  if (await isPublishedArticlePath(path)) return true
  return false
}

export interface CreateRedirectInput {
  fromPath: string
  toPath: string
  status?: 'permanent' | 'temporary'
  source?: 'system' | 'manual'
  note?: string | null
}

/**
 * Create (or, for `system`, upsert) a redirect with loop/chain/collision guards
 * (FR-SEO-008/009/010, BR-4). Collapses chains so nothing served exceeds one hop.
 */
export async function createRedirect(actorId: string | null, input: CreateRedirectInput) {
  const fromPath = normalizePath(input.fromPath)
  const toPath = normalizePath(input.toPath)
  const source = input.source ?? 'manual'
  const status = input.status ?? 'permanent'

  if (await isLivePublishedUrl(fromPath)) {
    throw new RedirectConflictError('from_path collides with a live published URL', [{ rule: 'live_url', path: fromPath }])
  }

  const existingFrom = await db.redirect.findUnique({ where: { fromPath } })
  if (existingFrom && source === 'manual') {
    throw new RedirectConflictError(`A redirect from '${fromPath}' already exists`, [{ rule: 'duplicate_from' }])
  }

  const all = await db.redirect.findMany({ select: { fromPath: true, toPath: true } })
  const { toPath: finalTo, repoint } = collapseChain(fromPath, toPath, all)

  return db.$transaction(async (tx) => {
    const redirect = await tx.redirect.upsert({
      where: { fromPath },
      create: { fromPath, toPath: finalTo, status, source, note: input.note ?? null, createdById: actorId, updatedById: actorId },
      update: { toPath: finalTo, status, source, note: input.note ?? null, updatedById: actorId },
    })
    for (const r of repoint) {
      await tx.redirect.update({ where: { fromPath: r.fromPath }, data: { toPath: r.toPath, updatedById: actorId } })
    }
    return redirect
  })
}

/** System redirect recorded by content modules on slug change (FR-SEO-008). */
export function recordRedirect(fromPath: string, toPath: string, actorId: string | null = null) {
  return createRedirect(actorId, { fromPath, toPath, status: 'permanent', source: 'system' })
}

export async function updateRedirect(
  actorId: string | null,
  id: string,
  input: { toPath?: string; status?: 'permanent' | 'temporary'; isActive?: boolean; note?: string | null },
) {
  const existing = await db.redirect.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Redirect not found')
  const data: Prisma.RedirectUncheckedUpdateInput = { updatedById: actorId }
  if (input.toPath !== undefined) data.toPath = normalizePath(input.toPath)
  if (input.status !== undefined) data.status = input.status
  if (input.isActive !== undefined) data.isActive = input.isActive
  if (input.note !== undefined) data.note = input.note
  return db.redirect.update({ where: { id }, data })
}

export async function deleteRedirect(_actorId: string | null, id: string): Promise<void> {
  const existing = await db.redirect.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Redirect not found')
  await db.redirect.delete({ where: { id } })
}

// ── Structured data (JSON-LD) ─────────────────────────────────────────────

/** Resolve the schema.org Organization object from SITE CompanyProfile (BR-6, edge 8). */
export async function resolveOrganization() {
  const [profile, logo, settings] = await Promise.all([
    db.companyProfile.findFirst({ include: { socialLinks: { orderBy: { position: 'asc' } } } }),
    db.brandAsset.findUnique({ where: { key: 'logo_primary' }, include: { media: true } }),
    db.seoSettings.findFirst(),
  ])
  if (!profile) return null

  const sameAs = profile.socialLinks.map((s) => s.url).filter((u) => u && u !== '#')
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: profile.name,
    ...(profile.legalName ? { legalName: profile.legalName } : {}),
    ...(settings?.metadataBase ? { url: settings.metadataBase } : {}),
    ...(logo?.media?.url ? { logo: logo.media.url } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: profile.email,
      telephone: profile.phone,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

export async function getJsonldConfig() {
  const settings = await db.seoSettings.findFirst()
  return {
    enabledTypes: settings?.jsonldTypes ?? [],
    organization: await resolveOrganization(),
  }
}

export async function updateJsonldTypes(actorId: string | null, enabledTypes: string[]) {
  const existing = await db.seoSettings.findFirst()
  if (!existing) throw new NotFoundError('SEO settings are not initialized')
  return db.seoSettings.update({ where: { id: existing.id }, data: { jsonldTypes: enabledTypes, updatedById: actorId } })
}

// ── Sitemap preview ───────────────────────────────────────────────────────

export interface SitemapEntry {
  loc: string
  lastmod: string
}

/**
 * Indexable (published, non-noindex, non-deleted) URL set (FR-SEO-012/013). Pull-based
 * across content collections + PAGES — none exist yet (Wave 3), so the set is empty;
 * each content module contributes its published URLs here when it lands.
 */
export async function getSitemapPreview(opts: { page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, Math.trunc(opts.page ?? 1))
  const pageSize = Math.min(1000, Math.max(1, Math.trunc(opts.pageSize ?? 100)))
  const entries = await getPublicSitemap()
  return { data: entries.slice((page - 1) * pageSize, page * pageSize), meta: { page, pageSize, total: entries.length } }
}

// ── Public reads (seo-be-3) — feed app/sitemap.ts, app/robots.ts, layout, middleware ──

export const OG_PLACEHOLDER_PATH = '/og-default.png'

export interface PublicMediaRef {
  id: string | null
  url: string
  alt: string | null
  width: number | null
  height: number | null
}

/** Resolve the default OG image to a MediaRef, or null if missing/withdrawn (edge 7). */
export async function resolveOgMediaRef(ogImageId: string | null): Promise<PublicMediaRef | null> {
  if (!ogImageId) return null
  const asset = await db.mediaAsset.findFirst({ where: { id: ogImageId, deletedAt: null } })
  if (!asset) return null
  return { id: asset.id, url: asset.url, alt: asset.altText, width: asset.width, height: asset.height }
}

/**
 * The public SEO defaults bundle for the root layout (FR-SEO-007/016/018): title
 * template, default description, metadataBase, default OG (MediaRef, placeholder if
 * the asset is missing — edge 7), twitter handle, robots policy, verification tokens,
 * the SITE-sourced Organization JSON-LD, and the enabled JSON-LD types.
 */
export async function getPublicSeoDefaults() {
  const settings = await db.seoSettings.findFirst()
  const organization = await resolveOrganization()
  if (!settings) {
    return {
      site_title_template: '%s',
      default_meta_description: '',
      metadata_base: '',
      default_og_image: null,
      twitter_handle: null,
      default_robots: 'index_follow' as RobotsPolicy,
      google_site_verification: null,
      bing_site_verification: null,
      organization,
      enabled_jsonld_types: [] as string[],
    }
  }
  const ogRef = await resolveOgMediaRef(settings.defaultOgImageId)
  const ogPlaceholder: PublicMediaRef = {
    id: null,
    url: `${settings.metadataBase.replace(/\/$/, '')}${OG_PLACEHOLDER_PATH}`,
    alt: null,
    width: null,
    height: null,
  }
  return {
    site_title_template: settings.siteTitleTemplate,
    default_meta_description: settings.defaultMetaDescription,
    metadata_base: settings.metadataBase,
    default_og_image: ogRef ?? ogPlaceholder,
    twitter_handle: settings.twitterHandle,
    default_robots: settings.defaultRobots,
    google_site_verification: settings.googleSiteVerification,
    bing_site_verification: settings.bingSiteVerification,
    organization,
    enabled_jsonld_types: settings.jsonldTypes,
  }
}

export interface RobotsConfig {
  rules: { userAgent: string; allow?: string; disallow?: string }[]
  sitemap: string
  discourageIndexing: boolean
}

/** Build the robots policy from the default-robots setting (FR-SEO-015, edge 9). Pure. */
export function buildRobots(defaultRobots: RobotsPolicy, metadataBase: string): RobotsConfig {
  const base = metadataBase.replace(/\/$/, '')
  const sitemap = `${base}/sitemap.xml`
  if (defaultRobots === 'noindex_nofollow') {
    return { rules: [{ userAgent: '*', disallow: '/' }], sitemap, discourageIndexing: true }
  }
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap, discourageIndexing: false }
}

export async function getPublicRobots(): Promise<RobotsConfig> {
  const settings = await db.seoSettings.findFirst()
  return buildRobots(settings?.defaultRobots ?? 'index_follow', settings?.metadataBase ?? '')
}

/**
 * Assemble the indexable (published, non-noindex, non-deleted) URL set across content
 * collections + PAGES (FR-SEO-012/013, BR-3). Pull-based — each content module
 * contributes its published URLs here as it lands (dynamic import avoids a static
 * cycle with the modules that call `recordRedirect`).
 */
export async function getPublicSitemap(): Promise<SitemapEntry[]> {
  const [{ getPublishedProjectSitemapEntries }, { getPublishedServiceSitemapEntries }, { getPublishedArticleSitemapEntries }] = await Promise.all([
    import('@/lib/data/projects'),
    import('@/lib/data/services'),
    import('@/lib/data/blog'),
  ])
  const groups = await Promise.all([getPublishedProjectSitemapEntries(), getPublishedServiceSitemapEntries(), getPublishedArticleSitemapEntries()])
  return groups.flat()
}

const statusCode = (s: 'permanent' | 'temporary') => (s === 'permanent' ? 301 : 302)

/** Resolve a single path to its redirect target + HTTP status, O(1) on the unique from_path (FR-SEO-011/020). */
export async function resolveRedirect(path: string): Promise<{ match: boolean; toPath?: string; status?: number }> {
  const r = await db.redirect.findUnique({ where: { fromPath: normalizePath(path) } })
  if (!r || !r.isActive) return { match: false }
  return { match: true, toPath: r.toPath, status: statusCode(r.status) }
}

/** All active redirects as an edge-loadable table for the middleware (FR-SEO-020). */
export async function getActiveRedirects(): Promise<{ fromPath: string; toPath: string; status: number }[]> {
  const rows = await db.redirect.findMany({ where: { isActive: true }, select: { fromPath: true, toPath: true, status: true } })
  return rows.map((r) => ({ fromPath: r.fromPath, toPath: r.toPath, status: statusCode(r.status) }))
}
