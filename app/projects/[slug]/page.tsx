import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, ArrowUpRight, SvcIcon } from "@/src/components/site-ui";
import { MediaImage } from "@/src/components/media/media-image";
import { ProjectCard, imageUrlOf } from "@/src/components/projects/project-card";
import { GalleryLightbox } from "@/src/components/projects/gallery-lightbox";
import { getPublishedProjectBySlug } from "@/lib/data/projects";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { BreadcrumbJsonLd } from "@/src/components/seo/json-ld";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Public Project detail — server component on getPublishedProjectBySlug (projects-fe-public
// §A/§B/§C/§E/§G). Renders fully server-side from the published read; the gallery lightbox is
// the only client island. Draft/archived/deleted slugs resolve to null → 404 (BR-4).

export const revalidate = REVALIDATE;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> | Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};
  const defaults = await getPublicSeoDefaults();
  return buildMetadata({
    seo: {
      metaTitle: project.seo.meta_title,
      metaDescription: project.seo.meta_description,
      canonicalUrl: project.seo.canonical_url,
      ogTitle: project.seo.og_title,
      ogDescription: project.seo.og_description,
      noindex: project.seo.noindex,
    },
    record: { title: project.title, summary: project.summary },
    defaults,
    ogImageUrl: imageUrlOf(project.seo.og_image) ?? imageUrlOf(project.cover_image),
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> | Params }) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const detail = project;
  const metadataBase = (await getPublicSeoDefaults()).metadata_base.replace(/\/$/, "");

  // Hero image: cover, else first gallery item (§E1).
  const heroImage = project.cover_image ?? detail.gallery[0]?.media ?? null;

  // Variable-length gallery (§E3) — render the actual array, no fixed padding. First tile is the
  // feature (2×2), second is tall, the rest flow. Empty gallery → section hidden.
  const galleryItems = detail.gallery;
  const galleryUrls = galleryItems.map((g) => imageUrlOf(g.media)).filter((u): u is string => !!u);
  const galleryTiles = galleryItems.map((g, i) => {
    const cls = i === 0 ? "gallery-item gallery-feature" : i === 1 ? "gallery-item gallery-tall" : "gallery-item";
    return (
      <div className={cls} key={g.id}>
        <MediaImage media={g.media} fill sizes="(max-width: 720px) 100vw, 50vw" />
      </div>
    );
  });

  const meta = [
    { k: "Client", v: detail.client },
    { k: "Project Type", v: detail.category?.label ?? null },
    { k: "Location", v: detail.location_detail || detail.location?.label || null },
    { k: "Duration", v: detail.duration_label },
    { k: "Completion", v: detail.year != null ? String(detail.year) : null },
  ].filter((m) => m.v);

  const related = detail.related ?? [];

  const breadcrumbItems = [
    { name: "Home", url: `${metadataBase}/` },
    { name: "Projects", url: `${metadataBase}/projects` },
    { name: project.title, url: `${metadataBase}/projects/${project.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Hero */}
      <section className="detail-hero" data-screen-label="01 Hero">
        <div className="detail-hero-bg">
          <MediaImage media={heroImage} fill priority sizes="100vw" />
        </div>
        <div className="container detail-hero-inner">
          <div className="crumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/projects">Projects</Link>
            <span className="sep">/</span>
            <span>{project.title}</span>
          </div>
          <div className="detail-hero-badges">
            <span className="dh-badge">{project.badge_text || project.delivery_status}</span>
            {project.year != null && <span className="dh-badge ghost">Completion - {project.year}</span>}
            {(detail.location_detail || project.location?.label) && (
              <span className="dh-badge ghost">{detail.location_detail || project.location?.label}</span>
            )}
          </div>
          <h1>{project.title}</h1>
          {project.summary && <p className="summary">{project.summary}</p>}
        </div>
      </section>

      {/* Metadata strip */}
      {meta.length > 0 && (
        <section className="meta-strip" data-screen-label="02 Metadata">
          <div className="container">
            <div className="meta-strip-grid">
              {meta.map((m) => (
                <div key={m.k} className="meta-cell">
                  <div className="k">{m.k}</div>
                  <div className="v">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Overview + sticky side */}
      {(detail.overview_title || detail.overview_body || detail.pull_quote || detail.services_delivered.length > 0) && (
        <section className="overview-section" data-screen-label="03 Overview">
          <div className="container">
            <div className="overview-grid">
              <div className="overview-copy">
                <span className="microlabel">Project Overview</span>
                {detail.overview_title && <h2 style={{ marginTop: 16 }}>{detail.overview_title}</h2>}
                {detail.overview_body && <p>{detail.overview_body}</p>}
                {detail.pull_quote && <p className="pull">&ldquo;{detail.pull_quote}&rdquo;</p>}
              </div>

              <aside className="side-card">
                <h4>Quick Summary</h4>
                {detail.pull_quote && <p className="side-summary">&ldquo;{detail.pull_quote}&rdquo;</p>}
                {detail.services_delivered.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--body)",
                        marginBottom: 12,
                      }}
                    >
                      Services Delivered
                    </div>
                    <ul className="side-services">
                      {detail.services_delivered.map((service) => (
                        <li key={service}>{service}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="side-cta">
                  <Link href="/lets-collaborate" className="btn btn-dark">
                    Enquire About Project <Arrow />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* Scope / services delivered (variable-length array) */}
      {detail.scopes.length > 0 && (
        <section className="scope-section" data-screen-label="04 Scope">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num">SCOPE OF WORKS / 04</span>
                <h2>Services delivered on this project.</h2>
              </div>
              {detail.scope_description && <p className="head-right">{detail.scope_description}</p>}
            </div>
            <div className="scope-grid">
              {detail.scopes.map((s) => (
                <div key={s.id} className="scope-item">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="scope-num">{s.value}</span>
                    <div className="scope-icon">
                      <SvcIcon kind={s.icon} />
                    </div>
                  </div>
                  <h4>{s.title}</h4>
                  {s.description && <p>{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery (variable-length array → lightbox) */}
      {galleryTiles.length > 0 && (
        <section className="gallery-section" data-screen-label="05 Gallery">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num">PROJECT GALLERY / 05</span>
                {detail.gallery_heading && <h2>{detail.gallery_heading}</h2>}
              </div>
              {detail.gallery_description && <p className="head-right">{detail.gallery_description}</p>}
            </div>
            <div className="gallery-grid">
              <GalleryLightbox tiles={galleryTiles} urls={galleryUrls} />
            </div>
          </div>
        </section>
      )}

      {/* Highlights (variable-length array) */}
      {detail.highlights.length > 0 && (
        <section className="highlights-section" data-screen-label="06 Highlights">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num on-dark" style={{ color: "var(--lime)" }}>
                  KEY HIGHLIGHTS / 06
                </span>
                <h2>Outcomes that matter.</h2>
              </div>
              {detail.highlights_description && (
                <p className="head-right" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {detail.highlights_description}
                </p>
              )}
            </div>
            <div className="highlights-grid">
              {detail.highlights.map((item) => (
                <article key={item.id} className="hl-card">
                  <div className="hl-num">{item.number}</div>
                  {item.unit && <div className="hl-unit">{item.unit}</div>}
                  <h4>{item.title}</h4>
                  {item.body && <p>{item.body}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Case study */}
      {(detail.case_study_challenge || detail.case_study_approach || detail.case_study_result) && (
        <section className="cso-section" data-screen-label="07 CSO">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num">CASE STUDY / 07</span>
                <h2>Case Study</h2>
              </div>
              <p className="head-right">Project delivery story: challenge, approach, result.</p>
            </div>
            <div className="cso-grid">
              {detail.case_study_challenge && (
                <div className="cso-cell">
                  <span className="cso-step">01 - The Challenge</span>
                  <h3>{detail.case_study_challenge}</h3>
                </div>
              )}
              {detail.case_study_approach && (
                <div className="cso-cell highlight">
                  <span className="cso-step">02 - The Approach</span>
                  <h3>{detail.case_study_approach}</h3>
                </div>
              )}
              {detail.case_study_result && (
                <div className="cso-cell">
                  <span className="cso-step">03 - The Result</span>
                  <h3>{detail.case_study_result}</h3>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related projects — hidden when empty (§E4) */}
      {related.length > 0 && (
        <section className="related-section" data-screen-label="08 Related">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num">RELATED WORK / 08</span>
                <h2>Other projects you might consider.</h2>
              </div>
              <Link href="/projects" className="btn btn-ghost head-right" style={{ alignSelf: "end" }}>
                Browse Full Portfolio <Arrow />
              </Link>
            </div>
            <div className="listing-grid">
              {related.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="trust-cta" data-screen-label="09 CTA">
        <div className="container">
          <div className="trust-cta-inner">
            <div>
              <span className="microlabel on-dark">Start a Conversation</span>
              {detail.cta_heading && <h2 style={{ marginTop: 20 }}>{detail.cta_heading}</h2>}
            </div>
            <div>
              <div className="trust-cta-buttons">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Discuss Your Project <Arrow />
                </Link>
                <Link href="/lets-collaborate" className="btn btn-outline-light">
                  Let&apos;s Collaborate <ArrowUpRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
