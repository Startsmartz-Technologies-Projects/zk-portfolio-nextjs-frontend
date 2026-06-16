import Link from "next/link";
import { Arrow } from "./site-ui";
import { MediaImage } from "./media/media-image";
import { BlogCard, blogInitials } from "./blog/blog-card";
import { BlogToolbar, type ChipOption } from "./blog/blog-toolbar";
import { getPublishedArticles, getFeaturedArticles, getArticleFacets } from "@/lib/data/blog";
import { getTermList } from "@/src/lib/site/taxonomy";

// Public Blog index — server component on getPublishedArticles/getFeaturedArticles/getArticleFacets
// (blog-fe-public §A/§D). Search/category/sort/pagination via query params; the toolbar is a client
// island. Hero/intro/newsletter copy stays static here — the PAGES-managed source lands with
// pages-fe-public (Wave C, §D).

const BStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" />
  </svg>
);
const BClock = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const PAGE_SIZE = 6;

export type BlogIndexState = { q: string; category: string; sort: string; page: number };

export async function BlogPageContent({ state }: { state: BlogIndexState }) {
  const [listed, featuredRes, facets, categoryTerms] = await Promise.all([
    getPublishedArticles({
      page: state.page,
      pageSize: PAGE_SIZE,
      q: state.q || undefined,
      sort: (state.sort as "latest" | "popular" | "featured") || undefined,
      category: state.category || undefined,
    }),
    getFeaturedArticles(),
    getArticleFacets(),
    getTermList("blog-category"),
  ]);

  const items = listed.data;
  const total = listed.meta.total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const featured = featuredRes.data[0] ?? null;

  const catCounts = new Map(facets.categories.map((c) => [c.slug, c.count]));
  // "Articles Published" = total published set. When no filter is active `total` already equals it;
  // under an active filter we fall back to the unfiltered sum across category facets + any uncategorized.
  const filterActive = !!(state.q || state.category);
  const facetSum = facets.categories.reduce((n, c) => n + c.count, 0);
  const totalPublished = filterActive ? Math.max(total, facetSum) : total;
  const chips: ChipOption[] = [
    { value: "", label: "All", count: filterActive ? Math.max(total, facetSum) : total },
    ...categoryTerms.map((t) => ({ value: t.slug, label: t.label, count: catCounts.get(t.slug) ?? 0 })),
  ];

  return (
    <>
      <section className="bg-hero">
        <div className="bg-hero-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=2000&q=80&auto=format&fit=crop)" }} />
        <div className="container bg-hero-inner">
          <div className="bg-crumbs">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Insights &amp; Articles</span>
          </div>
          <span className="bg-microlabel">Insights &amp; Articles</span>
          <h1>
            Construction Knowledge,
            <br />
            <span className="accent">Industry Updates</span> &amp; Project Insights
          </h1>
          <p className="bg-hero-sub">
            Expert articles from Zakir Enterprise on construction, engineering, project delivery, and infrastructure development.
          </p>
          <div className="bg-hero-ctas">
            <a href="#grid" className="btn btn-primary">
              Explore Articles <Arrow />
            </a>
            <a href="#featured" className="btn btn-outline-light">
              Read Featured
            </a>
          </div>
        </div>
      </section>

      <section className="bg-intro">
        <div className="container bg-intro-grid">
          <div>
            <span className="microlabel">Editorial Perspective</span>
            <h2>
              A working publication for
              <br />
              people who build.
            </h2>
          </div>
          <div className="bg-intro-copy">
            <p>The Zakir Enterprise Insights desk publishes long-form technical notes, field methodology and industry commentary from active projects.</p>
            <div className="bg-intro-stats">
              <div>
                <div className="n">{totalPublished}+</div>
                <div className="l">Articles Published</div>
              </div>
              <div>
                <div className="n">{categoryTerms.length}</div>
                <div className="l">Topic Categories</div>
              </div>
              <div>
                <div className="n">9</div>
                <div className="l">In-house Contributors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BlogToolbar q={state.q} category={state.category} sort={state.sort} chips={chips} />

      {featured && (
        <section className="bg-featured" id="featured">
          <div className="container">
            <div className="bg-section-head">
              <span className="microlabel">Featured This Week</span>
              <h2>Editor&apos;s selection.</h2>
            </div>
            <div className="bg-featured-card">
              <div className="bg-featured-img">
                <MediaImage media={featured.cover_image} fill sizes="(max-width: 980px) 100vw, 50vw" />
                <div className="bg-featured-badge">
                  <BStar /> Featured Article
                </div>
              </div>
              <div className="bg-featured-body">
                <div className="bg-featured-meta">
                  {featured.category && <span className="cat">{featured.category.label}</span>}
                  <span className="dot" />
                  {featured.display_date && <span>{featured.display_date}</span>}
                  <span className="dot" />
                  <span>
                    <BClock /> {featured.read_time}
                  </span>
                </div>
                <h2>{featured.title}</h2>
                {featured.excerpt && <p>{featured.excerpt}</p>}
                <div className="bg-author-line">
                  <div className="bg-author-avatar">{blogInitials(featured.author_name)}</div>
                  <div className="bg-author-info">
                    <div className="name">{featured.author_name}</div>
                    <div className="role">{featured.author_role}</div>
                  </div>
                </div>
                <div className="btn-row">
                  <Link href={`/blogs/${featured.slug}`} className="btn btn-primary">
                    Read Article <Arrow />
                  </Link>
                  <a href="#grid" className="btn btn-outline-dark">
                    Browse All Articles
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-grid-section" id="grid">
        <div className="container">
          <div className="bg-grid-head">
            <div>
              <span className="microlabel">All Articles</span>
              <h2 style={{ marginTop: 14 }}>Latest from the editorial desk.</h2>
            </div>
            <div className="count-label">
              Showing <strong style={{ color: "var(--forest)" }}>{items.length}</strong> of {total} {total === 1 ? "article" : "articles"} · Page {state.page} of {totalPages}
            </div>
          </div>
          {items.length === 0 ? (
            <div className="bg-empty">
              <h3>No articles matched your filters.</h3>
              <p>Try a different topic or clear your search to see everything.</p>
            </div>
          ) : (
            <div className="bg-grid">
              {items.map((it, i) => (
                <BlogCard key={it.id} item={it} lime={i === 1 || i === 3} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="bg-pagination">
              {state.page > 1 && (
                <Link className="bg-page-btn nav-arrow" href={pageHref(state, state.page - 1)} scroll={false}>
                  ← Prev
                </Link>
              )}
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link key={i} className={`bg-page-btn ${state.page === i + 1 ? "active" : ""}`} href={pageHref(state, i + 1)} scroll={false}>
                  {String(i + 1).padStart(2, "0")}
                </Link>
              ))}
              {state.page < totalPages && (
                <Link className="bg-page-btn nav-arrow" href={pageHref(state, state.page + 1)} scroll={false}>
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-newsletter">
        <div className="container bg-newsletter-inner">
          <div>
            <span className="microlabel on-dark">Expert Consultation</span>
            <h2>
              Need construction expertise for your <span className="accent">next project?</span>
            </h2>
            <p>Our project desk responds within two working days with a structured scope review and next step.</p>
          </div>
          <div className="bg-newsletter-actions">
            <div className="bg-newsletter-btns">
              <Link href="/lets-collaborate" className="btn btn-primary">
                Contact Us <Arrow />
              </Link>
              <Link href="/#services" className="btn btn-outline-light">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function pageHref(state: BlogIndexState, page: number): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.sort && state.sort !== "latest") params.set("sort", state.sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blogs?${qs}` : "/blogs";
}
