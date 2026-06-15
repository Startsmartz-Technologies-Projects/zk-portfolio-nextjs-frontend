"use client";

import * as React from "react";
import { Arrow as NcA } from "./site-ui";
import { NEWS_DATA, NEWS_CATEGORIES, getNewsById, getNewsBody } from "@/src/data/news-data";
export { getNewsById };

// News Corner - ported from legacy source to Next.js component


function Search({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <circle cx="11" cy="11" r="7"/>
      <line x1="16" y1="16" x2="21" y2="21"/>
    </svg>
  );
}

function Star({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9"/>
    </svg>
  );
}

function NcHero() {
  return (
    <section className="nc-hero" data-screen-label="01 News Hero">
      <div className="nc-hero-bg" style={{ backgroundImage: "url(https://res.cloudinary.com/dk4csiouq/image/upload/v1778498102/News_Corner_hero_tya9ru.jpg)" }}/>
      <div className="container nc-hero-inner">
        <div className="nc-crumbs">
          <a href="/">Home</a>
          <span className="sep">/</span>
          <span className="current">News Corner</span>
        </div>
        <h1>News <span className="accent">Corner</span></h1>
        <p className="hero-sub">Latest updates, achievements, project milestones and company announcements from Zakir Enterprise.</p>
        <div className="nc-hero-meta">
          <div className="m"><span className="k">Updated</span><span className="v">March 2026</span></div>
          <div className="m"><span className="k">Published</span><span className="v">{NEWS_DATA.length} Stories</span></div>
          <div className="m"><span className="k">Categories</span><span className="v">{NEWS_CATEGORIES.length} Topics</span></div>
          <div className="m"><span className="k">Featured</span><span className="v">Road Project Award</span></div>
        </div>
      </div>
    </section>
  );
}

function NcIntro() {
  return (
    <section className="nc-intro" data-screen-label="02 Intro">
      <div className="container">
        <span className="microlabel">Newsroom · Zakir Enterprise</span>
        <p>Stay updated with Zakir Enterprise's latest project wins, milestones, participation, certifications and company growth.</p>
      </div>
    </section>
  );
}

