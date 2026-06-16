import type { Metadata } from 'next'
import type { RobotsPolicy } from '@prisma/client'
import { resolveSeoMeta, type SeoMeta, type SeoRecordContext } from '@/lib/seo/seo-meta'
import type { PublicMediaRef } from '@/lib/data/seo'

// Web-layer SEO composition (web-fe-seo-layer / FR-SEO-007). Module-route `generateMetadata`
// calls buildMetadata with a record's embedded SeoMeta, its content fallbacks, and the site
// defaults bundle (getPublicSeoDefaults). The fallback chain itself lives in the pure
// `resolveSeoMeta` resolver (SEO owns it); this maps the resolved values onto Next's
// `Metadata` and resolves the OG image to a URL.

/**
 * The site defaults bundle from `getPublicSeoDefaults` (seo-be-3), as a single structural
 * shape — the function's return is a two-branch union (seeded vs pre-seed), both of which
 * satisfy this interface, so callers and tests get one stable type.
 */
export interface PublicSeoDefaults {
  site_title_template: string
  default_meta_description: string
  metadata_base: string
  default_og_image: PublicMediaRef | null
  twitter_handle: string | null
  default_robots: RobotsPolicy
  google_site_verification: string | null
  bing_site_verification: string | null
  organization: Record<string, unknown> | null
  enabled_jsonld_types: string[]
}

export interface BuildMetadataInput {
  /** The record's embedded SeoMeta (`seo_*` columns); absent for a bare route. */
  seo?: SeoMeta | null
  /** Record-level fallbacks (title/summary) the resolver draws on before site defaults. */
  record?: SeoRecordContext
  /** Site defaults from getPublicSeoDefaults(). */
  defaults: PublicSeoDefaults
  /**
   * Resolved URL of the record's own OG/cover image — the caller already holds it as a
   * MediaRef from its public read. Falls back to the site default OG image.
   */
  ogImageUrl?: string | null
  /** Self-canonical path for this route, used when the SeoMeta has no explicit canonical. */
  path?: string
}

/**
 * Compose a record's `SeoMeta` over the fallback chain into Next `Metadata`
 * (title/description/canonical/OG/twitter/robots). `noindex` records yield
 * `robots: { index:false, follow:false }` (FR-SEO-004); the title is returned as an
 * `absolute` so the root layout's title template is not applied twice.
 */
export function buildMetadata({ seo, record, defaults, ogImageUrl, path }: BuildMetadataInput): Metadata {
  const resolved = resolveSeoMeta(seo ?? {}, record ?? {}, {
    siteTitleTemplate: defaults.site_title_template,
    defaultMetaDescription: defaults.default_meta_description,
    // OG id resolution is handled here as a URL (the caller already resolved its MediaRef),
    // so the resolver's id-chain is left to default.
    defaultOgImageId: null,
    defaultRobots: defaults.default_robots,
  })

  const ogUrl = ogImageUrl ?? defaults.default_og_image?.url ?? undefined
  const canonical = resolved.canonicalUrl ?? path ?? undefined

  const metadata: Metadata = {
    title: { absolute: resolved.title },
    description: resolved.description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      ...(canonical ? { url: canonical } : {}),
      ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      ...(defaults.twitter_handle ? { site: defaults.twitter_handle } : {}),
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      ...(ogUrl ? { images: [ogUrl] } : {}),
    },
  }

  // Only emit explicit robots when the record opts out — otherwise inherit the site default.
  if (resolved.noindex) metadata.robots = { index: false, follow: false }

  return metadata
}
