import Link from "next/link";
import { Arrow, ArrowUpRight, SvcIcon } from "../site-ui";
import { MediaImage } from "../media/media-image";
import { isImageRef } from "@/src/lib/media/ref";
import { Counter } from "./counter";
import { ClientsFilter } from "./clients-filter";
import { IntentCards } from "./intent-cards";
import { Testimonials, type TestimonialItem } from "./testimonials";
import { type ProjectCardData, badgeClass } from "../projects/project-card";
import type { MediaRef } from "@/lib/data/media";

// PAGES section renderer (pages-fe-public §A). Server component: iterates a published page's
// resolved `sections[]` and maps each `section.type` → markup, reusing the existing site CSS
// classes verbatim so the look is unchanged. Stat values arrive pre-resolved from the data layer
// (§B). Collection-backed sections (source_key) get their records passed in via `records` and
// render the chrome from PAGES + the records from the collection's lib/data (§C).

// ── Public shapes (subset of getPublishedPage()'s section output) ──────────
type Cta = { label: string; url: string } | null;
export type PageItem = {
  id?: string;
  icon?: string | null;
  image?: MediaRef | null;
  tag?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  value?: string | null;
  unit?: string | null;
  stat_key?: string | null;
  is_active?: boolean | null;
  link_url?: string | null;
  link_label?: string | null;
  // Resolved stat_strip/achievements items use label/sublabel (the data layer maps title→label).
  label?: string | null;
  sublabel?: string | null;
  meta?: unknown; // e.g. mvv "Core Values" → { values: string[] }
};
export type PageSection = {
  type: string;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  variant: string | null;
  background_image: MediaRef | null;
  cta_primary: Cta;
  cta_secondary: Cta;
  settings: unknown;
  items?: PageItem[];
  source_key?: string | null;
  max_items?: number | null;
};

// Records resolved by the page route for each collection-backed section, keyed by source_key.
export type SectionRecords = {
  projects?: ProjectCardData[];
  services?: Array<{ slug: string; title: string; subtitle: string | null; icon: string | null; hero_image: MediaRef | null; service_number: number }>;
  certifications?: Array<{ slug: string; seal_label: string | null; seal_id: string | null; seal_validity: string | null; category: { label: string } | null }>;
  // SITE contact for the Collaborate contact_panel chrome (§E).
  contact?: { phone: string; email: string; officeAddress: string };
};

// ── Small shared bits ───────────────────────────────────────────────────────
// Fixed checkmark for the "Why us" commitment tiles (matches the original about page —
// every tile shows the same lime tick in a dark box, not a per-item icon).
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      <polyline points="4,12 10,18 20,6" />
    </svg>
  );
}

function SectionHead({ s, num }: { s: PageSection; num?: string }) {
  // The right-column lede may arrive as `subheading` or `body` (the seed stores the
  // section description in `body` for most home/about sections) — render whichever is set.
  const headRight = s.subheading ?? s.body;
  return (
    <div className="section-head">
      <div>
        {(num || s.eyebrow) && <span className="num">{num ?? s.eyebrow}</span>}
        {s.heading && <h2>{s.heading}</h2>}
      </div>
      {headRight && <p className="head-right">{headRight}</p>}
    </div>
  );
}

function ctaButtons(s: PageSection, primaryClass = "btn btn-primary", secondaryClass = "btn btn-outline-light") {
  return (
    <>
      {s.cta_primary && (
        <Link href={s.cta_primary.url} className={primaryClass}>
          {s.cta_primary.label} <Arrow />
        </Link>
      )}
      {s.cta_secondary && (
        <Link href={s.cta_secondary.url} className={secondaryClass}>
          {s.cta_secondary.label}
        </Link>
      )}
    </>
  );
}

