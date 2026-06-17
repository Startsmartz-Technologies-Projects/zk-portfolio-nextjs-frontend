import { describe, it, expect } from 'vitest'
import { buildMetadata, type PublicSeoDefaults } from '@/src/lib/seo/build-metadata'

function makeDefaults(overrides: Partial<PublicSeoDefaults> = {}): PublicSeoDefaults {
  return {
    site_title_template: '%s · Zakir Enterprise',
    default_meta_description: 'Construction and infrastructure portfolio.',
    metadata_base: 'https://zakirenterprise.com',
    default_og_image: { id: 'og', url: 'https://cdn/og-default.png', alt: null, width: 1200, height: 630 },
    twitter_handle: '@zakir',
    default_robots: 'index_follow',
    google_site_verification: null,
    bing_site_verification: null,
    organization: null,
    enabled_jsonld_types: [],
    ...overrides,
  }
}

describe('buildMetadata', () => {
  it('composes an absolute title via the template and falls back to record summary for description', () => {
    const md = buildMetadata({
      seo: { metaTitle: 'Riverside Bridge' },
      record: { summary: 'A 400m cable-stayed bridge.' },
      defaults: makeDefaults(),
    })
    expect(md.title).toEqual({ absolute: 'Riverside Bridge · Zakir Enterprise' })
    expect(md.description).toBe('A 400m cable-stayed bridge.')
  })

  it('falls back to the site default description when neither meta nor record provide one', () => {
    const md = buildMetadata({ record: { title: 'Projects' }, defaults: makeDefaults() })
    expect(md.description).toBe('Construction and infrastructure portfolio.')
  })

  it('emits noindex robots for a noindex record', () => {
    const md = buildMetadata({ seo: { metaTitle: 'Hidden', noindex: true }, defaults: makeDefaults() })
    expect(md.robots).toEqual({ index: false, follow: false })
  })

  it('omits explicit robots when the record is indexable (inherits the default)', () => {
    const md = buildMetadata({ seo: { metaTitle: 'Visible' }, defaults: makeDefaults() })
    expect(md.robots).toBeUndefined()
  })

  it('prefers the record OG url, falling back to the site default OG image', () => {
    const withRecord = buildMetadata({ seo: { metaTitle: 'X' }, defaults: makeDefaults(), ogImageUrl: 'https://cdn/cover.png' })
    expect(withRecord.openGraph?.images).toEqual([{ url: 'https://cdn/cover.png' }])

    const withDefault = buildMetadata({ seo: { metaTitle: 'X' }, defaults: makeDefaults() })
    expect(withDefault.openGraph?.images).toEqual([{ url: 'https://cdn/og-default.png' }])
  })

  it('uses the explicit canonical, otherwise the route path', () => {
    const explicit = buildMetadata({ seo: { metaTitle: 'X', canonicalUrl: '/canonical' }, defaults: makeDefaults(), path: '/projects/x' })
    expect(explicit.alternates?.canonical).toBe('/canonical')

    const fromPath = buildMetadata({ seo: { metaTitle: 'X' }, defaults: makeDefaults(), path: '/projects/x' })
    expect(fromPath.alternates?.canonical).toBe('/projects/x')
  })
})
