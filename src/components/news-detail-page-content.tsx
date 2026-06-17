import Link from "next/link";
import { Arrow } from "./site-ui";
import { MediaImage } from "./media/media-image";
import { NewsCard } from "./news/news-card";
import { NewsBody, type NewsBody as NewsBodyType } from "./news/news-body";
import { ShareRail, ShareMobile } from "./news/share-rail";
import type { getPublishedStoryBySlug } from "@/lib/data/news";

// Public News detail — server component on getPublishedStoryBySlug (news-fe-public §A/§C/§E).
// Flat block-document body; per-story gallery from the API (hidden when empty); related from
// detail.related; byline = the SITE newsroom default (no per-article author, BR-9). Share rail is
// the only client island.

type Story = NonNullable<Awaited<ReturnType<typeof getPublishedStoryBySlug>>>;

export function NewsDetailPageContent({ story, byline }: { story: Story; byline: string }) {
  const related = story.related ?? [];
  const gallery = story.gallery ?? [];

  return (
    <>
      <section className="nd-hero" data-screen-label="01 Article Hero">
        <div className="nd-hero-bg">
          <MediaImage media={story.cover_image} fill priority sizes="100vw" />
        </div>
        <div className="nd-hero-inner">
          <div className="nc-crumbs">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/news">News</Link>
            <span className="sep">/</span>
            <span className="current">{story.category?.label ?? "Story"}</span>
          </div>
          <div className="nd-header-meta" style={{ marginTop: 24 }}>
            {story.category && <span className="nd-pill">{story.category.label}</span>}
            {story.display_date && (
              <span className="nd-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <rect x="3" y="5" width="18" height="16" rx="1" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="3" x2="8" y2="7" />
                  <line x1="16" y1="3" x2="16" y2="7" />
                </svg>
                {story.display_date}
              </span>
            )}
            <span className="nd-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12,7 12,12 16,14" />
              </svg>
              {story.read_time}
            </span>
          </div>
          <h1>{story.title}</h1>
          <div className="nd-author">
            <div className="nd-author-avatar">ZE</div>
            <div className="nd-author-info">
              <div className="name">Editorial Desk</div>
              <div className="role">{byline}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="nd-featured-img" data-screen-label="02 Hero Image">
        <div className="frame" style={{ position: "relative" }}>
          <MediaImage media={story.cover_image} fill sizes="100vw" />
        </div>
        <div className="container">
          <div className="nd-featured-caption">Photo · On-site coverage from the {(story.category?.label ?? "project").toLowerCase()} announcement.</div>
        </div>
      </div>

      <section className="nd-article" data-screen-label="03 Article Body">
        <div className="nd-article-inner">
          <ShareRail title={story.title} />
          <div className="nd-body">
            <NewsBody body={story.body as NewsBodyType} lead={story.body_lead} />
            {story.tags.length > 0 && (
              <div className="nd-tags">
                <span className="lbl">Tags</span>
                {story.tags.map((t) => (
                  <Link key={t} href={`/news?q=${encodeURIComponent(t)}`} className="nd-tag">
                    #{t}
                  </Link>
                ))}
              </div>
            )}
            <ShareMobile title={story.title} />
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="nd-gallery" data-screen-label="04 Gallery">
          <div className="nd-gallery-head">
            <span className="microlabel">Project Gallery</span>
            <h3>From the site - supporting visuals.</h3>
          </div>
          <div className="nd-gallery-grid">
            {gallery.map((g) => (
              <div key={g.id} className="g" style={{ position: "relative" }}>
                <MediaImage media={g.media} fill sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="nd-related" data-screen-label="05 Related">
          <div className="container">
            <div className="nc-grid-head">
              <div>
                <span className="microlabel">Read More</span>
                <h2 style={{ marginTop: 14, fontSize: "clamp(28px,2.8vw,40px)", fontWeight: 800, color: "var(--forest)", letterSpacing: "-0.02em" }}>Related Stories</h2>
              </div>
              <Link href="/news" className="btn btn-outline-dark">
                View All News <Arrow />
              </Link>
            </div>
            <div className="nc-grid">
              {(related as Array<Parameters<typeof NewsCard>[0]["item"]>).map((it, i) => (
                <NewsCard key={it.slug} item={it} lime={i === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="nc-cta" data-screen-label="06 CTA Banner">
        <div className="nc-cta-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=2000&q=80&auto=format&fit=crop)" }} />
        <div className="container">
          <div className="nc-cta-grid">
            <div>
              <span className="microlabel on-dark">Ready To Build</span>
              <h2>
                Need a <span className="accent">reliable</span> construction partner?
              </h2>
            </div>
            <div className="nc-cta-right">
              <p>Talk to the Zakir Enterprise project desk. We respond to every serious inquiry within two working days with a structured next step.</p>
              <div className="nc-cta-btns">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Let&apos;s Collaborate <Arrow />
                </Link>
                <Link href="/projects" className="btn btn-outline-light">
                  Explore Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
