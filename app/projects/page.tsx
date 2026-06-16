import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, ArrowUpRight } from "@/src/components/site-ui";
import { MediaImage } from "@/src/components/media/media-image";
import { ProjectCard, badgeClass } from "@/src/components/projects/project-card";
import { ProjectsFilterBar, type ProjectsFilterState, type FacetOption } from "@/src/components/projects/projects-filter-bar";
import { FeaturedCarousel } from "@/src/components/projects/featured-carousel";
import { getPublishedProjects, getFeaturedProjects, getProjectFacets, getProjectStats } from "@/lib/data/projects";
import { getTermList, REVALIDATE } from "@/src/lib/site/taxonomy";
import { getSiteBundle } from "@/lib/data/site";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";

// Public Projects listing — server component on lib/data (projects-fe-public §A/§B/§D/§F/§G).
// Filters/search/sort/pagination are driven entirely by the URL query params so the page is
// fully server-rendered (no client fetch, no "Loading…" HTML). Interactive controls live in
// client islands (filter bar, featured carousel) fed by props.

export const revalidate = REVALIDATE;

const PAGE_SIZE = 6;

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getPublicSeoDefaults();
  return buildMetadata({
    record: { title: "Projects", summary: "Our portfolio of completed, ongoing and landmark construction projects across Bangladesh." },
    defaults,
    path: "/projects",
  });
}

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> | SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1);
  const state: ProjectsFilterState = {
    q: one(sp.q),
    category: one(sp.category),
    clientType: one(sp.clientType),
    deliveryStatus: one(sp.deliveryStatus),
    location: one(sp.location),
    sort: one(sp.sort),
  };

  const [listed, featured, facets, stats, categoryTerms, locationTerms, site] = await Promise.all([
    getPublishedProjects({
      page,
      pageSize: PAGE_SIZE,
      q: state.q || undefined,
      sort: (state.sort as "recent" | "oldest" | "title") || undefined,
      category: state.category || undefined,
      location: state.location || undefined,
      clientType: (state.clientType as "Government" | "Commercial" | "Private") || undefined,
      deliveryStatus: (state.deliveryStatus as "Completed" | "Ongoing" | "Planning") || undefined,
    }),
    getFeaturedProjects(),
    getProjectFacets(),
    getProjectStats(),
    getTermList("projects-category"),
    getTermList("location"),
    getSiteBundle(),
  ]);

  const projects = listed.data;
  const total = listed.meta.total;
  const hasMore = page * PAGE_SIZE < total;

  // Derived years-of-experience from establishment year (FR-PROJ-038 / SITE company profile).
  const estYear = site.company?.establishment_year ?? null;
  const yearsExperience = estYear ? Math.max(1, new Date().getFullYear() - estYear + 1) : null;

  // Filter dropdown options from the SITE taxonomy term lists; "" = all.
  const catCounts = new Map(facets.categories.map((c) => [c.slug, c.count]));
  const locCounts = new Map(facets.locations.map((l) => [l.slug, l.count]));
  const categoryOptions: FacetOption[] = [{ value: "", label: "All" }, ...categoryTerms.map((t) => ({ value: t.slug, label: t.label }))];
  const locationOptions: FacetOption[] = [{ value: "", label: "All Locations" }, ...locationTerms.map((t) => ({ value: t.slug, label: t.label }))];
  const typeOptions: FacetOption[] = [
    { value: "", label: "All Types" },
    { value: "Government", label: "Government" },
    { value: "Commercial", label: "Commercial" },
    { value: "Private", label: "Private" },
  ];
  const statusOptions: FacetOption[] = [
    { value: "", label: "All Status" },
    { value: "Completed", label: "Completed" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Planning", label: "Planning" },
  ];
  const sortOptions: FacetOption[] = [
    { value: "", label: "Most Recent" },
    { value: "oldest", label: "Oldest First" },
    { value: "title", label: "A – Z" },
  ];
  // Chip counts from the facets (category chips), with an "All" chip = total published.
  const categoryChips: FacetOption[] = [
    { value: "", label: "All", count: stats.total_projects },
    ...categoryTerms.map((t) => ({ value: t.slug, label: t.label, count: catCounts.get(t.slug) ?? 0 })),
  ];

  // Featured strip slides (two cards per slide), server-rendered.
  const featuredProjects = featured.data;
  const slides: React.ReactNode[] = [];
  for (let i = 0; i < featuredProjects.length; i += 2) {
    const pair = featuredProjects.slice(i, i + 2);
    slides.push(
      pair.map((project) => (
        <Link key={project.id} href={`/projects/${project.slug}`} className="featured-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="f-img">
            <MediaImage media={project.cover_image} fill sizes="(max-width: 980px) 100vw, 50vw" />
          </div>
          <div className="f-top">
            {project.badge_text && <span className={`featured-badge ${badgeClass(project.badge_style)}`.trim()}>{project.badge_text}</span>}
            {/* Show the client-type ghost badge only when it adds info (not a repeat of badge_text). */}
            {project.client_type && project.client_type.toLowerCase() !== (project.badge_text ?? "").toLowerCase() && (
              <span className="featured-badge ghost">{project.client_type}</span>
            )}
          </div>
          <div className="f-body">
            {project.category && <div className="f-cat">{project.category.label}</div>}
            <h3>{project.title}</h3>
            <div className="f-meta">
              <span>{(project.location_detail || project.location?.label || "").slice(0, 35)}</span>
              <span className="dot" />
              {project.duration_label && <span>{project.duration_label}</span>}
              <span className="dot" />
              <span>{`${project.delivery_status} ${project.year ?? ""}`.trim()}</span>
            </div>
          </div>
          <div className="f-arrow text-white">
            <ArrowUpRight />
          </div>
        </Link>
      )),
    );
  }

  const heroProject = featuredProjects[0] ?? projects[0] ?? null;

  return (
    <>
      {/* Inner hero */}
      <section className="inner-hero" data-screen-label="01 Inner Hero">
        <div className="container">
          <div className="inner-hero-grid">
            <div>
              <div className="crumb">
                <Link href="/">Home</Link>
                <span className="sep">/</span>
                <span>Projects</span>
              </div>
              <span className="microlabel" style={{ marginTop: 22, display: "inline-flex" }}>
                Our Projects
              </span>
              <h1>
                Built across <span className="accent">Bangladesh.</span>
              </h1>
              <p className="lede">
                Discover our portfolio of completed, ongoing, and landmark construction projects spanning public, private, commercial, and
                infrastructure sectors each delivered with consistent precision and execution excellence across every site.
              </p>
              <div className="ih-stats">
                <div className="ih-stat">
                  <div className="num">
                    {stats.total_projects}
                    <span className="plus">+</span>
                  </div>
                  <div className="lbl">Total Projects</div>
                </div>
                {yearsExperience != null && (
                  <div className="ih-stat">
                    <div className="num">
                      {yearsExperience}
                      <span className="plus">+</span>
                    </div>
                    <div className="lbl">Years Experience</div>
                  </div>
                )}
                <div className="ih-stat">
                  <div className="num">{stats.districts_covered}</div>
                  <div className="lbl">Districts Reached</div>
                </div>
              </div>
            </div>
            <div className="inner-hero-visual">
              {heroProject && <MediaImage media={heroProject.cover_image} fill priority sizes="(max-width: 980px) 100vw, 40vw" />}
              <div className="tag-cluster">
                <span>{heroProject?.title ?? "Projects"}</span>
                <span>{heroProject ? `${heroProject.year ?? ""}, ${heroProject.location?.label ?? ""}`.trim() : ""}</span>
              </div>
              <div className="corner-meta">
                <div className="big">
                  24<span style={{ color: "#fff", fontSize: 24 }}>/7</span>
                </div>
                <div className="lbl">Site Operations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured strip */}
      {slides.length > 0 && (
        <section className="featured-strip" data-screen-label="02 Featured">
          <div className="container">
            <div className="section-head" style={{ marginBottom: 40 }}>
              <div>
                <span className="num">FEATURED / 02</span>
                <h2>Landmark works.</h2>
              </div>
              <p className="head-right">
                Our most significant recent deliveries chosen for their scale, engineering complexity, and impact for our clients.
              </p>
            </div>
            <FeaturedCarousel slides={slides} />
          </div>
        </section>
      )}

      {/* Sticky filter (client island) */}
      <ProjectsFilterBar
        state={state}
        resultCount={total}
        categoryOptions={categoryOptions}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
        locationOptions={locationOptions}
        sortOptions={sortOptions}
        categoryChips={categoryChips}
      />

      {/* Main grid */}
      <section className="projects-listing" data-screen-label="03 Projects Grid">
        <div className="container">
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="es-mark">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <rect x="3" y="5" width="18" height="14" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="5" x2="8" y2="19" />
                </svg>
              </div>
              <h3>No projects found</h3>
              <p>Try changing filters or browse all projects across our portfolio.</p>
              <Link className="btn btn-dark" href="/projects">
                Reset Filters <Arrow />
              </Link>
            </div>
          ) : (
            <div className="listing-grid">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="load-more-wrap">
              <div className="progress">
                <div className="bar" style={{ width: `${Math.min(100, (page * PAGE_SIZE * 100) / total)}%` }} />
              </div>
              <Link className="btn btn-dark" href={buildPageHref(state, page + 1)} scroll={false}>
                Load More Projects <Arrow />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust CTA */}
      <section className="trust-cta" data-screen-label="04 Trust CTA">
        <div className="container">
          <div className="trust-cta-inner">
            <div>
              <span className="microlabel on-dark">Start a Project</span>
              <h2 style={{ marginTop: 20 }}>
                Planning your next <span className="gold">construction</span> <span className="accent">project?</span>
              </h2>
            </div>
            <div>
              <p>
                Partner with Zakir Enterprise for dependable execution, disciplined engineering and timely delivery - on government tenders,
                commercial builds and private developments.
              </p>
              <div className="trust-cta-buttons">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Let&apos;s Collaborate <Arrow />
                </Link>
                <Link href="/lets-collaborate" className="btn btn-outline-light">
                  Contact Us <ArrowUpRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Build the "load more" href: same filters, next page. Server-side (the filter bar resets page). */
function buildPageHref(state: ProjectsFilterState, page: number): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.clientType) params.set("clientType", state.clientType);
  if (state.deliveryStatus) params.set("deliveryStatus", state.deliveryStatus);
  if (state.location) params.set("location", state.location);
  if (state.sort) params.set("sort", state.sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/projects?${qs}` : "/projects";
}
