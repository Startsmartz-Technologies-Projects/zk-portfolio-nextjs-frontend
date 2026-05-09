// Navbar, Hero, Expertise, Stats
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Arrow, ArrowUpRight } from "./site-ui";

const LOGO_IMAGE_URL =
  "https://res.cloudinary.com/dk4csiouq/image/upload/v1777193277/Heading_28_nm42pj.png";

// Photography URLs - real commercial construction imagery from Unsplash
export const IMG = {
  heroSkyline:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=2000&q=80&auto=format&fit=crop",
  heroCrane:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=2000&q=80&auto=format&fit=crop",
  heroBridge:
    "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=2000&q=80&auto=format&fit=crop",
  expGov:
    "https://res.cloudinary.com/dk4csiouq/image/upload/v1778307817/Picture22_iwei3q.jpg",
  expCom:
    "https://res.cloudinary.com/dk4csiouq/image/upload/v1778306310/Picture1_nb2vhy.jpg",
  expPriv:
    "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110616/21_jdwj2x.jpg",
  aboutMain:
    "https://res.cloudinary.com/dk4csiouq/image/upload/v1778308523/WhatsApp_Image_2026-05-09_at_12.32.27_PM_evnsal.jpg",
  proj1:
    "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1200&q=80&auto=format&fit=crop",
  proj2:
    "https://images.unsplash.com/photo-1621352452648-c717c4eba35f?w=1200&q=80&auto=format&fit=crop",
  proj3:
    "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1200&q=80&auto=format&fit=crop",
  proj4:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop",
  proj5:
    "https://images.unsplash.com/photo-1565008576549-57569a49371c?w=1200&q=80&auto=format&fit=crop",
  proj6:
    "https://images.unsplash.com/photo-1518335935020-cfd6580c1ab4?w=1200&q=80&auto=format&fit=crop",
  ctaBanner:
    "https://images.unsplash.com/photo-1590644875981-3b4dbbd8b8ac?w=2000&q=80&auto=format&fit=crop",
  insight1:
    "https://images.unsplash.com/photo-1587582140428-8f3bc86c4a63?w=800&q=80&auto=format&fit=crop",
  insight2:
    "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?w=800&q=80&auto=format&fit=crop",
  insight3:
    "https://images.unsplash.com/photo-1590644776933-e05027243a9d?w=800&q=80&auto=format&fit=crop",
  insight4:
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop",
};

