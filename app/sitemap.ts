import type { MetadataRoute } from 'next'
import { getPublicSitemap } from '@/lib/data/seo'

// Renders /sitemap.xml from the SEO module's indexable URL set (FR-SEO-014).
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPublicSitemap()
  return entries.map((e) => ({ url: e.loc, lastModified: e.lastmod }))
}
