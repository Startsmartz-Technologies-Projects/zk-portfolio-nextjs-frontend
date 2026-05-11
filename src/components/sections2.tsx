import Link from "next/link";
import { Arrow as A2, ArrowUpRight as AUR, SvcIcon } from "./site-ui";
import { IMG } from "./sections1";
import { CERTIFICATIONS } from "../data/certifications";
import { PROJECTS as ALL_PROJECTS } from "@/src/data/projects-data";
import { SERVICE_IMAGE_BY_TITLE } from "@/src/data/brand-assets";
import { SERVICES } from "@/src/data/services-data";

// About, Projects, Services, Business Network, Certifications

export function About() {
  const points = [
    "Disciplined site execution",
    "Safety-first methodology",
    "Transparent project reporting",
    "Local supply chain depth",
  ];
  return (
    <section id="about" className="section-pad" data-screen-label="05 About">
      <div className="container">
        <div className="about-grid">
          <div
            className="about-img"
            style={{ backgroundImage: `url(${IMG.aboutMain})` }}
          >
            <div className="overlay-card">
              <div className="big">15+</div>
              <div className="lbl">Years delivering public & private works</div>
            </div>
          </div>
          <div className="about-copy">
            <span className="microlabel">About Zakir Enterprise</span>
            <h2 style={{ marginTop: 18 }}>
              Building more than structures{" "}
              <span
                style={{
                  color: "var(--gold)",
                  fontStyle: "italic",
                  fontWeight: 500,
                }}
              >
                building trust.
              </span>
            </h2>
            <p className="lead">
              Zakir Enterprise is a Bangladesh-based construction company
              committed to quality, safety and long-term value. We bring
              practical expertise, disciplined execution and dependable project
              delivery to every assignment.
            </p>
            <p className="lead" style={{ fontSize: 15, color: "var(--body)" }}>
              Our teams operate across all 64 districts with an experienced core
              of engineers and site managers capable of handling contracts from
              municipal works to large commercial developments.
            </p>
            <ul className="about-points">
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/about" className="btn btn-dark">
                Learn More About Us <A2 />
              </Link>
              {/* <Link href="/about" className="btn btn-ghost">Download Company Profile <AUR/></Link> */}
            </div>
            <div className="sig">
              <div className="sig-mark">ZH</div>
              <div>
                <div className="sig-name">Md. Zakir Hossain</div>
                <div className="sig-role">Founder & Managing Director</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Projects() {
  const projects = ALL_PROJECTS.slice(0, 6).map((project, index) => ({
    cat: project.cat,
    title: project.title,
    size: project.location,
    img: project.img,
    num: project.id.replace(/^P/, "P-"),
    href: `/projects/${encodeURIComponent(project.id)}`,
    tall: index === 0,
  }));
  return (
    <section
      className="section-pad section-soft"
      data-screen-label="06 Projects"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">FEATURED PROJECTS / 06</span>
            <h2>Work that stands on its ground.</h2>
          </div>
          <p className="head-right">
            A selection of recent completions across public infrastructure,
            commercial structures and foundation works engineered to last,
            delivered on time.
          </p>
        </div>
        <div className="projects-grid">
          {projects.map((p) => (
            <Link
              key={p.num}
              href={p.href}
              className={`project ${p.tall ? "tall" : ""}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="p-img"
                style={{ backgroundImage: `url(${p.img})` }}
              />

              <span className="p-size">{p.size}</span>
              <div className="p-body">
                <div>
                  <div className="p-cat">{p.cat}</div>
                  <h3>{p.title}</h3>
                </div>
                <div className="p-arrow">
                  <AUR />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
        >
          <Link href="/projects" className="btn btn-dark">
            View All Projects <A2 />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const svcs = SERVICES.slice(0, 6).map((service, index) => ({
    icon: service.icon,
    t: service.title,
    slug: service.slug,
    subtitle: service.subtitle,
    heroImage: service.heroImage,
    num: String(index + 1).padStart(2, "0"),
  }));
  return (
    <section
      id="services"
      className="section-pad"
      data-screen-label="07 Services"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">SERVICES / 07</span>
            <h2>A full-spectrum construction partner.</h2>
          </div>
          <p className="head-right">
            Eleven core service lines each handled by specialized teams with the
            equipment, methodology and accountability the work demands.
          </p>
        </div>
        <div className="services-feature-grid">
          {svcs.map((s) => (
            <article key={s.slug} className="svc-feature">
              <div
                className="svc-feature-media"
                style={{
                  backgroundImage: `url(${SERVICE_IMAGE_BY_TITLE[s.t] || s.heroImage})`,
                }}
              />
              <div className="svc-feature-body">
                <div className="svc-feature-top">
                  <span className="svc-feature-num">{s.num}</span>
                  <div className="svc-icon">
                    <SvcIcon kind={s.icon} />
                  </div>
                </div>
                <h4>{s.t}</h4>
                <p>{s.subtitle}</p>
                <Link
                  href={`/service-details/${encodeURIComponent(s.slug)}`}
                  className="svc-feature-view"
                >
                  View Service <A2 size={12} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 42 }}
        >
          <Link href="/services" className="btn btn-dark">
            View All Services <A2 />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Network() {
  const concerns = [
    {
      logo: "ZE",
      cat: "Core",
      name: "Zakir Enterprise",
      slug: "zakir-enterprise",
      body: "Construction & infrastructure execution  parent concern.",
    },
    {
      logo: "ZC",
      cat: "Materials",
      name: "Zakir Concrete Works",
      slug: "zakir-concrete-works",
      body: "Ready-mix concrete, precast elements and structural aggregate supply.",
    },
    {
      logo: "ZT",
      cat: "Logistics",
      name: "Zakir Transport & Equipment",
      slug: "zakir-transport-equipment",
      body: "Heavy machinery, hauling and on-site equipment rental across regions.",
    },
    {
      logo: "ZD",
      cat: "Development",
      name: "Zakir Real Estate",
      slug: "zakir-real-estate",
      body: "Mixed-use and residential development projects in urban Bangladesh.",
    },
  ];
  return (
    <section
      className="section-pad section-soft"
      data-screen-label="08 Network"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">BUSINESS NETWORK / 08</span>
            <h2>Our business network.</h2>
          </div>
          <p className="head-right">
            A family of concerns covering construction, materials, logistics and
            development vertically aligned to keep quality and schedule under
            one roof.
          </p>
        </div>
        <div className="network-grid">
          {concerns.map((c) => (
            <div key={c.logo} className="concern">
              <div>
                <div className="concern-logo">{c.logo}</div>
                <div className="concern-cat" style={{ marginTop: 18 }}>
                  {c.cat}
                </div>
                <h4>{c.name}</h4>
                <p>{c.body}</p>
              </div>
              <Link
                href={`/concern-detail/${c.slug}`}
                className="exp-link"
                style={{ fontSize: 11 }}
              >
                Visit Concern <A2 size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Certifications() {
  const certs = CERTIFICATIONS.slice(0, 4);

  return (
    <section
      id="certifications"
      className="section-pad"
      data-screen-label="09 Certifications"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">CERTIFICATIONS / 09</span>
            <h2>Standards you can trust.</h2>
          </div>
          <p className="head-right">
            Independently verified against international and national standards
            our certifications are current, audited and available for tender
            review on request.
          </p>
        </div>
        <div className="certs-grid certs-grid-one-row">
          {certs.map((c) => (
            <Link
              key={c.id}
              href={`/certifications?preview=${encodeURIComponent(c.id)}#certs`}
              className="cert"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="cert-seal"
                style={{
                  whiteSpace: "pre-line",
                  textAlign: "center",
                  lineHeight: 1.05,
                }}
              >
                {c.homeSeal}
              </div>
              <div>
                <h4>{c.title}</h4>
                <div className="cert-id">{c.homeId}</div>
              </div>
              <div className="cert-valid">{c.homeValid}</div>
            </Link>
          ))}
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 40 }}
        >
          <Link href="/certifications" className="btn btn-dark">
            View All Certifications <A2 />
          </Link>
        </div>
      </div>
    </section>
  );
}