function NcToolbar({ query, setQuery, activeCat, setActiveCat, sort, setSort, counts }: any) {
  return (
    <div className="nc-toolbar" data-screen-label="03 Toolbar">
      <div className="container">
        <div className="nc-toolbar-inner">
          <div className="nc-search">
            <Search/>
            <input type="text" placeholder="Search news, achievements, projects..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="nc-chips-wrap">
            <button className={`nc-chip ${activeCat === "all" ? "active" : ""}`} onClick={() => setActiveCat("all")}>All <span className="count">{counts.all}</span></button>
            {NEWS_CATEGORIES.map((c) => (
              <button key={c} className={`nc-chip ${activeCat === c ? "active" : ""}`} onClick={() => setActiveCat(c)}>{c} <span className="count">{counts[c] || 0}</span></button>
            ))}
          </div>
          <div className="nc-sort">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function NcFeatured({ item }: { item: any }) {
  if (!item) return null;
  return (
    <section className="nc-featured" data-screen-label="04 Featured">
      <div className="container">
        <div className="nc-featured-card">
          <div className="nc-featured-img" style={{ backgroundImage: `url(${item.image})` }}>
            <div className="nc-featured-badge"><Star/> Featured Story</div>
          </div>
          <div className="nc-featured-body">
            <div className="nc-featured-meta">
              <span className="cat">{item.category}</span>
              <span className="dot"/>
              <span>{item.date}</span>
              <span className="dot"/>
              <span>{item.readTime}</span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.excerpt}</p>
            <div className="btn-row">
              <a href={`/news/${item.id}`} className="btn btn-primary">Read Full Story <NcA/></a>
              <a href="#grid" className="btn btn-outline-dark">Browse All News</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsCard({ item, limeIdx }: { item: any; limeIdx?: boolean }) {
  return (
    <a href={`/news/${item.id}`} className="news-card" style={{ textDecoration: "none" }}>
      <div className="news-card-img">
        <div className="img" style={{ backgroundImage: `url(${item.image})` }}/>
        <span className={`news-card-cat ${limeIdx ? "lime" : ""}`}>{item.category}</span>
      </div>
      <div className="news-card-body">
        <div className="news-card-meta"><span>{item.date}</span><span className="dot"/><span>{item.readTime}</span></div>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
        <span className="news-card-more">Read Article <NcA size={12}/></span>
      </div>
    </a>
  );
}

function NcGrid({ items, totalFiltered }: { items: any[]; totalFiltered: number }) {
  const PAGE = 6;
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE));

  React.useEffect(() => { setPage(1); }, [items.length]);

  const start = (page - 1) * PAGE;
  const visible = items.slice(start, start + PAGE);

  return (
    <section className="nc-grid-section" id="grid" data-screen-label="05 News Grid">
      <div className="container">
        <div className="nc-grid-head">
          <div><span className="microlabel">All Stories</span><h2 style={{ marginTop: 14 }}>Latest from the Newsroom</h2></div>
          <div className="count-label">Showing <strong style={{ color: "var(--forest)" }}>{visible.length}</strong> of {totalFiltered} stories · Page {page} of {totalPages}</div>
        </div>
        {items.length === 0 ? (
          <div className="nc-empty"><h3>No stories matched your filters.</h3><p>Try removing a filter or clearing your search.</p></div>
        ) : (
          <div className="nc-grid">{visible.map((it, i) => <NewsCard key={it.id} item={it} limeIdx={i === 0 || i === 4}/>)}</div>
        )}
        {totalPages > 1 && (
          <div className="nc-pagination">
            <button className="nc-page-btn nav-arrow" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>? Prev</button>
            {Array.from({ length: totalPages }).map((_, i) => <button key={i} className={`nc-page-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{String(i + 1).padStart(2, "0")}</button>)}
            <button className="nc-page-btn nav-arrow" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ?</button>
          </div>
        )}
      </div>
    </section>
  );
}

function NcTrustStrip() {
  const stats = [
    { big: "100+", lbl: "Completed Projects" },
    { big: "64", lbl: "Districts · Nationwide" },
    { big: "250+", lbl: "Skilled Workforce" },
    { big: "10 Yrs", lbl: "Proven Execution" },
  ];

  return (
    <section className="nc-trust-strip" data-screen-label="06 Trust Strip">
      <div className="container nc-trust-inner">
        <div><span className="microlabel on-dark">By the Numbers</span><h2 style={{ marginTop: 16 }}>Delivering real work, <span className="accent">every day.</span></h2></div>
        <div className="nc-trust-stats">{stats.map((s) => <div key={s.lbl} className="nc-trust-stat"><div className="big">{s.big}</div><div className="lbl">{s.lbl}</div></div>)}</div>
      </div>
    </section>
  );
}

function NcCTA() {
  return (
    <section className="nc-cta" data-screen-label="07 CTA Banner">
      <div className="nc-cta-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=2000&q=80&auto=format&fit=crop)" }}/>
      <div className="container">
        <div className="nc-cta-grid">
          <div><span className="microlabel on-dark">Ready To Build</span><h2>Let's build the <span className="accent">future</span> together.</h2></div>
          <div className="nc-cta-right">
            <p>Discuss your next construction project with Zakir Enterprise. Our project desk responds within two working days with a structured next step.</p>
            <div className="nc-cta-btns">
              <a href="/lets-collaborate" className="btn btn-primary">Let's Collaborate <NcA/></a>
              <a href="/#contact" className="btn btn-outline-light">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsPageContent() {
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState("all");
  const [sort, setSort] = React.useState("latest");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: NEWS_DATA.length };
    NEWS_CATEGORIES.forEach((k) => { c[k] = 0; });
    NEWS_DATA.forEach((n) => { if (c[n.category] !== undefined) c[n.category]++; });
    return c;
  }, []);

  const list = React.useMemo(() => {
    let arr = NEWS_DATA.slice();
    if (activeCat !== "all") arr = arr.filter((n) => n.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((n) => n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q) || n.category.toLowerCase().includes(q));
    }
    if (sort === "latest") arr.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    if (sort === "oldest") arr.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    if (sort === "featured") arr.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return arr;
  }, [query, activeCat, sort]);

  const featured = React.useMemo(() => NEWS_DATA.find((n) => n.featured) || NEWS_DATA[0], []);
  const gridItems = React.useMemo(() => list.filter((n) => n.id !== featured.id), [list, featured]);

  return (
    <>
      <NcHero/>
      <NcIntro/>
      <NcToolbar query={query} setQuery={setQuery} activeCat={activeCat} setActiveCat={setActiveCat} sort={sort} setSort={setSort} counts={counts} />
      <NcFeatured item={featured}/>
      <NcGrid items={gridItems} totalFiltered={list.length}/>
      <NcTrustStrip/>
      <NcCTA/>
    </>
  );
}

function NdHero({ item }: { item: any }) {
  return (
    <section className="nd-hero" data-screen-label="01 Article Hero">
      <div className="nd-hero-bg" style={{ backgroundImage: `url(${item.image})` }}/>
      <div className="nd-hero-inner">
        <div className="nc-crumbs">
          <a href="/">Home</a>
          <span className="sep">/</span>
          <a href="/news">News</a>
          <span className="sep">/</span>
          <span className="current">{item.category}</span>
        </div>
        <div className="nd-header-meta" style={{ marginTop: 24 }}>
          <span className="nd-pill">{item.category}</span>
          <span className="nd-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <rect x="3" y="5" width="18" height="16" rx="1" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="3" x2="8" y2="7" />
              <line x1="16" y1="3" x2="16" y2="7" />
            </svg>
            {item.date}
          </span>
          <span className="nd-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12,7 12,12 16,14" />
            </svg>
            {item.readTime}
          </span>
        </div>
        <h1>{item.title}</h1>
        <div className="nd-author">
          <div className="nd-author-avatar">ZE</div>
          <div className="nd-author-info">
            <div className="name">Editorial Desk</div>
            <div className="role">Zakir Enterprise Newsroom</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShareIc({ k }: { k: "li" | "fb" | "x" | "link" }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" };
  const paths = {
    li: "M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18.3 18h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V18h-2.6V9.7h2.5v1.1h0a2.7 2.7 0 0 1 2.5-1.4c2.6 0 3.1 1.7 3.1 4V18z",
    fb: "M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2h2V2.1C16.5 2 15.5 2 14.5 2 11.8 2 10 3.7 10 6.7V10H7v4h3v8h3z",
    x: "M18 2h3.3l-7.2 8.2L22.5 22h-6.6l-5.2-6.8L4.8 22H1.4l7.7-8.8L1.6 2h6.8l4.7 6.2L18 2zm-1.2 18h1.8L7.3 4h-2l11.5 16z",
    link: "",
  };
  if (k === "link")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d={paths[k]} />
    </svg>
  );
}

function NdFeaturedImage({ item }: { item: any }) {
  return (
    <div className="nd-featured-img" data-screen-label="02 Hero Image">
      <div className="frame" style={{ backgroundImage: `url(${item.image})` }} />
      <div className="container">
        <div className="nd-featured-caption">Photo · On-site coverage from the {item.category.toLowerCase()} announcement.</div>
      </div>
    </div>
  );
}

function NdArticleBody({ item, body }: { item: any; body: any }) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copy = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const renderSection = (s: any, idx: number) => {
    if (s.type === "h2") return <h2 key={idx}>{s.text}</h2>;
    if (s.type === "h3") return <h3 key={idx}>{s.text}</h3>;
    if (s.type === "p") return <p key={idx}>{s.text}</p>;
    if (s.type === "ul") return <ul key={idx}>{s.items.map((it: string, i: number) => <li key={i}>{it}</li>)}</ul>;
    if (s.type === "quote") {
      return (
        <div key={idx} className="nd-quote">
          <blockquote>
            {s.text}
            <cite>{s.cite}</cite>
          </blockquote>
        </div>
      );
    }
    if (s.type === "callout") {
      return (
        <div key={idx} className="nd-callout">
          {s.stats.map((st: { big: string; lbl: string }, i: number) => (
            <div key={i} className="stat">
              <div className="big">{st.big}</div>
              <div className="lbl">{st.lbl}</div>
            </div>
          ))}
        </div>
      );
    }
    if (s.type === "image") {
      return (
        <div key={idx} className="nd-inline-img">
          <div className="frame" style={{ backgroundImage: `url(${s.src})` }} />
          {s.cap ? <div className="cap">{s.cap}</div> : null}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="nd-article" data-screen-label="03 Article Body">
      <div className="nd-article-inner">
        <aside className="nd-share-rail">
          <span className="lbl">Share</span>
          <a className="nd-share-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
            <ShareIc k="li" />
          </a>
          <a className="nd-share-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
            <ShareIc k="fb" />
          </a>
          <a className="nd-share-btn" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(item.title)}`} target="_blank" rel="noopener noreferrer">
            <ShareIc k="x" />
          </a>
          <button className={`nd-share-btn ${copied ? "copied" : ""}`} onClick={copy} title="Copy link">
            {copied ? "✓" : <ShareIc k="link" />}
          </button>
        </aside>
        <div className="nd-body">
          <p className="lead">{body.lead}</p>
          {body.sections.map(renderSection)}
          <div className="nd-tags">
            <span className="lbl">Tags</span>
            {body.tags.map((t: string) => (
              <a key={t} href="/news" className="nd-tag">
                #{t}
              </a>
            ))}
          </div>
          <div className="nd-share-mobile">
            <a className="nd-share-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <ShareIc k="li" />
            </a>
            <a className="nd-share-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <ShareIc k="fb" />
            </a>
            <a className="nd-share-btn" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(item.title)}`} target="_blank" rel="noopener noreferrer">
              <ShareIc k="x" />
            </a>
            <button className={`nd-share-btn ${copied ? "copied" : ""}`} onClick={copy}>
              {copied ? "✓" : <ShareIc k="link" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function NdGallery() {
  const imgs = [
    "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=1400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590155520778-c38bd85dfd6e?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1617972740399-d6fae21ebf3f?w=900&q=80&auto=format&fit=crop",
  ];
  return (
    <section className="nd-gallery" data-screen-label="04 Gallery">
      <div className="nd-gallery-head">
        <span className="microlabel">Project Gallery</span>
        <h3>From the site - supporting visuals.</h3>
      </div>
      <div className="nd-gallery-grid">{imgs.map((src, i) => <div key={i} className="g" style={{ backgroundImage: `url(${src})` }} />)}</div>
    </section>
  );
}

function NdRelated({ currentId }: { currentId: string }) {
  const items = NEWS_DATA.filter((n) => n.id !== currentId).slice(0, 3);
  return (
    <section className="nd-related" data-screen-label="05 Related">
      <div className="container">
        <div className="nc-grid-head"><div><span className="microlabel">Read More</span><h2 style={{ marginTop: 14, fontSize: "clamp(28px,2.8vw,40px)", fontWeight: 800, color: "var(--forest)", letterSpacing: "-0.02em" }}>Related Stories</h2></div><a href="/news" className="btn btn-outline-dark">View All News <NcA/></a></div>
        <div className="nc-grid">{items.map((it, i) => <NewsCard key={it.id} item={it} limeIdx={i === 0}/>)}</div>
      </div>
    </section>
  );
}

function NdCTA() {
  return (
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
              <a href="/lets-collaborate" className="btn btn-primary">
                Let's Collaborate <NcA />
              </a>
              <a href="/projects" className="btn btn-outline-light">
                Explore Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsDetailPageContent({ itemId }: { itemId?: string }) {
  const item = getNewsById(itemId || "") || NEWS_DATA.find((n) => n.featured) || NEWS_DATA[0];
  const body = getNewsBody(item);

  return (
    <>
      <NdHero item={item}/>
      <NdFeaturedImage item={item}/>
      <NdArticleBody item={item} body={body}/>
      <NdGallery/>
      <NdRelated currentId={item.id}/>
      <NdCTA/>
    </>
  );
}


