// Navbar, Hero, Expertise, Stats

const { Arrow, ArrowUpRight } = window.UI;

// Photography URLs — real commercial construction imagery from Unsplash
const IMG = {
  heroSkyline:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=2000&q=80&auto=format&fit=crop",
  heroCrane:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=2000&q=80&auto=format&fit=crop",
  heroBridge:
    "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=2000&q=80&auto=format&fit=crop",
  expGov:
    "https://images.unsplash.com/photo-1590644365607-1c9c3f380cd7?w=1000&q=80&auto=format&fit=crop",
  expCom:
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1000&q=80&auto=format&fit=crop",
  expPriv:
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1000&q=80&auto=format&fit=crop",
  aboutMain:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format&fit=crop",
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
window.IMG = IMG;

function Nav({ scrolled }) {
  const items = [
    { label: "Home", href: "Zakir Enterprise.html" },
    { label: "About Us", href: "Zakir Enterprise.html#about" },
    { label: "Services", href: "Zakir Enterprise.html#services" },
    { label: "Projects", href: "Projects.html" },
    { label: "Certifications", href: "Zakir Enterprise.html#certifications" },
    { label: "News", href: "Zakir Enterprise.html#news" },
    { label: "Contact", href: "Zakir Enterprise.html#contact" },
  ];
  const currentFile =
    (typeof location !== "undefined"
      ? location.pathname.split("/").pop()
      : "") || "Zakir Enterprise.html";
  const decoded = decodeURIComponent(currentFile);
  const isActive = (href) => {
    const target = href.split("#")[0];
    if (target === decoded) return !href.includes("#");
    return false;
  };
  const homeFile = "Zakir Enterprise.html";
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a href={homeFile} className="nav-logo">
          <span className="mark">Z</span>
          <span className="title-stack">
            <span>ZAKIR ENTERPRISE</span>
            <span className="sub">
              Construction · Infrastructure · Bangladesh
            </span>
          </span>
        </a>
        <ul className="nav-menu">
          {items.map((it) => {
            const active =
              (decoded === "Projects.html" && it.label === "Projects") ||
              (decoded !== "Projects.html" && it.label === "Home");
            return (
              <li key={it.label}>
                <a href={it.href} className={active ? "active" : ""}>
                  {it.label}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="nav-cta">
          <div className="nav-phone">
            <span>Call us</span>
            <strong>+8801791026074</strong>
          </div>
          <a href="#" className="btn btn-primary">
            Let's Collaborate <Arrow />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero({ variant }) {
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
        <span className="hero-sideticker">NATIONWIDE · SINCE 2014</span>
        <div className="hero-sidenum">
          <span className="n">01</span> / 15
        </div>
      </div>
      <div className="container hero-inner">
        <span className="microlabel on-dark">
          Building Bangladesh Since 2010
        </span>
        <h1>
          Building Bangladesh With <span className="accent">Strength,</span>{" "}
          Precision &amp; Trust
        </h1>
        <p className="lede">
          Zakir Enterprise delivers reliable construction solutions across
          Bangladesh — from buildings, roads, bridges and foundations to
          large-scale site development and specialized engineering works.
        </p>
        <div className="hero-cta-row">
          <a href="#" className="btn btn-primary">
            Let's Collaborate <Arrow />
          </a>
          <a href="Projects.html" className="btn btn-outline-light">
            View Projects <ArrowUpRight />
          </a>
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
        <span>Dhaka · Chattogram · Sylhet · Khulna · Rajshahi</span>
        <span className="hero-scroll">
          <span className="line" /> Scroll to explore
        </span>
      </div>
    </section>
  );
}

function Expertise() {
  const cards = [
    {
      tag: "01 · Public",
      title: "Government Projects",
      img: IMG.expGov,
      body: "Reliable execution for public infrastructure and development works under LGED, RHD and municipal tenders.",
    },
    {
      tag: "02 · Commercial",
      title: "Commercial Projects",
      img: IMG.expCom,
      body: "Modern solutions for business buildings, industrial facilities and commercial developments across Bangladesh.",
    },
    {
      tag: "03 · Private",
      title: "Private Projects",
      img: IMG.expPriv,
      body: "Premium residential homes, apartments and private buildings with disciplined quality finishing.",
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
                <a href="#" className="exp-link">
                  Explore Sector <Arrow />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    {
      n: 10,
      plus: "+",
      label: "Years Experience",
      sub: "Established operations since 2010",
    },
    {
      n: 100,
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
            Over a decade of disciplined project delivery — measured in
            completed contracts, satisfied clients and repeat government
            tenders.
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

Object.assign(window, { Nav, Hero, Expertise, Stats });
