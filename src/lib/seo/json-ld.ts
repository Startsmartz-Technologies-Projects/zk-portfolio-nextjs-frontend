// Pure schema.org JSON-LD builders (web-fe-seo-layer / FR-SEO-016/017). The emitter
// components in src/components/seo/json-ld.tsx render these; module detail briefs call the
// matching component. Builders omit empty fields so the emitted JSON-LD stays well-formed.

const CONTEXT = 'https://schema.org' as const

type Json = Record<string, unknown>

function compact(obj: Json): Json {
  const out: Json = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out
}

export interface ArticleInput {
  headline: string
  description?: string | null
  url?: string | null
  imageUrl?: string | null
  datePublished?: string | null
  dateModified?: string | null
  authorName?: string | null
}

function articleLike(type: 'Article' | 'NewsArticle', a: ArticleInput): Json {
  return compact({
    '@context': CONTEXT,
    '@type': type,
    headline: a.headline,
    description: a.description ?? undefined,
    image: a.imageUrl ?? undefined,
    datePublished: a.datePublished ?? undefined,
    dateModified: a.dateModified ?? a.datePublished ?? undefined,
    author: a.authorName ? { '@type': 'Person', name: a.authorName } : undefined,
    mainEntityOfPage: a.url ?? undefined,
  })
}

export const buildArticleJsonLd = (a: ArticleInput): Json => articleLike('Article', a)
export const buildNewsArticleJsonLd = (a: ArticleInput): Json => articleLike('NewsArticle', a)

export interface ServiceInput {
  name: string
  description?: string | null
  url?: string | null
  imageUrl?: string | null
  providerName?: string | null
}

export function buildServiceJsonLd(s: ServiceInput): Json {
  return compact({
    '@context': CONTEXT,
    '@type': 'Service',
    name: s.name,
    description: s.description ?? undefined,
    image: s.imageUrl ?? undefined,
    url: s.url ?? undefined,
    provider: s.providerName ? { '@type': 'Organization', name: s.providerName } : undefined,
  })
}

export interface FaqItem {
  question: string
  answer: string
}

export function buildFaqJsonLd(items: FaqItem[]): Json {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Json {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
}
