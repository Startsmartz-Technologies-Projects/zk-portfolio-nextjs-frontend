import type { RobotsPolicy } from '@prisma/client'

/**
 * The reusable per-record SEO field group (SRS seo §8.1 / overview §6.2).
 *
 * SEO owns this *type* and the fallback resolver below; the actual values are
 * stored on each content record/page (each content module embeds these columns
 * on its own schema — BR-1). All fields are optional at the record level; the
 * resolver fills the gaps deterministically so a published page is never empty.
 */
export interface SeoMeta {
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  /** MediaAsset id of the social-share image. */
  ogImage?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  noindex?: boolean | null
}

/** Record-level fallbacks the resolver draws on before the site defaults (FR-SEO-002). */
export interface SeoRecordContext {
  title?: string | null
  summary?: string | null
  /** MediaAsset id of the record's cover image. */
  coverImageId?: string | null
}

/** Site-wide defaults from the `SeoSettings` singleton (SRS seo §8.2). */
export interface SeoDefaults {
  siteTitleTemplate: string
  defaultMetaDescription: string
  defaultOgImageId?: string | null
  defaultRobots: RobotsPolicy
}

/** The fully-resolved metadata a consumer renders — every field non-empty (BR-2). */
export interface ResolvedSeo {
  title: string
  description: string
  canonicalUrl: string | null
  ogImageId: string | null
  ogTitle: string
  ogDescription: string
  noindex: boolean
  robots: string
}

function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Apply the `%s` title template (`"%s · Zakir Enterprise"`); no-op if `%s` is absent. */
export function applyTitleTemplate(template: string, title: string): string {
  return template.includes('%s') ? template.replace('%s', title) : title
}

/** The brand portion of the template alone (`"%s · Zakir Enterprise"` → `"Zakir Enterprise"`). */
function templateBrand(template: string): string {
  return template
    .replace('%s', '')
    .replace(/^[\s·|–—-]+|[\s·|–—-]+$/g, '')
    .trim()
}

const ROBOTS_DIRECTIVE: Record<RobotsPolicy, string> = {
  index_follow: 'index, follow',
  noindex_nofollow: 'noindex, nofollow',
  custom: 'index, follow',
}

/**
 * Resolve a record's `SeoMeta` against its content fallbacks and the site defaults
 * (FR-SEO-002, BR-2). Pure and deterministic — SSR and the editor preview produce
 * identical output. The chain per field:
 *
 * - title:       metaTitle → record title → brand; then wrapped by the title template.
 * - description: metaDescription → record summary → site default description.
 * - ogImage:     ogImage → record cover → site default OG image (id, or null).
 * - ogTitle:     ogTitle → resolved title; ogDescription: ogDescription → resolved description.
 * - canonical:   explicit override or null (the web layer computes the self-canonical).
 * - robots:      `noindex, nofollow` when noindex, else the default robots policy.
 */
export function resolveSeoMeta(meta: SeoMeta, record: SeoRecordContext, defaults: SeoDefaults): ResolvedSeo {
  const baseTitle = clean(meta.metaTitle) ?? clean(record.title)
  const title = baseTitle
    ? applyTitleTemplate(defaults.siteTitleTemplate, baseTitle)
    : templateBrand(defaults.siteTitleTemplate)

  const description = clean(meta.metaDescription) ?? clean(record.summary) ?? defaults.defaultMetaDescription
  const ogImageId = clean(meta.ogImage) ?? clean(record.coverImageId) ?? clean(defaults.defaultOgImageId) ?? null
  const noindex = meta.noindex === true

  return {
    title,
    description,
    canonicalUrl: clean(meta.canonicalUrl) ?? null,
    ogImageId,
    ogTitle: clean(meta.ogTitle) ?? title,
    ogDescription: clean(meta.ogDescription) ?? description,
    noindex,
    robots: noindex ? 'noindex, nofollow' : ROBOTS_DIRECTIVE[defaults.defaultRobots],
  }
}
