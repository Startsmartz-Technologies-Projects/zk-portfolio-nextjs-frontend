import { describe, it, expect } from 'vitest'
import { resolveSeoMeta, applyTitleTemplate, type SeoDefaults } from '@/lib/seo/seo-meta'

// Pure resolver — no DB.

const DEFAULTS: SeoDefaults = {
  siteTitleTemplate: '%s · Zakir Enterprise',
  defaultMetaDescription: 'Default site description.',
  defaultOgImageId: 'og-default-id',
  defaultRobots: 'index_follow',
}

describe('applyTitleTemplate', () => {
  it('substitutes %s', () => {
    expect(applyTitleTemplate('%s · Zakir Enterprise', 'Bridge')).toBe('Bridge · Zakir Enterprise')
  })
  it('returns the title unchanged when the template lacks %s', () => {
    expect(applyTitleTemplate('Zakir Enterprise', 'Bridge')).toBe('Bridge')
  })
})

describe('resolveSeoMeta', () => {
  it('fills everything from defaults when meta and record are empty (never empty — BR-2)', () => {
    const r = resolveSeoMeta({}, {}, DEFAULTS)
    expect(r).toEqual({
      title: 'Zakir Enterprise',
      description: 'Default site description.',
      canonicalUrl: null,
      ogImageId: 'og-default-id',
      ogTitle: 'Zakir Enterprise',
      ogDescription: 'Default site description.',
      noindex: false,
      robots: 'index, follow',
    })
  })

  it('falls back to record title/summary/cover when meta is empty', () => {
    const r = resolveSeoMeta(
      {},
      { title: 'Bridge Project', summary: 'A 49m steel arch bridge', coverImageId: 'cover-1' },
      DEFAULTS,
    )
    expect(r.title).toBe('Bridge Project · Zakir Enterprise')
    expect(r.description).toBe('A 49m steel arch bridge')
    expect(r.ogImageId).toBe('cover-1')
    expect(r.ogTitle).toBe('Bridge Project · Zakir Enterprise')
    expect(r.ogDescription).toBe('A 49m steel arch bridge')
  })

  it('uses explicit SeoMeta overrides when present', () => {
    const r = resolveSeoMeta(
      {
        metaTitle: 'Custom Title',
        metaDescription: 'Custom description',
        canonicalUrl: 'https://zakirenterprise.com/x',
        ogImage: 'og-1',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
        noindex: true,
      },
      { title: 'ignored', summary: 'ignored', coverImageId: 'ignored' },
      DEFAULTS,
    )
    expect(r.title).toBe('Custom Title · Zakir Enterprise')
    expect(r.description).toBe('Custom description')
    expect(r.canonicalUrl).toBe('https://zakirenterprise.com/x')
    expect(r.ogImageId).toBe('og-1')
    expect(r.ogTitle).toBe('OG Title')
    expect(r.ogDescription).toBe('OG Description')
    expect(r.noindex).toBe(true)
    expect(r.robots).toBe('noindex, nofollow')
  })

  it('treats whitespace-only fields as empty', () => {
    const r = resolveSeoMeta({ metaTitle: '   ', metaDescription: '' }, { title: 'Real Title' }, DEFAULTS)
    expect(r.title).toBe('Real Title · Zakir Enterprise')
    expect(r.description).toBe('Default site description.')
  })

  it('is deterministic (same inputs → same output)', () => {
    const meta = { metaTitle: 'X' }
    const ctx = { title: 'Y' }
    expect(resolveSeoMeta(meta, ctx, DEFAULTS)).toEqual(resolveSeoMeta(meta, ctx, DEFAULTS))
  })
})
