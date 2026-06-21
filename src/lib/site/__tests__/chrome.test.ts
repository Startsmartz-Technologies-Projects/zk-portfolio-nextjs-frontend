import { describe, it, expect } from 'vitest'
import { toSiteChrome } from '@/src/lib/site/chrome'
import { socialIconKey } from '@/src/lib/site/social'

type Bundle = Parameters<typeof toSiteChrome>[0]

const img = (url: string) => ({ id: 'x', url, alt: 'logo', width: 200, height: 60 })

function makeBundle(overrides: Partial<Bundle> = {}): Bundle {
  return {
    company: {
      name: 'Zakir Enterprise',
      legal_name: 'Zakir Enterprise Ltd.',
      tagline: null,
      brand_description: 'We build.',
      establishment_year: 2010,
      email: 'hi@zk.com',
      phone: '+880123',
      whatsapp: null,
      office_address: 'Dhaka, Bangladesh',
      business_hours: null,
      coverage_summary: null,
      copyright_text: '© 2026 Zakir Enterprise',
    },
    brand: { logo_primary: img('p.png'), logo_footer: img('f.png'), favicon: img('fav.png'), og_default: null },
    socials: [
      { platform: 'facebook', url: 'https://fb.com/zk', position: 0 },
      { platform: 'linkedin', url: '#', position: 1 },
    ],
    settings: {},
    ...overrides,
  } as Bundle
}

describe('toSiteChrome', () => {
  it('projects company + brand fields and filters placeholder socials', () => {
    const c = toSiteChrome(makeBundle())
    expect(c.brandName).toBe('Zakir Enterprise')
    expect(c.phone).toBe('+880123')
    expect(c.email).toBe('hi@zk.com')
    expect(c.brandDescription).toBe('We build.')
    expect(c.officeAddress).toBe('Dhaka, Bangladesh')
    expect(c.copyright).toBe('© 2026 Zakir Enterprise')
    expect(c.logoPrimary?.url).toBe('p.png')
    expect(c.favicon?.url).toBe('fav.png')
    // the "#" placeholder social is dropped; only the real href survives
    expect(c.socials).toEqual([{ platform: 'facebook', url: 'https://fb.com/zk' }])
    // optional company fields default to '' when null (consumers fall back to static copy)
    expect(c.tagline).toBe('')
    expect(c.whatsapp).toBe('')
    expect(c.businessHours).toBe('')
    expect(c.coverageSummary).toBe('')
  })

  it('projects the optional company fields when set', () => {
    const c = toSiteChrome(
      makeBundle({
        company: {
          name: 'Zakir Enterprise',
          legal_name: 'Zakir Enterprise Ltd.',
          tagline: 'Building Bangladesh',
          brand_description: 'We build.',
          establishment_year: 2010,
          email: 'hi@zk.com',
          phone: '+880123',
          whatsapp: 'https://wa.me/8801700000000',
          office_address: 'Dhaka, Bangladesh',
          business_hours: 'Sun–Thu, 9–18',
          coverage_summary: 'All 64 districts',
          copyright_text: '© 2026 Zakir Enterprise',
        },
      }),
    )
    expect(c.tagline).toBe('Building Bangladesh')
    expect(c.whatsapp).toBe('https://wa.me/8801700000000')
    expect(c.businessHours).toBe('Sun–Thu, 9–18')
    expect(c.coverageSummary).toBe('All 64 districts')
  })

  it('falls back to the primary logo when no footer slot is set', () => {
    const c = toSiteChrome(makeBundle({ brand: { logo_primary: img('p.png'), logo_footer: null, favicon: null, og_default: null } }))
    expect(c.logoFooter?.url).toBe('p.png')
  })

  it('degrades safely before the seed (null company / brand)', () => {
    const c = toSiteChrome(makeBundle({ company: null, brand: { logo_primary: null, logo_footer: null, favicon: null, og_default: null }, socials: [] }))
    expect(c.brandName).toBe('Zakir Enterprise')
    expect(c.phone).toBe('')
    expect(c.logoPrimary).toBeNull()
    expect(c.socials).toEqual([])
  })
})

describe('socialIconKey', () => {
  it('maps platform names to Social icon keys', () => {
    expect(socialIconKey('Facebook')).toBe('fb')
    expect(socialIconKey('instagram')).toBe('ig')
    expect(socialIconKey('LinkedIn')).toBe('li')
    expect(socialIconKey('YouTube')).toBe('yt')
  })
  it('passes an unknown platform through lowercased', () => {
    expect(socialIconKey('Twitter')).toBe('twitter')
  })
})
