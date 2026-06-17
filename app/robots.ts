import type { MetadataRoute } from 'next'
import { getPublicRobots } from '@/lib/data/seo'

// Renders /robots.txt from the SEO robots policy (FR-SEO-015); the staging
// noindex_nofollow switch disallows the whole site (edge 9).
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const r = await getPublicRobots()
  return {
    rules: r.discourageIndexing ? { userAgent: '*', disallow: '/' } : { userAgent: '*', allow: '/' },
    ...(r.sitemap.startsWith('http') ? { sitemap: r.sitemap } : {}),
  }
}
