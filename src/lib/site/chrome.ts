import { cache } from 'react'
import { getSiteBundle, type PublicMediaRef } from '@/lib/data/site'

// Site chrome data (web-fe-site-chrome / FR-SITE-022). The root layout fetches this once
// and passes it to the client Nav/Footer so brand/contact/social/copyright render from the
// SITE bundle instead of hard-coded values. Split into a pure mapper (`toSiteChrome`,
// unit-tested) and a cached server fetch (`getSiteChrome`).

type SiteBundle = Awaited<ReturnType<typeof getSiteBundle>>

export interface SiteSocial {
  platform: string
  url: string
}

export interface SiteChrome {
  brandName: string
  logoPrimary: PublicMediaRef | null
  logoFooter: PublicMediaRef | null
  favicon: PublicMediaRef | null
  phone: string
  email: string
  brandDescription: string
  officeAddress: string
  copyright: string
  socials: SiteSocial[]
}

/** Pure projection of the SITE bundle onto the chrome's needs, with safe pre-seed defaults. */
export function toSiteChrome(bundle: SiteBundle): SiteChrome {
  const c = bundle.company
  return {
    brandName: c?.name ?? 'Zakir Enterprise',
    logoPrimary: bundle.brand.logo_primary,
    // Footer falls back to the primary logo when no dedicated footer slot is set.
    logoFooter: bundle.brand.logo_footer ?? bundle.brand.logo_primary,
    favicon: bundle.brand.favicon,
    phone: c?.phone ?? '',
    email: c?.email ?? '',
    brandDescription: c?.brand_description ?? '',
    officeAddress: c?.office_address ?? '',
    copyright: c?.copyright_text ?? '',
    // Only configured platforms with a real href (drop the legacy "#" placeholders).
    socials: bundle.socials
      .filter((s) => s.url && s.url !== '#')
      .map((s) => ({ platform: s.platform, url: s.url })),
  }
}

/** Cached per-request fetch of the chrome bundle (deduped across generateMetadata + render). */
export const getSiteChrome = cache(async (): Promise<SiteChrome> => toSiteChrome(await getSiteBundle()))