export function Nav({ scrolled }) {
  const pathname = usePathname();

  const items = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/#services" },
    { label: "Projects", href: "/projects" },
    { label: "Certifications", href: "/certifications" },
    { label: "News", href: "/news" },
    { label: "Blogs", href: "/blogs" },
    // { label: "Contact",        href: "/lets-collaborate" },
  ];
  const homeFile = "/";
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link href={homeFile} className="nav-logo">
          <span className=" h-10 bg-contain">
            <img
              src={LOGO_IMAGE_URL}
              alt="Zakir Enterprise Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </span>
          {/* <span className="title-stack">
            <span>ZAKIR ENTERPRISE</span>
            <span className="sub">Construction - Infrastructure - Bangladesh</span>
          </span> */}
        </Link>
        <ul className="nav-menu">
          {items.map((it) => {
            const active =
              it.href === "/"
                ? pathname === "/"
                : pathname === it.href || pathname.startsWith(`${it.href}/`);

            return (
              <li key={it.label}>
                <Link href={it.href} className={active ? "active" : ""}>
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="nav-cta">
          <div className="nav-phone">
            <span>Call us</span>
            <strong>+8801791026074</strong>
          </div>
          <Link href="/lets-collaborate" className="btn btn-primary">
            Let's Collaborate <Arrow />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function Hero({ variant }) {
  const bg =
    variant === "crane"
      ? IMG.heroCrane
      : variant === "bridge"
        ? IMG.heroBridge
        : IMG.heroSkyline;
  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="hero-sidecol">
        <span className="hero-sideticker">NATIONWIDE - SINCE 2010</span>
      </div>
      <div className="container hero-inner">
        <span className="microlabel on-dark">
          Building Bangladesh Since 2010
        </span>
        <h1>
          Strength in Every Build , <span className="accent">Precision </span>{" "}
          in Every Detail
        </h1>
        <p className="lede">
          Zakir Enterprise: Bangladesh's Foundation of Strength & Trust. From
          site development to large-scale infrastructure, Zakir Enterprise is
          your trusted partner for high-quality construction that stands the
          test of time
        </p>
        <div className="hero-cta-row">
          <Link href="/lets-collaborate" className="btn btn-primary">
            Contact Us <Arrow />
          </Link>
          <Link href="/projects" className="btn btn-outline-light">
            Explore Project <ArrowUpRight />
          </Link>
        </div>
        <div className="hero-badges">
          <div>
            <span className="badge-label">Nationwide Operations</span>
            <span className="badge-caption">64 districts</span>
          </div>
          <div>
            <span className="badge-label">Quality Execution</span>
            <span className="badge-caption">ISO aligned</span>
          </div>
          <div>
            <span className="badge-label">Experienced Team</span>
            <span className="badge-caption">250+ specialists</span>
          </div>
          <div>
            <span className="badge-label">Timely Delivery</span>
            <span className="badge-caption">98% on schedule</span>
          </div>
        </div>
      </div>
      <div className="hero-bottom">
        <span>Dhaka - Chattogram - Sylhet - Khulna - Rajshahi</span>
      </div>
    </section>
  );
}

export function Expertise() {
  const cards = [
    {
      tag: "01 - Public",
      title: "Government Projects",
      img: IMG.expGov,
      body: "Reliable execution for public infrastructure and development works under LGED, RHD and municipal tenders.",
    },
    {
      tag: "03 - Private",
      title: "Private Projects",
      img: IMG.expPriv,
      body: "Premium residential homes, apartments and private buildings with disciplined quality finishing.",
    },
    {
      tag: "02 - Commercial",
      title: "Commercial Projects",
      img: IMG.expCom,
      body: "Modern solutions for business buildings, industrial facilities and commercial developments across Bangladesh.",
    },
  ];
  return (
    <section className="section-pad" data-screen-label="03 Expertise">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">CORE EXPERTISE / 03</span>
            <h2>Capability across every scale of construction.</h2>
          </div>
          <p className="head-right">
            From government infrastructure to private developments, we operate
            with the same discipline, safety standards and delivery confidence
            on every site.
          </p>
        </div>
        <div className="expertise-grid">
          {cards.map((c) => (
            <article key={c.title} className="exp-card">
              <div
                className="exp-img"
                style={{ backgroundImage: `url(${c.img})` }}
              >
                <span className="exp-tag">{c.tag}</span>
              </div>
              <div className="exp-body">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <Link href="/service-details/heavy-civil-infrastructure-development" className="exp-link">
                  Explore Sector <Arrow />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  const stats = [
    {
      n: 15,
      plus: "+",
      label: "Years Experience",
      sub: "Established operations since 2010",
    },
    {
      n: 50,
      plus: "+",
      label: "Projects Delivered",
      sub: "Across public & private sectors",
    },
    {
      n: 64,
      plus: "",
      label: "District Reach",
      sub: "Nationwide execution capability",
    },
    {
      n: 250,
      plus: "+",
      label: "Skilled Team",
      sub: "Engineers, managers, technicians",
    },
  ];
  return (
    <section className="section-pad section-soft" data-screen-label="04 Stats">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">TRACK RECORD / 04</span>
            <h2>Delivering confidence through results.</h2>
          </div>
          <p className="head-right">
            Over a decade of disciplined project delivery measured in completed
            contracts, satisfied clients and repeat government tenders.
          </p>
        </div>
        <div className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat-num">
                <Counter to={s.n} />
                {s.plus && <span className="plus">{s.plus}</span>}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ to, dur = 1400 }) {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef(null);
  const started = React.useRef(false);
  React.useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{val}</span>;
}