// ── Section type → markup ────────────────────────────────────────────────────
// Hero chrome that has no first-class column lives in `settings` (PAGES seed §8.5):
// `ticker` = the rotated side label, `bottom` = the location strip, `accent` = the word
// in `heading` rendered in the lime accent colour. All optional — absent → not rendered.
type HeroSettings = { ticker?: string; bottom?: string; accent?: string };
const heroSettings = (s: unknown): HeroSettings => (s && typeof s === "object" ? (s as HeroSettings) : {});

/** Render `heading` with the first occurrence of `accent` wrapped in the lime `.accent`
 *  span (matches the original static hero). No accent / no match → the plain heading. */
function HeroHeading({ heading, accent }: { heading: string; accent?: string }) {
  if (!accent) return <h1>{heading}</h1>;
  const at = heading.indexOf(accent);
  if (at < 0) return <h1>{heading}</h1>;
  return (
    <h1>
      {heading.slice(0, at)}
      <span className="accent">{accent}</span>
      {heading.slice(at + accent.length)}
    </h1>
  );
}

// The About-page inner hero is a light split layout (copy left, image + caption + green
// "15+" stamp right), distinct from the dark full-bleed home hero. Its signature is the
// `settings.stamp` badge. Markup mirrors the original about-page-content `about-hero`.
type AboutStamp = { value?: string; unit?: string; label?: string };
type AboutHeroSettings = { stamp?: AboutStamp; tag?: string; accent?: string };
const aboutHeroSettings = (s: unknown): AboutHeroSettings => (s && typeof s === "object" ? (s as AboutHeroSettings) : {});

function AboutHero({ s }: { s: PageSection }) {
  const settings = aboutHeroSettings(s.settings);
  const stamp = settings.stamp;
  // Default caption matches the original static about hero when none is seeded.
  const tag = settings.tag ?? "Modern commercial building visual with 15+ years highlight.";
  return (
    <section className="about-hero" data-screen-label="01 About Hero">
      <div className="container">
        <div className="about-hero-grid">
          <div>
            {(s.eyebrow || s.subheading) && <span className="microlabel">{s.eyebrow ?? s.subheading}</span>}
            {s.heading && <HeroHeading heading={s.heading} accent={settings.accent} />}
            {s.body && <p className="sub">{s.body}</p>}
            <div className="about-hero-buttons">
              {s.cta_primary && (
                <Link href={s.cta_primary.url} className="btn btn-primary">
                  {s.cta_primary.label} <Arrow />
                </Link>
              )}
              {s.cta_secondary && (
                <Link href={s.cta_secondary.url} className="btn btn-outline-dark">
                  {s.cta_secondary.label} <ArrowUpRight />
                </Link>
              )}
            </div>
          </div>
          <div className="about-hero-visual">
            <div className="main">
              <MediaImage media={s.background_image} fill sizes="(max-width: 980px) 100vw, 50vw" />
            </div>
            {tag && <div className="tag">{tag}</div>}
            {stamp && (stamp.value || stamp.label) && (
              <div className="stamp">
                {stamp.value && (
                  <div className="big">
                    {stamp.value}
                    {stamp.unit ?? ""}
                  </div>
                )}
                {stamp.label && <div className="lbl">{stamp.label}</div>}
              </div>
            )}
          </div>
        </div>
        <div className="crumb-about">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <span style={{ color: "var(--black)" }}>About Us</span>
        </div>
      </div>
    </section>
  );
}

