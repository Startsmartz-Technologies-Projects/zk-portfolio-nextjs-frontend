"use client";
import * as React from "react";
import Link from "next/link";
import { Arrow as AD, ArrowUpRight as AURD, SvcIcon as SIcoD } from "./site-ui";
import type { ProjectRecord } from "@/src/data/projects-data";
import { fetchProjects } from "@/src/lib/projects-api";

// Project Detail page

function ShareIcon({ k }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "currentColor",
  };
  const p = {
    fb: "M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2h2V2.1C16.5 2 15.5 2 14.5 2 11.8 2 10 3.7 10 6.7V10H7v4h3v8h3z",
    li: "M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18.3 18h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V18h-2.6V9.7h2.5v1.1h0a2.7 2.7 0 0 1 2.5-1.4c2.6 0 3.1 1.7 3.1 4V18z",
    tw: "M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-1.5-1.6-4-1.6-5.6-.1-1 1-1.5 2.5-1.2 3.9C9 8.6 6 7.1 4 4.7c-1 1.8-.5 4.1 1.3 5.2-.7 0-1.3-.2-1.9-.5 0 1.9 1.3 3.5 3.2 3.9-.6.2-1.3.2-1.9.1.5 1.6 2 2.7 3.7 2.8C6.9 17.4 5 18 3 17.7c1.7 1.1 3.7 1.7 5.8 1.7 7 0 10.8-5.8 10.8-10.8v-.5c.8-.6 1.4-1.3 1.9-2.2z",
    lnk: "M10 14a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-1.5 1.5m-8-1.5a5 5 0 0 1 7 0l-3 3a5 5 0 0 1-7-7L0 0",
  };
  if (k === "lnk")
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      >
        <path d="M10 14 a5 5 0 0 1 0 -7 l3 -3 a5 5 0 0 1 7 7 l-2 2" />
        <path d="M14 10 a5 5 0 0 1 0 7 l-3 3 a5 5 0 0 1 -7 -7 l2 -2" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d={p[k]} />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <polyline points="15,3 21,3 21,9" />
      <polyline points="9,21 3,21 3,15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function Lightbox({ images, idx, onClose, setIdx }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setIdx((idx - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((idx + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, images.length]);
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>
        Close
      </button>
      <button
        className="lb-nav prev"
        onClick={(e) => {
          e.stopPropagation();
          setIdx((idx - 1 + images.length) % images.length);
        }}
      >
        Left
      </button>
      <button
        className="lb-nav next"
        onClick={(e) => {
          e.stopPropagation();
          setIdx((idx + 1) % images.length);
        }}
      >
        Right
      </button>
      <img src={images[idx]} onClick={(e) => e.stopPropagation()} />
      <div className="lb-count">
        {idx + 1} / {images.length}
      </div>
    </div>
  );
}

