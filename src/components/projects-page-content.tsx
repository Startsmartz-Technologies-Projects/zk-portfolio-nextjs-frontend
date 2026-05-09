"use client";
import * as React from "react";
import Link from "next/link";
import { Arrow as AP, ArrowUpRight as AURP } from "./site-ui";
import {
  FEATURED_PROJECT_IDS,
  PROJECT_FILTERS,
  PROJECT_SORTS,
  type ProjectRecord,
} from "@/src/data/projects-data";
import { fetchProjects } from "@/src/lib/projects-api";

// Projects listing page

const PROJECT_IMAGES = {
  skyline:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=80&auto=format&fit=crop",
  crane:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
  bridge:
    "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=1400&q=80&auto=format&fit=crop",
  tower:
    "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1200&q=80&auto=format&fit=crop",
  road: "https://res.cloudinary.com/dk4csiouq/image/upload/q_auto/f_auto/v1776917191/patuakhali_project_section_hero_nqcinq.jpg",
  bridgeAlt:
    "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1200&q=80&auto=format&fit=crop",
  earth:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop",
  concrete:
    "https://images.unsplash.com/photo-1565008576549-57569a49371c?w=1200&q=80&auto=format&fit=crop",
  found:
    "https://images.unsplash.com/photo-1518335935020-cfd6580c1ab4?w=1200&q=80&auto=format&fit=crop",
  siteteam:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format&fit=crop",
  interior:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
  apartment:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop",
  machinery:
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80&auto=format&fit=crop",
  warehouse:
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop",
  highway:
    "https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=1200&q=80&auto=format&fit=crop",
  blueprint:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
  mosque:
    "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271735/Central_Mosque-cumilla_cant.-hero_section_mx6wco.jpg",
};