function HeroSection({ s }: { s: PageSection }) {
  // An About-style hero (carries the green "15+" stamp) uses the light split layout.
  if (aboutHeroSettings(s.settings).stamp) return <AboutHero s={s} />;
  const settings = heroSettings(s.settings);
  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="hero-bg">
        <MediaImage media={s.background_image} fill priority sizes="100vw" />
      </div>
      {settings.ticker && (
        <div className="hero-sidecol">
          <span className="hero-sideticker">{settings.ticker}</span>
        </div>
      )}
      <div className="container hero-inner">
        {(s.eyebrow || s.subheading) && <span className="microlabel on-dark">{s.eyebrow ?? s.subheading}</span>}
        {s.heading && <HeroHeading heading={s.heading} accent={settings.accent} />}
        {s.body && <p className="lede">{s.body}</p>}
        <div className="hero-cta-row">
          {s.cta_primary && (
            <Link href={s.cta_primary.url} className="btn btn-primary">
              {s.cta_primary.label} <Arrow />
            </Link>
          )}
          {s.cta_secondary && (
            <Link href={s.cta_secondary.url} className="btn btn-outline-light">
              {s.cta_secondary.label} <ArrowUpRight />
            </Link>
          )}
        </div>
        {(s.items?.length ?? 0) > 0 && (
          <div className="hero-badges">
            {s.items!.map((it) => (
              <div key={it.id}>
                <span className="badge-label">{it.title}</span>
                <span className="badge-caption">{it.subtitle}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {settings.bottom && (
        <div className="hero-bottom">
          <span>{settings.bottom}</span>
        </div>
      )}
    </section>
  );
}

function StatStrip({ s }: { s: PageSection }) {
  return (
    <section className="section-pad section-soft" data-screen-label="Stats">
      <div className="container">
        {(s.heading || s.eyebrow) && <SectionHead s={s} />}
        <div className="stats">
          {(s.items ?? []).map((it, idx) => {
            // Resolved stat items expose label/sublabel (data layer) — fall back to title/subtitle.
            const label = it.label ?? it.title;
            const sublabel = it.sublabel ?? it.subtitle;
            const n = Number.parseInt(it.value ?? "", 10);
            return (
              <div key={it.id ?? idx} className="stat">
                <div className="stat-num">
                  {Number.isFinite(n) ? (
                    <Counter to={n} suffix={it.unit ?? ""} />
                  ) : (
                    <span>
                      {it.value}
                      {it.unit}
                    </span>
                  )}
                </div>
                <div className="stat-label">{label}</div>
                {sublabel && <div className="stat-sub">{sublabel}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExpertiseCards({ s }: { s: PageSection }) {
  return (
    <section className="section-pad" data-screen-label="Expertise">
      <div className="container">
        <SectionHead s={s} />
        <div className="expertise-grid">
          {(s.items ?? []).map((it) => {
            const Card = (
              <>
                <div className="exp-img">
                  <MediaImage media={it.image} fill sizes="(max-width: 980px) 100vw, 33vw" />
                  {it.tag && <span className="exp-tag">{it.tag}</span>}
                </div>
                <div className="exp-body">
                  <h3>{it.title}</h3>
                  {it.body && <p>{it.body}</p>}
                  {it.link_url && (
                    <span className="exp-link">
                      {it.link_label ?? "Learn more"} <Arrow size={12} />
                    </span>
                  )}
                </div>
              </>
            );
            return it.link_url ? (
              <Link key={it.id} href={it.link_url} className="exp-card" style={{ textDecoration: "none", color: "inherit" }}>
                {Card}
              </Link>
            ) : (
              <div key={it.id} className="exp-card">
                {Card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// The image-overlay stat card (e.g. "15+ Years delivering…") lives in `settings.overlay`.
type AboutOverlay = { value?: string; unit?: string; label?: string };
type AboutSettings = { overlay?: AboutOverlay; accent?: string };
const aboutSettings = (s: unknown): AboutSettings => (s && typeof s === "object" ? (s as AboutSettings) : {});

/** Heading with the trailing `accent` phrase in the gold-italic display style (the original
 *  static About styled "building trust." this way). No accent / no match → plain heading. */
function AboutHeading({ heading, accent }: { heading: string; accent?: string }) {
  const gold = { color: "var(--gold)", fontStyle: "italic" as const, fontWeight: 500 };
  if (!accent) return <h2 style={{ marginTop: 18 }}>{heading}</h2>;
  const at = heading.indexOf(accent);
  if (at < 0) return <h2 style={{ marginTop: 18 }}>{heading}</h2>;
  return (
    <h2 style={{ marginTop: 18 }}>
      {heading.slice(0, at)}
      <span style={gold}>{accent}</span>
      {heading.slice(at + accent.length)}
    </h2>
  );
}

function AboutIntro({ s }: { s: PageSection }) {
  const settings = aboutSettings(s.settings);
  const overlay = settings.overlay;
  // Eyebrow may be stored in `eyebrow` or `subheading` (seed put "About …" in subheading).
  const eyebrow = s.eyebrow ?? s.subheading;
  return (
    <section className="section-pad" data-screen-label="About">
      <div className="container">
        <div className="about-grid">
          <div className="about-img">
            <MediaImage media={s.background_image} fill sizes="(max-width: 980px) 100vw, 50vw" />
            {overlay && (overlay.value || overlay.label) && (
              <div className="overlay-card">
                {overlay.value && (
                  <div className="big">
                    {overlay.value}
                    {overlay.unit ?? ""}
                  </div>
                )}
                {overlay.label && <div className="lbl">{overlay.label}</div>}
              </div>
            )}
          </div>
          <div className="about-copy">
            {eyebrow && <span className="microlabel">{eyebrow}</span>}
            {s.heading && <AboutHeading heading={s.heading} accent={settings.accent} />}
            {s.body && <p className="lead">{s.body}</p>}
            {(s.items?.length ?? 0) > 0 && (
              <ul className="about-points">
                {s.items!.map((it) => (
                  <li key={it.id}>{it.title}</li>
                ))}
              </ul>
            )}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {s.cta_primary && (
                <Link href={s.cta_primary.url} className="btn btn-dark">
                  {s.cta_primary.label} <Arrow />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProjects({ s, records }: { s: PageSection; records: SectionRecords }) {
  const projects = (records.projects ?? []).slice(0, s.max_items ?? 6);
  if (projects.length === 0) return null;
  return (
    <section className="section-pad section-soft" data-screen-label="Featured Projects">
      <div className="container">
        <SectionHead s={s} />
        <div className="projects-grid">
          {projects.map((p, i) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className={`project ${i === 0 ? "tall" : ""}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="p-img">
                <MediaImage media={p.cover_image} fill sizes="(max-width: 980px) 100vw, 33vw" />
              </div>
              {(p.location_detail || p.location?.label) && <span className="p-size">{p.location_detail || p.location?.label}</span>}
              <div className="p-body">
                <div>
                  {p.category && <div className="p-cat">{p.category.label}</div>}
                  <h3>{p.title}</h3>
                </div>
                <div className="p-arrow">
                  <ArrowUpRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {s.cta_primary && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
            <Link href={s.cta_primary.url} className="btn btn-dark">
              {s.cta_primary.label} <Arrow />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedServices({ s, records }: { s: PageSection; records: SectionRecords }) {
  const services = (records.services ?? []).slice(0, s.max_items ?? 6);
  if (services.length === 0) return null;
  return (
    <section className="section-pad" data-screen-label="Services">
      <div className="container">
        <SectionHead s={s} />
        <div className="services-feature-grid">
          {services.map((svc) => (
            <article key={svc.slug} className="svc-feature">
              <div className="svc-feature-media">
                <MediaImage media={svc.hero_image} fill sizes="(max-width: 980px) 100vw, 33vw" />
              </div>
              <div className="svc-feature-body">
                <div className="svc-feature-top">
                  <span className="svc-feature-num">{String(svc.service_number).padStart(2, "0")}</span>
                  <div className="svc-icon">
                    <SvcIcon kind={svc.icon ?? ""} />
                  </div>
                </div>
                <h4>{svc.title}</h4>
                {svc.subtitle && <p>{svc.subtitle}</p>}
                <Link href={`/service-details/${svc.slug}`} className="svc-feature-view">
                  View Service <Arrow size={12} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        {s.cta_primary && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 42 }}>
            <Link href={s.cta_primary.url} className="btn btn-dark">
              {s.cta_primary.label} <Arrow />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCertifications({ s, records }: { s: PageSection; records: SectionRecords }) {
  const certs = (records.certifications ?? []).slice(0, s.max_items ?? 4);
  if (certs.length === 0) return null;
  return (
    <section id="certifications" className="section-pad" data-screen-label="Certifications">
      <div className="container">
        <SectionHead s={s} />
        <div className="certs-grid certs-grid-one-row">
          {certs.map((c) => (
            <Link key={c.slug} href={`/certifications?preview=${encodeURIComponent(c.slug)}#certs`} className="cert" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="cert-seal" style={{ whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.05 }}>
                {c.seal_label}
              </div>
              <div>
                <h4>{c.category?.label ?? c.seal_label}</h4>
                <div className="cert-id">{c.seal_id}</div>
              </div>
              <div className="cert-valid">{c.seal_validity}</div>
            </Link>
          ))}
        </div>
        {s.cta_primary && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
            <Link href={s.cta_primary.url} className="btn btn-dark">
              {s.cta_primary.label} <Arrow />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function LogoWall({ s }: { s: PageSection }) {
  const items = s.items ?? [];
  if (items.length === 0) return null;
  // Eyebrow may arrive as `eyebrow` or `subheading` (seed stored "Trusted by…" in subheading).
  const eyebrow = s.eyebrow ?? s.subheading;
  return (
    <section className="section-pad-sm section-soft" data-screen-label="Trusted">
      <div className="container">
        <div className="section-head single" style={{ textAlign: "center" }}>
          <div>
            {eyebrow && <span className="microlabel">{eyebrow}</span>}
            {s.heading && <h2 style={{ marginTop: 14, fontSize: "clamp(28px, 3vw, 40px)" }}>{s.heading}</h2>}
          </div>
        </div>
        <div className="trusted-wall">
          {items.map((it) => (
            <div key={it.id} className="trusted-logo">
              {it.title}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Initials for the testimonial avatar: prefer the seeded `meta.initials`, else derive from
// the author name (first letter of the first two words).
function initialsOf(item: PageItem): string {
  const meta = item.meta as { initials?: unknown } | null;
  if (meta && typeof meta.initials === "string" && meta.initials.trim()) return meta.initials.trim();
  const name = (item.title ?? "").trim();
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
}

function TestimonialsSection({ s }: { s: PageSection }) {
  const items: TestimonialItem[] = (s.items ?? [])
    .filter((it) => (it.body ?? "").trim().length > 0)
    .map((it) => ({
      id: it.id,
      quote: it.body ?? "",
      author: it.title ?? "",
      role: it.subtitle ?? null,
      initials: initialsOf(it),
    }));
  if (items.length === 0) return null;
  // Eyebrow stored in `subheading` (the seed put "Client Voice" there); body is the left-column lede.
  return <Testimonials eyebrow={s.eyebrow ?? s.subheading} heading={s.heading} intro={s.body} items={items} />;
}

function CtaBanner({ s }: { s: PageSection }) {
  return (
    <section className="cta-banner" data-screen-label="CTA">
      <div className="cta-bg">
        <MediaImage media={s.background_image} fill sizes="100vw" />
      </div>
      <div className="container">
        <div className="cta-inner">
          <div>
            {s.eyebrow && <span className="microlabel on-dark">{s.eyebrow}</span>}
            {s.heading && <h2>{s.heading}</h2>}
          </div>
          <div className="cta-right">
            {s.body && <p>{s.body}</p>}
            <div className="cta-btns">{ctaButtons(s)}</div>
          </div>
        </div>
        {(s.items?.length ?? 0) > 0 && (
          <div className="cta-feats">
            {s.items!.map((it) => (
              <div key={it.id} className="cta-feat">
                <div className="k">{it.subtitle}</div>
                <div className="v">{it.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Generic centered CTA used by `final_cta` and other simple banners (trust-cta look). */
function FinalCta({ s }: { s: PageSection }) {
  return (
    <section className="trust-cta" data-screen-label="Final CTA">
      <div className="container">
        <div className="trust-cta-inner">
          <div>
            {s.eyebrow && <span className="microlabel on-dark">{s.eyebrow}</span>}
            {s.heading && <h2 style={{ marginTop: 20 }}>{s.heading}</h2>}
          </div>
          <div>
            {s.body && <p>{s.body}</p>}
            <div className="trust-cta-buttons">{ctaButtons(s)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── About sections ───────────────────────────────────────────────────────────
function StorySection({ s }: { s: PageSection }) {
  const items = s.items ?? [];
  // Mixed items: image items form the collage; the rest are stats (value/statKey + label).
  const collage = items.filter((it) => isImageRef(it.image));
  const stats = items.filter((it) => !isImageRef(it.image) && (it.value || it.title));
  const badge = (typeof s.settings === "object" && s.settings ? (s.settings as { badge?: string }).badge : undefined);
  return (
    <section className="story-section">
      <div className="container">
        <div className="story-grid">
          <div className="story-collage">
            {badge && <div className="badge">{badge}</div>}
            {collage.map((it, idx) => (
              <div key={it.id ?? idx} className={idx === 0 ? "cell tall" : "cell"} style={{ position: "relative", overflow: "hidden" }}>
                <MediaImage media={it.image} fill sizes="(max-width: 980px) 50vw, 25vw" />
              </div>
            ))}
          </div>
          <div className="story-copy">
            {(s.eyebrow || s.subheading) && <span className="microlabel">{s.eyebrow ?? s.subheading}</span>}
            {s.heading && <h2>{s.heading}</h2>}
            {s.body && <p>{s.body}</p>}
            {stats.length > 0 && (
              <div className="story-stats">
                {stats.map((it, idx) => (
                  <div key={it.id ?? idx} className="item">
                    <div className="n">
                      {it.value ?? ""}
                      {it.unit && <span className="plus">{it.unit}</span>}
                    </div>
                    <div className="lbl">{it.label ?? it.title}</div>
                  </div>
                ))}
              </div>
            )}
            {s.cta_primary && (
              <Link href={s.cta_primary.url} className="btn btn-dark">
                {s.cta_primary.label} <Arrow />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MvvSection({ s }: { s: PageSection }) {
  return (
    <section className="mvv-section">
      <div className="container">
        <SectionHead s={s} />
        <div className="mvv-grid">
          {(s.items ?? []).map((it, idx) => {
            const values = (it.meta as { values?: string[] } | null)?.values ?? [];
            return (
              <div key={it.id} className={`mvv-card ${idx === 1 ? "highlight" : ""}`.trim()}>
                {it.icon && (
                  <div className="mvv-ico">
                    <SvcIcon kind={it.icon} />
                  </div>
                )}
                <h3>{it.title}</h3>
                {it.body && <p>{it.body}</p>}
                {values.length > 0 && (
                  <ul className="mvv-values">
                    {values.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TimelineSection({ s }: { s: PageSection }) {
  const items = s.items ?? [];
  // Eyebrow stored in `subheading` ("Work Process"); the intro paragraph is `body`.
  const eyebrow = s.eyebrow ?? s.subheading;
  return (
    <section className="cd-process">
      <div className="container">
        <div className="cd-section-head">
          <div>
            {eyebrow && <span className="microlabel on-dark">{eyebrow}</span>}
            {s.heading && <h2>{s.heading}</h2>}
          </div>
          {s.body && <p>{s.body}</p>}
        </div>
        <div className="cd-process-track">
          {items.map((t, i) => (
            <div key={t.id ?? i} className={`cd-process-step ${t.is_active ? "active" : ""}`.trim()}>
              <div className="cd-process-connector">
                <span className="cd-process-dot" />
                {i < items.length - 1 && <span className="cd-process-line" />}
              </div>
              <div className="cd-process-body">
                <div className="cd-process-num">{t.value}</div>
                <h4>{t.title}</h4>
                {t.body && <p>{t.body}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Leadership message chrome lives in `settings`: `quote` (the pulled blockquote) and
// `signature` ({ name, role }) shown on the portrait card and the sign-off line.
type LeaderSettings = { quote?: string; signature?: { name?: string; role?: string } };
const leaderSettings = (s: unknown): LeaderSettings => (s && typeof s === "object" ? (s as LeaderSettings) : {});

function LeadershipMessage({ s }: { s: PageSection }) {
  const settings = leaderSettings(s.settings);
  const sig = settings.signature;
  const eyebrow = s.eyebrow ?? s.subheading;
  // The intro is one `body` string; split on blank lines so multi-paragraph copy keeps its breaks.
  const paras = (s.body ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <section className="leader-msg">
      <div className="container">
        <div className="leader-msg-grid">
          <div className="leader-portrait">
            <MediaImage media={s.background_image} fill sizes="(max-width: 980px) 100vw, 40vw" />
            {sig && (sig.name || sig.role) && (
              <div className="signature">
                {sig.name && <div className="name">{sig.name}</div>}
                {sig.role && <div className="role">{sig.role}</div>}
              </div>
            )}
          </div>
          <div className="leader-copy">
            {eyebrow && <span className="microlabel">{eyebrow}</span>}
            {s.heading && <h2>{s.heading}</h2>}
            {settings.quote && (
              <div className="leader-quote">
                <p>&ldquo;{settings.quote}&rdquo;</p>
              </div>
            )}
            {paras.map((p, i) => (
              <p key={i} className="body">
                {p}
              </p>
            ))}
            {sig && (sig.name || sig.role) && (
              <div className="leader-signoff">
                <div>
                  {sig.name && <div className="name">{sig.name}</div>}
                  {sig.role && <div className="role">{sig.role}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyUsSection({ s }: { s: PageSection }) {
  return (
    <section className="why-section">
      <div className="container">
        <SectionHead s={s} />
        <div className="why-grid">
          {(s.items ?? []).map((it, i) => (
            <div key={it.id ?? i} className="why-item">
              <div className="why-ico">{it.icon ? <SvcIcon kind={it.icon} /> : <CheckIcon />}</div>
              <h4>{it.title}</h4>
              {(it.body ?? it.subtitle) && <p>{it.body ?? it.subtitle}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AchievementsSection({ s }: { s: PageSection }) {
  // Eyebrow stored in `subheading` ("By the Numbers"); the centered dark head uses `.ach-head`.
  const eyebrow = s.eyebrow ?? s.subheading;
  return (
    <section className="ach-section">
      <div className="container">
        <div className="ach-head">
          {eyebrow && <span className="microlabel on-dark">{eyebrow}</span>}
          {s.heading && <h2>{s.heading}</h2>}
        </div>
        <div className="ach-grid">
          {(s.items ?? []).map((it, idx) => {
            const label = it.label ?? it.title;
            const n = Number.parseInt(it.value ?? "", 10);
            return (
              <div key={it.id ?? idx} className="ach-cell">
                <div className="n">
                  {Number.isFinite(n) ? <Counter to={n} suffix={it.unit ?? ""} /> : <>{it.value}<span className="unit">{it.unit}</span></>}
                </div>
                <div className="lbl">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClientsFilterable({ s }: { s: PageSection }) {
  const items = (s.items ?? []).map((it) => ({ id: it.id, tag: it.tag ?? null, title: it.title ?? null }));
  if (items.length === 0) return null;
  const eyebrow = s.eyebrow ?? s.subheading;
  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-head">
          {eyebrow && <span className="microlabel" style={{ justifyContent: "center" }}>{eyebrow}</span>}
          {s.heading && <h2>{s.heading}</h2>}
        </div>
        <ClientsFilter items={items} />
      </div>
    </section>
  );
}

// ── Collaborate sections ─────────────────────────────────────────────────────
function TrustHook({ s }: { s: PageSection }) {
  return (
    <section className="trusthook">
      <div className="container">
        {s.heading && <h2>{s.heading}</h2>}
        <div className="trust-chips">
          {(s.items ?? []).map((it) => (
            <span key={it.id} className="trust-chip">
              {it.title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntentCardsSection({ s }: { s: PageSection }) {
  const items = (s.items ?? []).map((it) => ({ id: it.id, icon: it.icon ?? null, title: it.title ?? null, body: it.body ?? null }));
  return (
    <section className="section-pad">
      <div className="container">
        <SectionHead s={s} />
        <IntentCards items={items} />
      </div>
    </section>
  );
}

function ContactPanel({ s, records }: { s: PageSection; records: SectionRecords }) {
  const contact = records.contact;
  return (
    <section className="section-pad section-soft">
      <div className="container">
        <SectionHead s={s} />
        {contact && (
          <div className="lc-side" style={{ marginTop: 20 }}>
            <div className="side-card">
              <h5>Contact</h5>
              <ul>
                <li>
                  <strong>Phone</strong>
                  {contact.phone}
                </li>
                <li>
                  <strong>Email</strong>
                  {contact.email}
                </li>
                <li>
                  <strong>Head Office</strong>
                  {contact.officeAddress}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Render a single section by type. Unknown/Wave-D types render nothing (forward-compatible). */
function renderSection(s: PageSection, i: number, records: SectionRecords) {
  switch (s.type) {
    case "hero":
      return <HeroSection key={i} s={s} />;
    case "stat_strip":
      return <StatStrip key={i} s={s} />;
    case "expertise_cards":
      return <ExpertiseCards key={i} s={s} />;
    case "about_intro":
      return <AboutIntro key={i} s={s} />;
    case "featured_projects":
      return <FeaturedProjects key={i} s={s} records={records} />;
    case "featured_services":
      return <FeaturedServices key={i} s={s} records={records} />;
    case "featured_certifications":
      return <FeaturedCertifications key={i} s={s} records={records} />;
    case "logo_wall":
      return <LogoWall key={i} s={s} />;
    case "testimonials":
      return <TestimonialsSection key={i} s={s} />;
    case "cta_banner":
      return <CtaBanner key={i} s={s} />;
    case "final_cta":
      return <FinalCta key={i} s={s} />;
    case "story":
      return <StorySection key={i} s={s} />;
    case "mvv":
      return <MvvSection key={i} s={s} />;
    case "timeline":
      return <TimelineSection key={i} s={s} />;
    case "leadership_message":
      return <LeadershipMessage key={i} s={s} />;
    case "why_us":
      return <WhyUsSection key={i} s={s} />;
    case "achievements":
      return <AchievementsSection key={i} s={s} />;
    case "clients_filterable":
      return <ClientsFilterable key={i} s={s} />;
    case "trust_hook":
      return <TrustHook key={i} s={s} />;
    case "intent_cards":
      return <IntentCardsSection key={i} s={s} />;
    case "contact_panel":
      return <ContactPanel key={i} s={s} records={records} />;
    // network_strip, insights_strip, news_strip, leadership_team, culture →
    // not seeded on the singleton pages today; unknown types render nothing (forward-compatible).
    default:
      return null;
  }
}

export { badgeClass };

export function SectionRenderer({ sections, records = {} }: { sections: PageSection[]; records?: SectionRecords }) {
  return <>{sections.map((s, i) => renderSection(s, i, records))}</>;
}
