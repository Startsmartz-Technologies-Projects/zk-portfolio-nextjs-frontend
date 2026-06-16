import Link from "next/link";
import { Arrow as A2, ArrowUpRight as AUR, SvcIcon } from "./site-ui";
import { MediaImage } from "./media/media-image";
import { getPublishedServices } from "@/lib/data/services";

// Public Services directory — server component on getPublishedServices (services-fe-public
// §A/§C/§D). Replaces the static SERVICES import + SERVICE_IMAGE_BY_TITLE with the published
// read; the "{n} Core Services" count + first-4 capabilities are derived. Hero/intro/final-CTA
// copy stays static here — the PAGES-managed source lands with pages-fe-public (Wave C, §D).

export async function ServicesPageContent() {
  const { data: services } = await getPublishedServices();
  const total = services.length;
  const featuredCapabilities = services.slice(0, 4);
  const heroStats = [
    { label: "Portfolio", value: `${total} Core Services` },
    { label: "Coverage", value: "Nationwide Project Support" },
    { label: "Delivery", value: "Engineering-Led Execution" },
    { label: "Projects", value: "Public, Industrial, Private" },
  ];

  return (
    <>
      <section className="svc-hero">
        <div className="svc-hero-bg" style={{ backgroundImage: "url(/images/service_hero.png)" }} />
        <div className="container">
          <div className="svc-hero-grid">
            <div>
              <span className="microlabel on-dark">Services Portfolio</span>
              <h1>
                Engineered <span className="accent">services</span> for
                <span className="gold"> complex delivery.</span>
              </h1>
              <p className="sub">
                Explore Zakir Enterprise&apos;s complete execution portfolio across infrastructure, structural systems, utilities, land
                development and project management.
              </p>
              <div className="svc-hero-buttons">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Let&apos;s Collaborate <A2 />
                </Link>
                <Link href="/projects" className="btn btn-outline-light">
                  View Projects <AUR size={14} />
                </Link>
              </div>
            </div>

            <div className="svc-hero-badges">
              {heroStats.map((item) => (
                <div key={item.label} className="svc-hero-badge">
                  <span className="lbl">{item.label}</span>
                  <span className="v">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="svc-crumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="cur">Services</span>
          </div>
        </div>
      </section>

      <section className="svc-intro">
        <div className="container">
          <div className="svc-intro-grid">
            <div>
              <span className="microlabel">What We Deliver</span>
              <h2>A full-spectrum construction partner.</h2>
              <p>
                Every service line is handled by specialized teams with the equipment, methodology and accountability the work demands —
                from heavy civil infrastructure to structural systems and project management.
              </p>
            </div>

            <div className="svc-mini">
              {featuredCapabilities.map((service) => (
                <div key={service.slug} className="svc-mini-cell">
                  <div className="ico">
                    <SvcIcon kind={service.icon} />
                  </div>
                  <h4>{service.title}</h4>
                  <p>{service.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="svc-grid-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">SERVICE DIRECTORY / 02</span>
              <h2>Browse every execution vertical in the current portfolio.</h2>
            </div>
            <p className="head-right">Each card routes into the full service detail with scope, process, capability and FAQ.</p>
          </div>

          <div className="svc-grid">
            {services.map((service) => (
              <Link key={service.slug} href={`/service-details/${service.slug}`} className="svc-card">
                <div className="sc-img-wrap">
                  <div className="sc-img">
                    <MediaImage media={service.hero_image} fill sizes="(max-width: 980px) 100vw, 33vw" />
                  </div>
                  <span className="sc-num">{String(service.service_number).padStart(2, "0")}</span>
                  <div className="sc-ico">
                    <div aria-hidden="true">
                      <SvcIcon kind={service.icon} />
                    </div>
                  </div>
                </div>

                <div className="sc-body">
                  <h3>{service.title}</h3>
                  <p>{service.subtitle}</p>
                  <span className="sc-cta">
                    Explore Service <AUR size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="services-catalog-cta">
            <Link href="/lets-collaborate" className="btn btn-dark">
              Start a Service Discussion <A2 />
            </Link>
          </div>
        </div>
      </section>

      <section className="svc-final-cta">
        <div className="container svc-final-cta-inner">
          <div>
            <span className="microlabel on-dark">Ready To Start</span>
            <h2>
              Bring your next <span className="gold">project scope</span> to our engineering team.
            </h2>
          </div>
          <div className="svc-final-cta-right">
            <p>Get a structured discussion for planning, resource strategy, timeline, and delivery method before execution starts.</p>
            <div className="svc-final-cta-btns">
              <Link href="/lets-collaborate" className="btn btn-primary">
                Let&apos;s Collaborate <A2 />
              </Link>
              <Link href="/projects" className="btn btn-outline-light">
                View Projects <AUR size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