export const PROJECTS = [
  {
    id: "P001",
    cat: "Building Construction",
    type: "Government",
    status: "Completed",
    location: "Rampura, Dhaka",
    title: "49m All Traffic Steel Arch Bridge",
    year: "2025",
    duration: "22 months",
    img: PROJECT_IMAGES.tower,
    badge: "Featured",
    badgeClass: "lime",
    summary:
      "A major government infrastructure project in Rampura, Dhaka delivering three bridges under one contract: two double-lane all-traffic steel bridges with footpath connecting Banasree with Aftab Nagar, and a dedicated pedestrian bridge over Rampura Khal.",
  },
  {
    id: "P002",
    cat: "Road Works",
    type: "Government",
    status: "Completed",
    location: "Patuakhali, Bangladesh",
    title: "Patuakhali Naval Warehouse",
    year: "2025",
    duration: "14 months",
    img: PROJECT_IMAGES.road,
    badge: "Government",
    badgeClass: "black",
    summary:
      "A purpose-built government warehouse delivering secure, large-span storage for the Bangladesh Navy's southern coastal operations ",
  },
  {
    id: "P003",
    cat: "Private Residential",
    type: "Infrastructure",
    status: "Ongoing",
    location:
      "Plot 60/C, Road 07, Mouza Lalalsarat, Cantonment Market Area, Cantonment, Dhaka",
    title: "SKCD Dream — G+7 Residential Building",
    year: "2026",
    duration: "In progress",
    img: PROJECT_IMAGES.bridgeAlt,
    badge: "Ongoing",
    badgeClass: "gold",
    summary:
      "An 8-storied premium residential building rising in the heart of Dhaka Cantonment — 14 units per floor, two apartment types, and a modern curved facade that's already turning heads on Road",
  },
  {
    id: "P004",
    cat: "Site Development",
    type: "Religious / Institutional Construction",
    status: "Completed",
    location: "Comilla University, Kotbari, Comilla",
    title: "Central Mosque",
    year: "2024",
    duration: "Ongoing",
    img: PROJECT_IMAGES.mosque,
    badge: "Completed",
    summary:
      "A three-storied central mosque built for 24 ECB Brigade at Comilla University accommodating 10,000 worshippers across two dedicated prayer floors, with ground floor parking and a total built area of 9,380 sq.m",
  },
  // {
  //   id: "P005",
  //   cat: "Structural Concrete",
  //   type: "Commercial",
  //   status: "Completed",
  //   location: "Chattogram EPZ",
  //   title: "RCC Framework, Warehouse Facility",
  //   year: "2024",
  //   duration: "11 months",
  //   img: PROJECT_IMAGES.warehouse,
  //   badge: "Completed",
  //   summary:
  //     "45,000 sqft RCC framework with heavy-load slab design for export-oriented logistics operations.",
  // },
  // {
  //   id: "P006",
  //   cat: "Foundation Work",
  //   type: "Commercial",
  //   status: "Completed",
  //   location: "Riverside, Dhaka",
  //   title: "Deep Pile Foundation - 340 Piles",
  //   year: "2023",
  //   duration: "8 months",
  //   img: PROJECT_IMAGES.found,
  //   badge: "Completed",
  //   summary:
  //     "Cast-in-situ bored piles extending to 42m depth supporting a mixed-use riverside development.",
  // },
  // {
  //   id: "P007",
  //   cat: "Building Construction",
  //   type: "Private",
  //   status: "Completed",
  //   location: "Banani, Dhaka",
  //   title: "Premium Residential Tower, 12 Floors",
  //   year: "2025",
  //   duration: "19 months",
  //   img: PROJECT_IMAGES.apartment,
  //   badge: "Private",
  //   badgeClass: "black",
  //   summary:
  //     "High-end apartment block featuring imported finishes, dual-lift core and architectural landscaping.",
  // },
  // {
  //   id: "P008",
  //   cat: "Road Works",
  //   type: "Government",
  //   status: "Ongoing",
  //   location: "Sylhet Division",
  //   title: "Regional Highway Expansion",
  //   year: "2026",
  //   duration: "In progress",
  //   img: PROJECT_IMAGES.highway,
  //   badge: "Ongoing",
  //   badgeClass: "gold",
  //   summary:
  //     "Widening and resurfacing of 38km regional route including new culvert structures and road markings.",
  // },
  // {
  //   id: "P009",
  //   cat: "Commercial Works",
  //   type: "Commercial",
  //   status: "Completed",
  //   location: "Motijheel, Dhaka",
  //   title: "Bank Branch Renovation Programme",
  //   year: "2024",
  //   duration: "6 months",
  //   img: PROJECT_IMAGES.interior,
  //   badge: "Completed",
  //   summary:
  //     "Interior build-out across 7 banking branches including security works, electricals and finishing.",
  // },
  // {
  //   id: "P010",
  //   cat: "Bridge Works",
  //   type: "Infrastructure",
  //   status: "Completed",
  //   location: "Barishal",
  //   title: "Reinforced Culvert Network Ã¢â‚¬â€ 12 Units",
  //   year: "2023",
  //   duration: "10 months",
  //   img: PROJECT_IMAGES.bridge,
  //   badge: "Completed",
  //   summary:
  //     "Box-culvert construction programme replacing aged drainage structures across flood-prone roads.",
  // },
  // {
  //   id: "P011",
  //   cat: "Private Residential",
  //   type: "Private",
  //   status: "Planning",
  //   location: "Uttara, Dhaka",
  //   title: "Duplex Residence Compound",
  //   year: "2026",
  //   duration: "Kickoff Q2",
  //   img: PROJECT_IMAGES.siteteam,
  //   badge: "Private",
  //   badgeClass: "black",
  //   summary:
  //     "Six-unit duplex compound with shared amenity deck, underground parking and architectural landscaping.",
  // },
  // {
  //   id: "P012",
  //   cat: "Structural Concrete",
  //   type: "Industrial",
  //   status: "Completed",
  //   location: "Gazipur",
  //   title: "Factory Expansion Ã¢â‚¬â€ Phase II",
  //   year: "2024",
  //   duration: "12 months",
  //   img: PROJECT_IMAGES.concrete,
  //   badge: "Completed",
  //   summary:
  //     "Structural extension adding 28,000 sqft production floor with reinforced mezzanine and crane rails.",
  // },
];

