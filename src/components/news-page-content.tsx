"use client";

import * as React from "react";
import { Arrow as NcA } from "./site-ui";

// News Corner - ported from legacy source to Next.js component

const NEWS_DATA = [
  {
    id: "road-dhaka-awarded",
    category: "Awarded Project",
    date: "March 18, 2026",
    dateISO: "2026-03-18",
    title: "Zakir Enterprise Awarded Major Road Development Project in Dhaka",
    excerpt: "A BDT 180 crore contract for a 42-kilometer four-lane corridor under the Roads & Highways Department strengthens our national infrastructure portfolio.",
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1600&q=80&auto=format&fit=crop",
    featured: true,
    readTime: "5 min read",
  },
  {
    id: "iso-9001-renewed",
    category: "Achievement",
    date: "March 02, 2026",
    dateISO: "2026-03-02",
    title: "ISO 9001:2015 Certification Successfully Renewed for Third Consecutive Cycle",
    excerpt: "Zakir Enterprise clears its annual quality management audit with zero non-conformities, underscoring a decade of process discipline.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "padma-bridge-milestone",
    category: "Milestone",
    date: "February 25, 2026",
    dateISO: "2026-02-25",
    title: "Padma South Connector Project Reaches 70% Structural Completion",
    excerpt: "Our civil works package on the Padma South corridor crosses a significant delivery milestone with superstructure erection complete.",
    image: "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
  {
    id: "lged-tender-submission",
    category: "Tender Notice",
    date: "February 12, 2026",
    dateISO: "2026-02-12",
    title: "Pre-Qualified for Three LGED Rural Infrastructure Tenders in Sylhet Division",
    excerpt: "Selection advances us to the technical evaluation round for combined works worth approximately BDT 310 crore.",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "csr-floods-rangpur",
    category: "CSR Activity",
    date: "January 30, 2026",
    dateISO: "2026-01-30",
    title: "Emergency Relief & Rebuild Program Launched Across Rangpur Flood-Affected Villages",
    excerpt: "Deploying machinery and workforce to restore access roads and culverts in twelve communities affected by the winter floods.",
    image: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
  {
    id: "excellence-award-2025",
    category: "Achievement",
    date: "January 14, 2026",
    dateISO: "2026-01-14",
    title: "Bangladesh Construction Excellence Award 2025 - Infrastructure Category Winner",
    excerpt: "Recognised for outstanding delivery on the Chattogram Industrial Access Road by the Association of Builders of Bangladesh.",
    image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1600&q=80&auto=format&fit=crop",
    featured: false,
    readTime: "3 min read",
  },
  {
    id: "new-batching-plant",
    category: "Announcement",
    date: "December 20, 2025",
    dateISO: "2025-12-20",
    title: "New High-Capacity Concrete Batching Plant Commissioned in Narayanganj",
    excerpt: "A 120 m3/hour facility expanding in-house concrete supply capability for the southern project corridor.",
    image: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "rhd-partnership-framework",
    category: "Announcement",
    date: "December 08, 2025",
    dateISO: "2025-12-08",
    title: "Framework Agreement Signed with Roads & Highways Department for 2026 Projects",
    excerpt: "A multi-project delivery framework positioning Zakir Enterprise for major highway and bridge works next year.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
  {
    id: "bauma-expo",
    category: "Event Participation",
    date: "November 22, 2025",
    dateISO: "2025-11-22",
    title: "Zakir Enterprise at BAUMA South Asia 2025 - Machinery & Methods Showcase",
    excerpt: "Our engineering team presented Bangladesh case studies and explored next-generation earthmoving equipment.",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1600&q=80&auto=format&fit=crop",
    readTime: "2 min read",
  },
  {
    id: "safety-milestone",
    category: "Milestone",
    date: "November 05, 2025",
    dateISO: "2025-11-05",
    title: "One Million Man-Hours Worked Without Lost-Time Injury Across Six Active Sites",
    excerpt: "A record safety milestone celebrated with workforce recognition and renewed HSE training commitments.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "osha-training",
    category: "Achievement",
    date: "October 18, 2025",
    dateISO: "2025-10-18",
    title: "120 Site Supervisors Complete Advanced OSHA-Aligned Safety Training",
    excerpt: "A structured safety leadership program rolled out across all regional project offices this quarter.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "cumilla-industrial-park",
    category: "Awarded Project",
    date: "October 02, 2025",
    dateISO: "2025-10-02",
    title: "Cumilla Industrial Park Site Development Contract Awarded",
    excerpt: "A BDT 95 crore earthwork, drainage and utility package for a new industrial zone under BEZA.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
];

const NEWS_CATEGORIES = [
  "Announcement",
  "Achievement",
  "Awarded Project",
  "Tender Notice",
  "CSR Activity",
  "Milestone",
  "Event Participation",
];

export function getNewsById(id: string) {
  return NEWS_DATA.find((n) => n.id === id);
}

const ARTICLE_BODIES: Record<string, { lead: string; sections: any[]; tags: string[] }> = {
  "road-dhaka-awarded": {
    lead: "Zakir Enterprise has been awarded a BDT 180 crore civil works contract under the Roads & Highways Department to deliver a 42-kilometer four-lane corridor expansion across Dhaka's eastern bypass - a significant strengthening of our national infrastructure portfolio and a decisive vote of confidence from the country's leading road authority.",
    sections: [
      { type: "h2", text: "A strategic national corridor" },
      { type: "p", text: "The newly awarded scope covers full-width road widening, median construction, rigid pavement works, stormwater drainage upgrades, and the construction of fourteen new RCC box culverts. Work will be executed over a 24-month delivery window, with the first site mobilization scheduled for April 2026." },
      { type: "p", text: "This corridor is a critical link between Dhaka's eastern periphery and the greater industrial belt. Once operational, it is expected to reduce heavy-vehicle transit times into the capital by nearly 40% and unlock further private investment along the route." },
      {
        type: "callout",
        stats: [
          { big: "BDT 180Cr", lbl: "Contract Value" },
          { big: "42 km", lbl: "Corridor Length" },
          { big: "24 mo", lbl: "Delivery Window" },
        ],
      },
      { type: "h2", text: "Scope of civil works" },
      { type: "p", text: "The integrated scope positions Zakir Enterprise across every layer of the road delivery stack - from earthwork and sub-base through to premium finishing and ancillary structures." },
      {
        type: "ul",
        items: [
          "Full-depth pavement reconstruction across 42 km",
          "14 new RCC box culverts and drainage structures",
          "Premium asphalt surfacing with a 12-year design life",
          "Median construction, side drains, and safety barriers",
          "Road markings, signage, and reflective safety systems",
          "Environmental compliance and community coordination",
        ],
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1617972740399-d6fae21ebf3f?w=1600&q=80&auto=format&fit=crop",
        cap: "Road widening works will begin with intensive subgrade preparation across the first 12 km package.",
      },
      {
        type: "quote",
        text: "Winning this corridor is a proud moment for our team. It reflects a decade of disciplined delivery and the trust our national partners continue to place in Zakir Enterprise.",
        cite: "Managing Director - Zakir Enterprise",
      },
      { type: "h2", text: "Mobilization and delivery approach" },
      { type: "p", text: "Two full-scale project camps will be established - one in Narayanganj and one in Keraniganj - with dedicated batching plants, fabrication yards and a safety-audited workforce exceeding 400 personnel at peak. Weekly progress dashboards will be published to the client through our digital project office." },
      { type: "p", text: "Execution will follow our standard QA/QC protocol with independent laboratory testing for subgrade, base course and surfacing, alongside a quarterly environmental compliance audit. A milestone-linked payment framework provides full transparency to all stakeholders throughout the delivery cycle." },
    ],
    tags: ["Roads & Highways", "RHD", "Infrastructure", "Dhaka", "2026 Projects"],
  },
};

function defaultBody(item: any) {
  return {
    lead: item.excerpt,
    sections: [
      { type: "h2", text: "Overview" },
      { type: "p", text: "Zakir Enterprise continues to deliver on its commitment to bring disciplined civil execution, safety-audited sites, and on-time handover to every corner of Bangladesh's construction industry. This update reflects ongoing momentum across our active portfolio." },
      {
        type: "callout",
        stats: [
          { big: "100+", lbl: "Completed Projects" },
          { big: "64", lbl: "Districts Covered" },
          { big: "10 Yrs", lbl: "Proven Delivery" },
        ],
      },
      { type: "h2", text: "Why this matters" },
      { type: "p", text: "Each achievement, milestone, tender or CSR activity we publish in the Zakir Enterprise newsroom reflects real, measurable work - delivered by real teams at real sites. We publish openly because transparency is how the construction industry earns long-term trust." },
      {
        type: "ul",
        items: [
          "Full compliance documentation on every project",
          "Transparent, milestone-linked progress reporting",
          "Zero-compromise policy on worker safety and site HSE",
          "Deployable project teams across all 64 districts",
        ],
      },
      {
        type: "quote",
        text: "We measure our reputation in projects handed over on time, not in announcements. Every story here is backed by a site with real delivery.",
        cite: "Zakir Enterprise - Project Desk",
      },
      { type: "h2", text: "What's next" },
      { type: "p", text: "Our project desk continues to welcome new partnerships, tender collaborations and client briefs across all construction service lines. Visitors interested in a structured conversation are encouraged to reach out through our collaboration desk." },
    ],
    tags: ["Zakir Enterprise", "Bangladesh", "Construction"],
  };
}

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
      <div className="nc-hero-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=2000&q=80&auto=format&fit=crop)" }}/>
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
  const body = ARTICLE_BODIES[item.id] || defaultBody(item);

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


