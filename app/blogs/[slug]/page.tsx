import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailPageContent } from "@/src/components/blog-detail-page-content";
import { getPublishedArticleBySlug } from "@/lib/data/blog";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/src/components/seo/json-ld";
import { isImageRef } from "@/src/lib/media/ref";
// Public Blog detail route (blog-fe-public §A/§B/§F). Server-rendered from getPublishedArticleBySlug;
// generateMetadata + Article/BreadcrumbList JSON-LD. Draft/archived/deleted + legacy_id slugs → 404
// (BR; legacy_id 301s handled by the Wave-A proxy).
export const revalidate = 60;

type Params = { slug: string };
const imgUrl = (m: unknown) => (isImageRef(m as never) ? (m as { url: string }).url : null);

export async function generateMetadata({ params }: { params: Promise<Params> | Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};
  const defaults = await getPublicSeoDefaults();
  // SEO meta is admin-only on the detail read; fall back to record title/excerpt + cover OG.
  return buildMetadata({
    record: { title: article.title, summary: article.excerpt },
    defaults,
    ogImageUrl: imgUrl(article.cover_image),
    path: `/blogs/${article.slug}`,
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<Params> | Params }) {
  const { slug } = await params;
  const [article, defaults] = await Promise.all([getPublishedArticleBySlug(slug), getPublicSeoDefaults()]);
  if (!article) notFound();

  const base = defaults.metadata_base.replace(/\/$/, "");
  return (
    <>
      <ArticleJsonLd
        headline={article.title}
        description={article.excerpt}
        url={`${base}/blogs/${article.slug}`}
        imageUrl={imgUrl(article.cover_image)}
        datePublished={article.article_date ? new Date(article.article_date).toISOString() : null}
        authorName={article.author_name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${base}/` },
          { name: "Blogs", url: `${base}/blogs` },
          { name: article.title, url: `${base}/blogs/${article.slug}` },
        ]}
      />
      <BlogDetailPageContent article={article} />
    </>
  );
}