export function ProjectDetailContent({ projectId }: { projectId?: string }) {
  const [lightbox, setLightbox] = React.useState(null);
  const [projects, setProjects] = React.useState<ProjectRecord[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();

    const loadProjects = async () => {
      try {
        const data = await fetchProjects(controller.signal);
        setProjects(data);
      } catch {
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();

    return () => controller.abort();
  }, []);

  const normalizedProjectId = (projectId || "").trim().toLowerCase();
  const project = React.useMemo(
    () =>
      projects.find((p) => p.id.toLowerCase() === normalizedProjectId) ??
      projects[0] ??
      null,
    [projects, normalizedProjectId],
  );

  if (isLoadingProjects && !project) {
    return (
      <section className="meta-strip">
        <div className="container">
          <p>Loading project...</p>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="meta-strip">
        <div className="container">
          <p>Project not found.</p>
        </div>
      </section>
    );
  }

  const detail = project.detail;
  const fallbackGallery = [
    project.img,
    ...projects
      .filter((p) => p.id !== project.id)
      .slice(0, 6)
      .map((p) => p.img),
  ];
  const gallerySource =
    Array.isArray(detail.gallery) && detail.gallery.length > 0
      ? detail.gallery
      : fallbackGallery;
  const galleryImgs = Array.from(
    { length: 7 },
    (_, i) => gallerySource[i] ?? gallerySource[0] ?? project.img,
  );

  const meta = [
    {
      k: "Client",
      v: detail.client,
      sub: undefined,
    },
    { k: "Project Type", v: detail.projectType, sub: undefined },
    { k: "Location", v: project.location, sub: undefined },
    { k: "Duration", v: project.duration, sub: undefined },
    { k: "Completion", v: project.year, sub: undefined },
  ];

  const scopes = Array.isArray(detail.scopes) ? detail.scopes : [];

  const highlights = Array.isArray(detail.highlights) ? detail.highlights : [];

  const related = projects.filter((p) => p.id !== project.id).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="detail-hero" data-screen-label="01 Hero">
        <div
          className="detail-hero-bg"
          style={{ backgroundImage: `url(${galleryImgs[0]})` }}
        />
        <div className="container detail-hero-inner">
          <div className="crumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/projects">Projects</Link>
            <span className="sep">/</span>
            <Link href={`/projects/${encodeURIComponent(project.id)}`}>
              {project.cat}
            </Link>
            <span className="sep">/</span>
            <span>{project.title}</span>
          </div>
          <div className="detail-hero-badges">
            <span className="dh-badge">{project.badge || project.status}</span>
            <span className="dh-badge ghost">Completion - {project.year}</span>
            <span className="dh-badge ghost">{project.location}</span>
          </div>
          <h1>{project.title}</h1>
          <p className="summary">{project.summary}</p>
        </div>
      </section>

      {/* Metadata strip */}
      <section className="meta-strip" data-screen-label="02 Metadata">
        <div className="container">
          <div className="meta-strip-grid">
            {meta.map((m) => (
              <div key={m.k} className="meta-cell">
                <div className="k">{m.k}</div>
                <div className="v">{m.v}</div>
                <div className="sub">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview + sticky side */}
      <section className="overview-section" data-screen-label="03 Overview">
        <div className="container">
          <div className="overview-grid">
            <div className="overview-copy">
              <span className="microlabel">Project Overview</span>
              <h2 style={{ marginTop: 16 }}>{detail.overviewTitle}</h2>
              <p>{detail.overviewBody}</p>
              <p className="pull">"{detail.pullQuote}"</p>
            </div>

            <aside className="side-card">
              <h4>Quick Summary</h4>
              <p className="side-summary">"{detail.pullQuote}"</p>
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
                  {detail.servicesDelivered?.map((service: string) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </div>
              <div className="side-share">
                <span className="lbl">Share</span>
                <button aria-label="LinkedIn">
                  <ShareIcon k="li" />
                </button>
                <button aria-label="Facebook">
                  <ShareIcon k="fb" />
                </button>
                <button aria-label="Twitter">
                  <ShareIcon k="tw" />
                </button>
                <button aria-label="Copy link">
                  <ShareIcon k="lnk" />
                </button>
              </div>
              <div className="side-cta">
                <Link href="/lets-collaborate" className="btn btn-dark">
                  Enquire About Project <AD />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Scope / services delivered */}
      <section className="scope-section" data-screen-label="04 Scope">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">SCOPE OF WORKS / 04</span>
              <h2>Services delivered on this project.</h2>
            </div>
            <p className="head-right">{detail.scopeDescription}</p>
          </div>
          <div className="scope-grid">
            {scopes.map((s) => (
              <div key={s.n} className="scope-item">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span className="scope-num">{s.n}</span>
                  <div className="scope-icon">
                    <SIcoD kind={s.icon} />
                  </div>
                </div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="gallery-section" data-screen-label="05 Gallery">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">PROJECT GALLERY / 05</span>
              <h2>{detail.galleryHeading}</h2>
            </div>
            <p className="head-right">{detail.galleryDescription}</p>
          </div>
          <div className="gallery-grid">
            <div
              className="gallery-item gallery-feature"
              style={{ backgroundImage: `url(${galleryImgs[0]})` }}
              onClick={() => setLightbox(0)}
            >
              <div className="expand">
                <ExpandIcon />
              </div>
            </div>
            <div
              className="gallery-item gallery-tall"
              style={{ backgroundImage: `url(${galleryImgs[1]})` }}
              onClick={() => setLightbox(1)}
            >
              <div className="expand">
                <ExpandIcon />
              </div>
            </div>
            <div
              className="gallery-item"
              style={{ backgroundImage: `url(${galleryImgs[2]})` }}
              onClick={() => setLightbox(2)}
            >
              <div className="expand">
                <ExpandIcon />
              </div>
            </div>
            <div
              className="gallery-item"
              style={{ backgroundImage: `url(${galleryImgs[3]})` }}
              onClick={() => setLightbox(3)}
            >
              <div className="expand">
                <ExpandIcon />
              </div>
            </div>
            <div
              className="gallery-item"
              style={{ backgroundImage: `url(${galleryImgs[4]})` }}
              onClick={() => setLightbox(4)}
            >
              <div className="expand">
                <ExpandIcon />
              </div>
            </div>
            <div
              className="gallery-item"
              style={{ backgroundImage: `url(${galleryImgs[5]})` }}
              onClick={() => setLightbox(5)}
            >
              <div className="expand">
                <ExpandIcon />
              </div>
            </div>
            <div
              className="gallery-item"
              style={{ backgroundImage: `url(${galleryImgs[6]})` }}
              onClick={() => setLightbox(6)}
            >
              <div className="expand">
                <ExpandIcon />
              </div>
            </div>
          </div>
        </div>
        {lightbox !== null && (
          <Lightbox
            images={galleryImgs}
            idx={lightbox}
            setIdx={setLightbox}
            onClose={() => setLightbox(null)}
          />
        )}
      </section>

      {/* Highlights */}
      <section className="highlights-section" data-screen-label="06 Highlights">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num on-dark" style={{ color: "var(--lime)" }}>
                KEY HIGHLIGHTS / 06
              </span>
              <h2>Outcomes that matter.</h2>
            </div>
            <p
              className="head-right"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {detail.highlightsDescription}
            </p>
          </div>
          <div className="highlights-grid">
            {highlights.map((item, index) => (
              <article key={`${item.title}-${index}`} className="hl-card">
                <div className="hl-num">{item.num}</div>
                <div className="hl-unit">{item.unit}</div>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge / Solution / Outcome */}
      <section className="cso-section" data-screen-label="07 CSO">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">CASE STUDY / 07</span>
              <h2>Case Study</h2>
            </div>
            <p className="head-right">
              Project delivery story: challenge, approach, result.
            </p>
          </div>
          <div className="cso-grid">
            <div className="cso-cell">
              <span className="cso-step">01 - The Challenge</span>
              <h3>{detail.caseStudyChallenge}</h3>
            </div>
            <div className="cso-cell highlight">
              <span className="cso-step">02 - The Approach</span>
              <h3>{detail.caseStudyApproach}</h3>
            </div>
            <div className="cso-cell">
              <span className="cso-step">03 - The Result</span>
              <h3>{detail.caseStudyResult}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Related projects - reuses proj-card style from projects page */}
      <section className="related-section" data-screen-label="08 Related">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">RELATED WORK / 08</span>
              <h2>Other projects you might consider.</h2>
            </div>
            <Link
              href="/projects"
              className="btn btn-ghost head-right"
              style={{ alignSelf: "end" }}
            >
              Browse Full Portfolio <AD />
            </Link>
          </div>
          <div className="listing-grid">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${encodeURIComponent(p.id)}`}
                className="proj-card"
                style={{ textDecoration: "none" }}
              >
                <div className="pc-img-wrap">
                  <div
                    className="pc-img"
                    style={{ backgroundImage: `url(${p.img})` }}
                  />
                  <span className={`pc-badge ${p.badgeClass || ""}`}>
                    {p.badge}
                  </span>
                  <span className="pc-year">{p.year}</span>
                </div>
                <div className="pc-body">
                  <div className="pc-cat">{p.cat}</div>
                  <h3>{p.title}</h3>
                  <div className="pc-loc">Location {p.location}</div>
                  <p className="pc-sum">{p.summary}</p>
                  <div className="pc-footer">
                    <span className={`pc-status ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                    <span className="pc-link">
                      View Project{" "}
                      <span className="arrow">
                        <AD size={12} />
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="trust-cta" data-screen-label="09 CTA">
        <div className="container">
          <div className="trust-cta-inner">
            <div>
              <span className="microlabel on-dark">Start a Conversation</span>
              <h2 style={{ marginTop: 20 }}>{detail.ctaHeading}</h2>
            </div>
            <div>
              <div className="trust-cta-buttons">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Discuss Your Project <AD />
                </Link>
                <Link
                  href="/lets-collaborate"
                  className="btn btn-outline-light"
                >
                  Let's Collaborate <AURD />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
