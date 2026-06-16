import Link from "next/link";
import { Arrow, ArrowUpRight, SvcIcon } from "../site-ui";
import { MediaImage } from "../media/media-image";
import { Counter } from "./counter";
import { ProjectCard, type ProjectCardData, badgeClass } from "../projects/project-card";
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
  link_url?: string | null;
  link_label?: string | null;
  // Resolved stat_strip/achievements items use label/sublabel (the data layer maps title→label).
  label?: string | null;
  sublabel?: string | null;
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
};

// ── Small shared bits ───────────────────────────────────────────────────────
function SectionHead({ s, num }: { s: PageSection; num?: string }) {
  return (
    <div className="section-head">
      <div>
        {(num || s.eyebrow) && <span className="num">{num ?? s.eyebrow}</span>}
        {s.heading && <h2>{s.heading}</h2>}
      </div>
      {s.subheading && <p className="head-right">{s.subheading}</p>}
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
function HeroSection({ s }: { s: PageSection }) {
  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="hero-bg">
        <MediaImage media={s.background_image} fill priority sizes="100vw" />
      </div>
      <div className="container hero-inner">
        {s.eyebrow && <span className="microlabel on-dark">{s.eyebrow}</span>}
        {s.heading && <h1>{s.heading}</h1>}
        {s.subheading && <p className="lede">{s.subheading}</p>}
        <div className="hero-cta-row">{ctaButtons(s)}</div>
        {(s.items?.length ?? 0) > 0 && (
          <div className="hero-badges">
            {s.items!.map((it) => (
              <div key={it.id}>
                <div className="badge-label">{it.title}</div>
                <div className="badge-caption">{it.subtitle}</div>
              </div>
            ))}
          </div>
        )}
      </div>
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

function AboutIntro({ s }: { s: PageSection }) {
  return (
    <section className="section-pad" data-screen-label="About">
      <div className="container">
        <div className="about-grid">
          <div className="about-img">
            <MediaImage media={s.background_image} fill sizes="(max-width: 980px) 100vw, 50vw" />
          </div>
          <div className="about-copy">
            {s.eyebrow && <span className="microlabel">{s.eyebrow}</span>}
            {s.heading && <h2 style={{ marginTop: 18 }}>{s.heading}</h2>}
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
  return (
    <section className="section-pad-sm section-soft" data-screen-label="Trusted">
      <div className="container">
        <div className="section-head single" style={{ textAlign: "center" }}>
          {s.eyebrow && <span className="microlabel">{s.eyebrow}</span>}
          {s.heading && <h2>{s.heading}</h2>}
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
    case "cta_banner":
      return <CtaBanner key={i} s={s} />;
    case "final_cta":
      return <FinalCta key={i} s={s} />;
    // testimonials, network_strip, insights_strip, news_strip, story, mvv, timeline, why_us,
    // achievements, leadership_*, clients_filterable, trust_hook, intent_cards, contact_panel,
    // culture → handled in the About/Collaborate slice; unknown types render nothing.
    default:
      return null;
  }
}

export { badgeClass };

export function SectionRenderer({ sections, records = {} }: { sections: PageSection[]; records?: SectionRecords }) {
  return <>{sections.map((s, i) => renderSection(s, i, records))}</>;
}