const CATEGORIES = [
  "All",
  "Building Construction",
  "Road Works",
  "Bridge Works",
  "Private Residential",
  "Government Projects",
  "Commercial Works",
];
const STATUSES = ["All Status", "Completed", "Ongoing", "Planning"];
const TYPES = ["All Types", "Government", "Commercial", "Private"];
const LOCATIONS = [
  "All Locations",
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Cumilla",
  "Barishal",
  "Mymensingh",
  "Gazipur",
];
const SORTS = ["Most Recent", "Oldest First", "A Ã¢â€ â€™ Z", "By Size"];

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}
function CaretDown() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
    >
      <path d="M12 2 C8 2 5 5 5 9 c0 5 7 13 7 13 s7-8 7-13 c0-4-3-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function Select({ label, options, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  const active = value !== options[0];
  return (
    <div
      ref={ref}
      className={`filter-select ${active ? "active" : ""}`}
      onClick={() => setOpen(!open)}
    >
      <span>{label}:</span>
      <span className="val">{value}</span>
      <span className="caret">
        <CaretDown />
      </span>
      {open && (
        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
          {options.map((o) => (
            <button
              key={o}
              className={o === value ? "selected" : ""}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectsPageContent() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [status, setStatus] = React.useState("All Status");
  const [type, setType] = React.useState("All Types");
  const [location, setLocation] = React.useState("All Locations");
  const [sort, setSort] = React.useState("Most Recent");
  const [visible, setVisible] = React.useState(6);
  const [projects, setProjects] = React.useState<ProjectRecord[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(true);
  const [featuredPage, setFeaturedPage] = React.useState(0);

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

  const featuredProjects = React.useMemo(
    () =>
      FEATURED_PROJECT_IDS.map((id) =>
        projects.find((project) => project.id === id),
      ).filter((project): project is ProjectRecord => Boolean(project)),
    [projects],
  );

  const featuredSlides = React.useMemo(() => {
    const slides: ProjectRecord[][] = [];
    for (let i = 0; i < featuredProjects.length; i += 2) {
      slides.push(featuredProjects.slice(i, i + 2));
    }
    return slides;
  }, [featuredProjects]);

  const featuredPageCount = Math.max(1, featuredSlides.length);

  React.useEffect(() => {
    setFeaturedPage((prev) => Math.min(prev, featuredPageCount - 1));
  }, [featuredPageCount]);

  const showNextFeatured = () => {
    setFeaturedPage((prev) => (prev + 1) % featuredPageCount);
  };

  const showPreviousFeatured = () => {
    setFeaturedPage(
      (prev) => (prev - 1 + featuredPageCount) % featuredPageCount,
    );
  };

  const heroProject = featuredProjects[0] ?? projects[0] ?? null;
  const yearsExperience = React.useMemo(() => {
    const years = projects
      .map((project) => Number.parseInt(project.year, 10))
      .filter((year) => Number.isFinite(year));
    if (years.length === 0) return 0;
    const earliestYear = Math.min(...years);
    return Math.max(1, new Date().getFullYear() - earliestYear + 1);
  }, [projects]);

  const districtsReached = React.useMemo(() => {
    const values = new Set(
      projects.map((project) => {
        const parts = project.location.split(",");
        return (parts[parts.length - 1] ?? project.location)
          .trim()
          .toLowerCase();
      }),
    );
    return values.size;
  }, [projects]);

  const filtered = React.useMemo(() => {
    let list = projects.filter((p) => {
      if (
        search &&
        !(p.title + p.cat + p.location)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (
        category !== "All" &&
        !p.cat.toLowerCase().includes(category.toLowerCase().split(" ")[0])
      ) {
        // loose match - allow category chip to map
        if (category === "Government Projects" && p.type !== "Government")
          return false;
        if (category === "Private Residential" && p.type !== "Private")
          return false;
        if (
          !["Government Projects", "Private Residential"].includes(category) &&
          !p.cat.toLowerCase().includes(category.toLowerCase().split(" ")[0])
        )
          return false;
      }
      if (status !== "All Status" && p.status !== status) return false;
      if (type !== "All Types" && p.type !== type) return false;
      if (location !== "All Locations" && !p.location.includes(location))
        return false;
      return true;
    });
    if (sort === "A - Z")
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "Oldest First")
      list = [...list].sort((a, b) =>
        (a.year || "").localeCompare(b.year || ""),
      );
    return list;
  }, [projects, search, category, status, type, location, sort]);

  const activeFilters = [];
  if (search)
    activeFilters.push({
      k: "search",
      l: `"${search}"`,
      clear: () => setSearch(""),
    });
  if (category !== "All")
    activeFilters.push({
      k: "cat",
      l: category,
      clear: () => setCategory("All"),
    });
  if (status !== "All Status")
    activeFilters.push({
      k: "st",
      l: status,
      clear: () => setStatus("All Status"),
    });
  if (type !== "All Types")
    activeFilters.push({ k: "ty", l: type, clear: () => setType("All Types") });
  if (location !== "All Locations")
    activeFilters.push({
      k: "lo",
      l: location,
      clear: () => setLocation("All Locations"),
    });

  const resetAll = () => {
    setSearch("");
    setCategory("All");
    setStatus("All Status");
    setType("All Types");
    setLocation("All Locations");
    setSort("Most Recent");
  };

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // sticky filter bar
  const [pinned, setPinned] = React.useState(false);
  const [filterBarHeight, setFilterBarHeight] = React.useState(0);
  const stickyAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const filterBarRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const STICKY_TOP = 76;

    const update = () => {
      const anchorTop =
        stickyAnchorRef.current?.getBoundingClientRect().top ??
        Number.POSITIVE_INFINITY;
      const nextPinned = anchorTop <= STICKY_TOP;
      setPinned(nextPinned);
      setFilterBarHeight(filterBarRef.current?.offsetHeight ?? 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

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
              <span
                className="microlabel"
                style={{ marginTop: 22, display: "inline-flex" }}
              >
                Our Projects
              </span>
              <h1>
                Built across <span className="accent">Bangladesh.</span>
              </h1>
              <p className="lede">
                Discover our portfolio of completed, ongoing, and landmark
                construction projects spanning public, private, commercial, and
                infrastructure sectors each delivered with consistent precision
                and execution excellence across every site.
              </p>
              <div className="ih-stats">
                <div className="ih-stat">
                  <div className="num">
                    {50}
                    <span className="plus">+</span>
                  </div>
                  <div className="lbl">Total Projects</div>
                </div>
                <div className="ih-stat">
                  <div className="num">
                    {15}
                    <span className="plus">+</span>
                  </div>
                  <div className="lbl">Years Experience</div>
                </div>
                <div className="ih-stat">
                  <div className="num">{64}</div>
                  <div className="lbl">Districts Reached</div>
                </div>
              </div>
            </div>
            <div
              className="inner-hero-visual"
              style={{ backgroundImage: `url(${heroProject?.img ?? ""})` }}
            >
              <div className="tag-cluster">
                <span>{heroProject?.title ?? "Loading project..."}</span>
                <span>
                  {heroProject
                    ? `${heroProject.year}, ${heroProject.location}`
                    : "Please wait"}
                </span>
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
      <section className="featured-strip" data-screen-label="02 Featured">
        <div className="container">
          <div className="section-head" style={{ marginBottom: 40 }}>
            <div>
              <span className="num">FEATURED / 02</span>
              <h2>Landmark works.</h2>
            </div>
            <p className="head-right">
              Two of our most significant recent deliveries chosen for their
              scale, engineering complexity, and impact for our clients.
            </p>
          </div>
          <div className="featured-carousel-controls">
            <button
              type="button"
              className="featured-nav-btn"
              onClick={showPreviousFeatured}
              disabled={featuredProjects.length <= 2}
              aria-label="Previous featured projects"
            >
              <span className="icon left">
                <AP size={12} />
              </span>
              Prev
            </button>
            <span className="featured-page-indicator">
              {Math.min(featuredPage + 1, featuredPageCount)} /{" "}
              {featuredPageCount}
            </span>
            <button
              type="button"
              className="featured-nav-btn"
              onClick={showNextFeatured}
              disabled={featuredProjects.length <= 2}
              aria-label="Next featured projects"
            >
              Next
              <span className="icon">
                <AP size={12} />
              </span>
            </button>
          </div>
          <div className="featured-carousel-viewport">
            <div
              className="featured-carousel-track"
              style={{
                transform: `translate3d(-${featuredPage * 100}%, 0, 0)`,
              }}
            >
              {featuredSlides.map((slide, slideIndex) => (
                <div
                  className="featured-carousel-slide"
                  key={`featured-slide-${slideIndex}`}
                >
                  <div className="featured-grid">
                    {slide.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${encodeURIComponent(project.id)}`}
                        className="featured-card"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div
                          className="f-img"
                          style={{ backgroundImage: `url(${project.img})` }}
                        />
                        <div className="f-top">
                          <span
                            className={`featured-badge ${project.badgeClass ?? ""}`.trim()}
                          >
                            {project.badge}
                          </span>
                          <span className="featured-badge ghost">
                            {project.type}
                          </span>
                        </div>
                        <div className="f-body">
                          <div className="f-cat">{project.cat}</div>
                          <h3>{project.title}</h3>
                          <div className="f-meta">
                            <span>
                              {project.location.length > 35
                                ? `${project.location.slice(0, 35)}...`
                                : project.location}
                            </span>
                            <span className="dot" />
                            <span>{project.duration}</span>
                            <span className="dot" />
                            <span>{`${project.status} ${project.year}`}</span>
                          </div>
                        </div>
                        <div className="f-arrow text-white">
                          <AURP />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {!isLoadingProjects && featuredSlides.length === 0 && (
                <div className="featured-carousel-slide">
                  <div className="featured-grid">
                    <div className="featured-empty">
                      No featured projects are configured yet.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky filter */}
      <div ref={stickyAnchorRef} className="filter-sticky-anchor" aria-hidden />
      {pinned && (
        <div
          className="filter-sticky-spacer"
          style={{ height: filterBarHeight }}
          aria-hidden
        />
      )}
      <div
        ref={filterBarRef}
        className={`filter-bar ${pinned ? "pinned is-fixed" : ""}`}
      >
        <div className="container">
          <div className="filter-row">
            <div className="filter-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search projects, locations, categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(6);
                }}
              />
            </div>
            <div className="filter-selects">
              <Select
                label="Category"
                options={CATEGORIES}
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setVisible(6);
                }}
              />
              <Select
                label="Type"
                options={TYPES}
                value={type}
                onChange={(v) => {
                  setType(v);
                  setVisible(6);
                }}
              />
              <Select
                label="Status"
                options={STATUSES}
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setVisible(6);
                }}
              />
              <Select
                label="Location"
                options={LOCATIONS}
                value={location}
                onChange={(v) => {
                  setLocation(v);
                  setVisible(6);
                }}
              />
            </div>
            <div className="filter-right">
              <div className="result-count">
                <strong>{filtered.length}</strong> projects
              </div>
              <Select
                label="Sort"
                options={SORTS}
                value={sort}
                onChange={setSort}
              />
            </div>
          </div>

          <div className="chips-row">
            {CATEGORIES.map((c) => {
              const count =
                c === "All"
                  ? projects.length
                  : projects.filter((p) => {
                      if (c === "Government Projects")
                        return p.type === "Government";
                      if (c === "Private Residential")
                        return p.type === "Private";
                      return p.cat
                        .toLowerCase()
                        .includes(c.toLowerCase().split(" ")[0]);
                    }).length;
              return (
                <button
                  key={c}
                  className={`chip ${category === c ? "active" : ""}`}
                  onClick={() => {
                    setCategory(c);
                    setVisible(6);
                  }}
                >
                  {c} <span className="count">{count}</span>
                </button>
              );
            })}
          </div>

          {activeFilters.length > 0 && (
            <div className="active-chips">
              {activeFilters.map((f) => (
                <span key={f.k} className="active-chip">
                  {f.l} <button onClick={f.clear}>Clear</button>
                </span>
              ))}
              <button className="clear-all" onClick={resetAll}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main grid */}
      <section
        className="projects-listing"
        data-screen-label="03 Projects Grid"
      >
        <div className="container">
          {isLoadingProjects ? (
            <div className="empty-state">
              <h3>Loading projects...</h3>
              <p>Fetching the latest project list from the API.</p>
            </div>
          ) : shown.length === 0 ? (
            <div className="empty-state">
              <div className="es-mark">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                >
                  <rect x="3" y="5" width="18" height="14" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="5" x2="8" y2="19" />
                </svg>
              </div>
              <h3>No projects found</h3>
              <p>
                Try changing filters or browse all projects across our
                portfolio.
              </p>
              <button className="btn btn-dark" onClick={resetAll}>
                Reset Filters <AP />
              </button>
            </div>
          ) : (
            <div className="listing-grid">
              {shown.slice(0, 4).map((p) => (
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
                    <div className="pc-loc">
                      <PinIcon /> {p.location}
                    </div>
                    <p className="pc-sum">{p.summary}</p>
                    <div className="pc-footer">
                      <span className={`pc-status ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                      <span className="pc-link">
                        View Project{" "}
                        <span className="arrow">
                          <AP size={12} />
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="load-more-wrap">
              <div className="progress">
                <div
                  className="bar"
                  style={{ width: `${(visible / filtered.length) * 100}%` }}
                />
              </div>
              {/* <div className="meta">
                Showing {shown.length} of {filtered.length} 
                {filtered.length - visible} more
              </div> */}
              <button
                className="btn btn-dark"
                onClick={() => setVisible((v) => v + 6)}
              >
                Load More Projects <AP />
              </button>
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
                Planning your next <span className="gold">construction</span>{" "}
                <span className="accent">project?</span>
              </h2>
            </div>
            <div>
              <p>
                Partner with Zakir Enterprise for dependable execution,
                disciplined engineering and timely delivery - on government
                tenders, commercial builds and private developments.
              </p>
              <div className="trust-cta-buttons">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Let's Collaborate <AP />
                </Link>
                <Link
                  href="/lets-collaborate"
                  className="btn btn-outline-light"
                >
                  Contact Us <AURP />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
