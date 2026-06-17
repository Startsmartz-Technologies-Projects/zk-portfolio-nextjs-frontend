import Link from "next/link";
import { Arrow } from "./site-ui";
import { MediaImage } from "./media/media-image";
import { BlogCard, blogInitials } from "./blog/blog-card";
import { BlockBody, type BlockBody as BlockBodyType } from "./blog/block-body";
import type { getPublishedArticleBySlug } from "@/lib/data/blog";

// Public Blog detail — server component on getPublishedArticleBySlug (blog-fe-public §A/§C/§E).
// Body renders from the block document (img blocks already resolved to MediaRef); related from
// detail.related; author bio uses the per-article value with the SITE default fallback (resolved
// in the data layer). The whole page is server-rendered — no client island.

type Article = NonNullable<Awaited<ReturnType<typeof getPublishedArticleBySlug>>>;

export function BlogDetailPageContent({ article }: { article: Article }) {
  const related = (article.related ?? []) as Array<Parameters<typeof BlogCard>[0]["item"]>;

  return (
    <>
      <section className="bd-hero">
        <div className="bd-hero-bg">
          <MediaImage media={article.cover_image} fill priority sizes="100vw" />
        </div>
        <div className="bd-hero-inner">
          <div className="bg-crumbs" style={{ marginBottom: 28 }}>
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/blogs">Blogs</Link>
            <span className="sep">/</span>
            <span className="current">{article.category?.label ?? "Article"}</span>
          </div>
          <div className="bd-header-meta">
            {article.category && <span className="bd-pill">{article.category.label}</span>}
            {article.display_date && <span className="bd-meta-item">{article.display_date}</span>}
            <span className="bd-meta-item">{article.read_time}</span>
            {article.author_name && <span className="bd-meta-item">{article.author_name}</span>}
          </div>
          <h1>{article.title}</h1>
          <div className="bd-hero-author">
            <div className="bd-author-block">
              <div className="bd-author-avatar">{blogInitials(article.author_name)}</div>
              <div className="bd-author-info">
                <div className="name">{article.author_name}</div>
                <div className="role">{article.author_role}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bd-article">
        <div className="bd-article-inner">
          <div className="bd-body-wrap">
            <div className="bd-hero-image" style={{ position: "relative" }}>
              <MediaImage media={article.cover_image} fill sizes="(max-width: 980px) 100vw, 720px" />
            </div>
            <div className="bd-body">
              <BlockBody body={article.body as BlockBodyType} lead={article.body_lead} />
              {article.tags.length > 0 && (
                <div className="bd-tags">
                  <span className="lbl">Tags</span>
                  {article.tags.map((t) => (
                    <Link key={t} href={`/blogs?q=${encodeURIComponent(t)}`} className="bd-tag">
                      {t}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="bd-sidebar">
            <div className="bd-card bd-author-card">
              <div className="bd-card-label">Written by</div>
              <div className="bd-author-card-head">
                <div className="bd-author-card-avatar">{blogInitials(article.author_name)}</div>
                <div>
                  <div className="bd-author-card-name">{article.author_name}</div>
                  <div className="bd-author-card-role">{article.author_role}</div>
                </div>
              </div>
              <p className="bd-author-card-bio">{article.author_bio}</p>
              <Link href="/lets-collaborate" className="btn btn-primary">
                Contact Author <Arrow />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bd-related">
          <div className="container">
            <div className="bd-related-head">
              <div>
                <span className="microlabel">Keep Reading</span>
                <h2>Related articles.</h2>
              </div>
              <Link href="/blogs" className="btn btn-outline-dark">
                View All Articles <Arrow />
              </Link>
            </div>
            <div className="bd-related-grid">
              {related.map((it) => (
                <BlogCard key={it.slug} item={it} showAuthor={false} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
