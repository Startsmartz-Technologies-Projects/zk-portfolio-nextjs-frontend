import {
  buildArticleJsonLd,
  buildNewsArticleJsonLd,
  buildServiceJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  type ArticleInput,
  type ServiceInput,
  type FaqItem,
  type BreadcrumbItem,
} from '@/src/lib/seo/json-ld'

// JSON-LD <script> emitters (web-fe-seo-layer / FR-SEO-016/017). The Organization script
// renders site-wide in the root layout; the rest are dropped into module detail routes.
// Each renders a single application/ld+json script from a pure builder.

/** Render an arbitrary, already-shaped schema.org object as a JSON-LD script. */
export function JsonLd({ data }: { data: Record<string, unknown> | null | undefined }) {
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

/** Site-wide Organization (from getPublicSeoDefaults().organization — already schema.org shaped). */
export function OrganizationJsonLd({ organization }: { organization: Record<string, unknown> | null | undefined }) {
  return <JsonLd data={organization} />
}

export function ArticleJsonLd(props: ArticleInput) {
  return <JsonLd data={buildArticleJsonLd(props)} />
}

export function NewsArticleJsonLd(props: ArticleInput) {
  return <JsonLd data={buildNewsArticleJsonLd(props)} />
}

export function ServiceJsonLd(props: ServiceInput) {
  return <JsonLd data={buildServiceJsonLd(props)} />
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  return <JsonLd data={buildFaqJsonLd(items)} />
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLd data={buildBreadcrumbJsonLd(items)} />
}
