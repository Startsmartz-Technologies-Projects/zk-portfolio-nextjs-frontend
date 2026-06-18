import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsDetailPageContent } from "@/src/components/news-detail-page-content";
import { getPublishedStoryBySlug } from "@/lib/data/news";
import { getSiteChrome } from "@/src/lib/site/chrome";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { NewsArticleJsonLd, BreadcrumbJsonLd } from "@/src/components/seo/json-ld";
import { isImageRef } from "@/src/lib/media/ref";
// Public News detail route (news-fe-public §A/§B/§F). Server-rendered from getPublishedStoryBySlug;
// generateMetadata + NewsArticle/BreadcrumbList JSON-LD. Byline = the SITE newsroom default.
// Draft/archived/deleted + legacy_id slugs → 404 (legacy_id 301s via the Wave-A proxy).
export const revalidate = 60;

type Params = { slug: string };
const imgUrl = (m: unknown) => (isImageRef(m as never) ? (m as { url: string }).url : null);

export async function generateMetadata({ params }: { params: Promise<Params> | Params }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublishedStoryBySlug(slug);
  if (!story) return {};
  const defaults = await getPublicSeoDefaults();
  // SEO meta is admin-only on the detail read; fall back to record title/excerpt + cover OG.
  return buildMetadata({
    record: { title: story.title, summary: story.excerpt },
    defaults,
    ogImageUrl: imgUrl(story.cover_image),
    path: `/news/${story.slug}`,
  });
}

export default async function NewsDetailPage({ params }: { params: Promise<Params> | Params }) {
  const { slug } = await params;
  const [story, chrome, defaults] = await Promise.all([getPublishedStoryBySlug(slug), getSiteChrome(), getPublicSeoDefaults()]);
  if (!story) notFound();

  const base = defaults.metadata_base.replace(/\/$/, "");
  // SITE newsroom byline default (BR-9): no per-article author — derive from the brand name.
  const byline = `${chrome.brandName} Newsroom`;

  return (
    <>
      <NewsArticleJsonLd
        headline={story.title}
        description={story.excerpt}
        url={`${base}/news/${story.slug}`}
        imageUrl={imgUrl(story.cover_image)}
        datePublished={story.article_date ? new Date(story.article_date).toISOString() : null}
        authorName={byline}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${base}/` },
          { name: "News", url: `${base}/news` },
          { name: story.title, url: `${base}/news/${story.slug}` },
        ]}
      />
      <NewsDetailPageContent story={story} byline={byline} />
    </>
  );
}
