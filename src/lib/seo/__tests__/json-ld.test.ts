import { describe, it, expect } from 'vitest'
import {
  buildArticleJsonLd,
  buildNewsArticleJsonLd,
  buildServiceJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
} from '@/src/lib/seo/json-ld'

describe('article builders', () => {
  it('builds a well-formed Article and omits empty fields', () => {
    const ld = buildArticleJsonLd({ headline: 'Hello', description: '', authorName: 'Jane', datePublished: '2026-01-01' })
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('Article')
    expect(ld.headline).toBe('Hello')
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Jane' })
    // dateModified defaults to datePublished
    expect(ld.dateModified).toBe('2026-01-01')
    // empty description dropped
    expect('description' in ld).toBe(false)
  })

  it('NewsArticle uses the NewsArticle type', () => {
    expect(buildNewsArticleJsonLd({ headline: 'News' })['@type']).toBe('NewsArticle')
  })
})

describe('buildServiceJsonLd', () => {
  it('builds a Service with provider organization', () => {
    const ld = buildServiceJsonLd({ name: 'Road Works', providerName: 'Zakir Enterprise', url: '/services/road-works' })
    expect(ld['@type']).toBe('Service')
    expect(ld.name).toBe('Road Works')
    expect(ld.provider).toEqual({ '@type': 'Organization', name: 'Zakir Enterprise' })
  })
})

describe('buildFaqJsonLd', () => {
  it('maps items to Question/Answer entities', () => {
    const ld = buildFaqJsonLd([{ question: 'Q1?', answer: 'A1' }])
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity).toEqual([
      { '@type': 'Question', name: 'Q1?', acceptedAnswer: { '@type': 'Answer', text: 'A1' } },
    ])
  })
})

describe('buildBreadcrumbJsonLd', () => {
  it('numbers list items from 1', () => {
    const ld = buildBreadcrumbJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Projects', url: '/projects' },
    ])
    expect(ld['@type']).toBe('BreadcrumbList')
    const items = ld.itemListElement as Array<{ position: number; name: string }>
    expect(items[0]).toMatchObject({ position: 1, name: 'Home' })
    expect(items[1]).toMatchObject({ position: 2, name: 'Projects' })
  })
})
