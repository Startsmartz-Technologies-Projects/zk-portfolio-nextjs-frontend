import Link from "next/link";
import { Arrow } from "./site-ui";
import { MediaImage } from "./media/media-image";
import { NewsCard, type NewsCardData } from "./news/news-card";
import { NewsToolbar, type ChipOption } from "./news/news-toolbar";
import { getPublishedStories, getFeaturedStories, getStoryFacets } from "@/lib/data/news";
import { getTermList } from "@/src/lib/site/taxonomy";

// Public News index — server component on getPublishedStories/getFeaturedStories/getStoryFacets
// (news-fe-public §A/§D). The inline NEWS_DATA is gone. Search/category/sort/pagination via query
// params (the toolbar is the only client island). Hero/intro/"By the Numbers"/CTA copy stays static
// here — the PAGES-managed source lands with pages-fe-public (Wave C, §D).

const PAGE_SIZE = 6;

function Star({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" />
    </svg>
  );
}

export type NewsIndexState = { q: string; category: string; sort: string; page: number };

export async function NewsPageContent({ state }: { state: NewsIndexState }) {
  const [listed, featuredRes, facets, categoryTerms] = await Promise.all([
    getPublishedStories({
      page: state.page,
      pageSize: PAGE_SIZE,
      q: state.q || undefined,
      sort: (state.sort as "latest" | "oldest" | "featured") || undefined,
      category: state.category || undefined,
    }),
    getFeaturedStories(),
    getStoryFacets(),
    getTermList("news-category"),
  ]);

  const items = listed.data;
  const total = listed.meta.total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const featured = featuredRes.data[0] ?? null;

  const catCounts = new Map(facets.categories.map((c) => [c.slug, c.count]));
  const filterActive = !!(state.q || state.category);
  const facetSum = facets.categories.reduce((n, c) => n + c.count, 0);
  const publishedTotal = filterActive ? Math.max(total, facetSum) : total;
  const chips: ChipOption[] = [
    { value: "", label: "All", count: publishedTotal },
    ...categoryTerms.map((t) => ({ value: t.slug, label: t.label, count: catCounts.get(t.slug) ?? 0 })),
  ];

  const trustStats = [
    { big: "100+", lbl: "Completed Projects" },
    { big: "64", lbl: "Districts · Nationwide" },
    { big: "250+", lbl: "Skilled Workforce" },
    { big: "10 Yrs", lbl: "Proven Execution" },
  ];

  return (
    <>
      <section className="nc-hero" data-screen-label="01 News Hero">
        <div className="nc-hero-bg" style={{ backgroundImage: "url(https://res.cloudinary.com/dk4csiouq/image/upload/v1778498102/News_Corner_hero_tya9ru.jpg)" }} />
        <div className="container nc-hero-inner">
          <div className="nc-crumbs">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">News Corner</span>
          </div>
          <h1>
            News <span className="accent">Corner</span>
          </h1>
          <p className="hero-sub">Latest updates, achievements, project milestones and company announcements from Zakir Enterprise.</p>
          <div className="nc-hero-meta">
            <div className="m">
              <span className="k">Published</span>
              <span className="v">{publishedTotal} Stories</span>
            </div>
            <div className="m">
              <span className="k">Categories</span>
              <span className="v">{categoryTerms.length} Topics</span>
            </div>
            {featured && (
              <div className="m">
                <span className="k">Featured</span>
                <span className="v">{featured.category?.label ?? "Latest"}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="nc-intro" data-screen-label="02 Intro">
        <div className="container">
          <span className="microlabel">Newsroom · Zakir Enterprise</span>
          <p>Stay updated with Zakir Enterprise&apos;s latest project wins, milestones, participation, certifications and company growth.</p>
        </div>
      </section>

      <NewsToolbar q={state.q} category={state.category} sort={state.sort} chips={chips} />

      {featured && (
        <section className="nc-featured" data-screen-label="04 Featured">
          <div className="container">
            <div className="nc-featured-card">
              <div className="nc-featured-img">
                <MediaImage media={featured.cover_image} fill sizes="(max-width: 980px) 100vw, 50vw" />
                <div className="nc-featured-badge">
                  <Star /> Featured Story
                </div>
              </div>
              <div className="nc-featured-body">
                <div className="nc-featured-meta">
                  {featured.category && <span className="cat">{featured.category.label}</span>}
                  <span className="dot" />
                  {featured.display_date && <span>{featured.display_date}</span>}
                  <span className="dot" />
                  <span>{featured.read_time}</span>
                </div>
                <h2>{featured.title}</h2>
                {featured.excerpt && <p>{featured.excerpt}</p>}
                <div className="btn-row">
                  <Link href={`/news/${featured.slug}`} className="btn btn-primary">
                    Read Full Story <Arrow />
                  </Link>
                  <a href="#grid" className="btn btn-outline-dark">
                    Browse All News
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="nc-grid-section" id="grid" data-screen-label="05 News Grid">
        <div className="container">
          <div className="nc-grid-head">
            <div>
              <span className="microlabel">All Stories</span>
              <h2 style={{ marginTop: 14 }}>Latest from the Newsroom</h2>
            </div>
            <div className="count-label">
              Showing <strong style={{ color: "var(--forest)" }}>{items.length}</strong> of {total} stories · Page {state.page} of {totalPages}
            </div>
          </div>
          {items.length === 0 ? (
            <div className="nc-empty">
              <h3>No stories matched your filters.</h3>
              <p>Try removing a filter or clearing your search.</p>
            </div>
          ) : (
            <div className="nc-grid">
              {items.map((it: NewsCardData & { id: string }, i: number) => (
                <NewsCard key={it.id} item={it} lime={i === 0 || i === 4} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="nc-pagination">
              {state.page > 1 && (
                <Link className="nc-page-btn nav-arrow" href={pageHref(state, state.page - 1)} scroll={false}>
                  ← Prev
                </Link>
              )}
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link key={i} className={`nc-page-btn ${state.page === i + 1 ? "active" : ""}`} href={pageHref(state, i + 1)} scroll={false}>
                  {String(i + 1).padStart(2, "0")}
                </Link>
              ))}
              {state.page < totalPages && (
                <Link className="nc-page-btn nav-arrow" href={pageHref(state, state.page + 1)} scroll={false}>
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="nc-trust-strip" data-screen-label="06 Trust Strip">
        <div className="container nc-trust-inner">
          <div>
            <span className="microlabel on-dark">By the Numbers</span>
            <h2 style={{ marginTop: 16 }}>
              Delivering real work, <span className="accent">every day.</span>
            </h2>
          </div>
          <div className="nc-trust-stats">
            {trustStats.map((s) => (
              <div key={s.lbl} className="nc-trust-stat">
                <div className="big">{s.big}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nc-cta" data-screen-label="07 CTA Banner">
        <div className="nc-cta-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=2000&q=80&auto=format&fit=crop)" }} />
        <div className="container">
          <div className="nc-cta-grid">
            <div>
              <span className="microlabel on-dark">Ready To Build</span>
              <h2>
                Let&apos;s build the <span className="accent">future</span> together.
              </h2>
            </div>
            <div className="nc-cta-right">
              <p>Discuss your next construction project with Zakir Enterprise. Our project desk responds within two working days with a structured next step.</p>
              <div className="nc-cta-btns">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Let&apos;s Collaborate <Arrow />
                </Link>
                <Link href="/#contact" className="btn btn-outline-light">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function pageHref(state: NewsIndexState, page: number): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.sort && state.sort !== "latest") params.set("sort", state.sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/news?${qs}` : "/news";
}
