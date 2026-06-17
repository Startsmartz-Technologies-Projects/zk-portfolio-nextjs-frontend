import Link from "next/link";
import { Arrow, ArrowUpRight, SvcIcon } from "./site-ui";
import { MediaImage } from "./media/media-image";
import { ConcernFaq } from "./concerns/concern-faq";
import type { getPublishedConcernBySlug } from "@/lib/data/concerns";

// Public Concern profile — server component on getPublishedConcernBySlug (concerns-fe-public
// §A/§C/§D). All child sections render from the API arrays; the showcase is the concern's freeform
// list (not linked to Projects, BR-4); related from detail.related. The FAQ accordion is the only
// client island.

type Concern = NonNullable<Awaited<ReturnType<typeof getPublishedConcernBySlug>>>;

export function ConcernDetailPageContent({ concern }: { concern: Concern }) {
  const related = (concern.related ?? []) as Array<{ slug: string; name: string; short: string | null; tagline: string | null }>;

  return (
    <>
      <section className="cd-hero">
        <div className="cd-hero-bg">
          <MediaImage media={concern.hero_image} fill priority sizes="100vw" />
        </div>
        <div className="container cd-hero-inner">
          <div className="bg-crumbs" style={{ marginBottom: 28 }}>
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/">Concerns</Link>
            <span className="sep">/</span>
            <span className="current">{concern.short}</span>
          </div>
          <div className="cd-hero-badge">
            <div className="cd-hero-badge-mark">Z</div>
            <div className="cd-hero-badge-body">
              <div className="cd-hero-badge-unit">Concern - Zakir Enterprise Group</div>
              <div className="cd-hero-badge-code">
                {[concern.code, concern.display_est].filter(Boolean).join(" - ")}
              </div>
            </div>
          </div>
          <h1>{concern.name}</h1>
          {concern.tagline && <p className="cd-hero-tag">{concern.tagline}</p>}
          {concern.intro && <p className="cd-hero-sub">{concern.intro}</p>}
          <div className="cd-hero-ctas">
            <Link href="/lets-collaborate" className="btn btn-primary">
              Contact This Concern <Arrow />
            </Link>
            <a href="#projects" className="btn btn-outline-light">
              View Projects
            </a>
          </div>
          <div className="cd-hero-meta">
            <div className="m">
              <span className="k">Parent Group</span>
              <span className="v">Zakir Enterprise</span>
            </div>
            <div className="m">
              <span className="k">Scope</span>
              <span className="v">{concern.short}</span>
            </div>
            <div className="m">
              <span className="k">Coverage</span>
              <span className="v">64 Districts</span>
            </div>
            <div className="m">
              <span className="k">Status</span>
              <span className="v">
                <span className="dot-live" />
                Active &amp; Delivering
              </span>
            </div>
          </div>
        </div>
      </section>

      {(concern.overview_title || concern.overview_body || concern.overview_mission) && (
        <section className="cd-overview">
          <div className="container cd-overview-grid">
            <div className="cd-overview-left">
              <span className="microlabel">Concern Overview</span>
              {concern.overview_title && <h2>{concern.overview_title}</h2>}
              <div className="cd-overview-quick">
                <div>
                  <div className="n">{concern.established_year ?? "—"}</div>
                  <div className="l">Established</div>
                </div>
                <div>
                  <div className="n">100+</div>
                  <div className="l">Projects</div>
                </div>
                <div>
                  <div className="n">64</div>
                  <div className="l">Districts</div>
                </div>
              </div>
            </div>
            <div className="cd-overview-right">
              {concern.overview_body && <p>{concern.overview_body}</p>}
              {concern.overview_mission && (
                <div className="cd-mission">
                  <div className="cd-mission-label">Mission</div>
                  <blockquote>{concern.overview_mission}</blockquote>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {concern.facts.length > 0 && (
        <section className="cd-facts">
          <div className="container">
            <div className="cd-facts-head">
              <div>
                <span className="microlabel on-dark">By The Numbers</span>
                <h2>
                  A delivery record that <span className="accent">speaks for itself.</span>
                </h2>
              </div>
              <p>Every figure below is drawn from active project data. We publish what we can prove.</p>
            </div>
            <div className="cd-facts-grid">
              {concern.facts.map((fact, index) => (
                <div key={fact.id} className="cd-fact-card">
                  <div className="cd-fact-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="cd-fact-big">{fact.big}</div>
                  <div className="cd-fact-lbl">{fact.label}</div>
                  {fact.sub && <div className="cd-fact-sub">{fact.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {concern.services.length > 0 && (
        <section className="cd-services" id="services">
          <div className="container">
            <div className="cd-section-head">
              <div>
                <span className="microlabel">Services &amp; Capabilities</span>
                <h2>What this concern delivers.</h2>
              </div>
              <p>A full civil engineering stack, assembled in-house and delivered with accountable execution.</p>
            </div>
            <div className="cd-services-grid">
              {concern.services.map((service, index) => (
                <div key={service.id} className="cd-service-card">
                  <div className="cd-service-icon">
                    <SvcIcon kind={service.icon} />
                  </div>
                  <div className="cd-service-num">{String(index + 1).padStart(2, "0")}</div>
                  <h3>{service.title}</h3>
                  {service.copy && <p>{service.copy}</p>}
                  <span className="cd-service-more">
                    Learn more <Arrow size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {concern.why.length > 0 && (
        <section className="cd-why">
          <div className="container cd-why-grid">
            <div className="cd-why-aside">
              <span className="microlabel">Why Choose Us</span>
              <h2>
                Reasons clients
                <br />
                come back for project two.
              </h2>
              <p>The industry has many contractors. We aim to be the one you do not need to chase.</p>
              <Link href="/lets-collaborate" className="btn btn-dark">
                Start a Conversation <Arrow />
              </Link>
            </div>
            <div className="cd-why-list">
              {concern.why.map((item) => (
                <div key={item.id} className="cd-why-item">
                  <div className="cd-why-num">{item.number}</div>
                  <div className="cd-why-body">
                    <h4>{item.title}</h4>
                    {item.copy && <p>{item.copy}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Showcase — the concern's freeform list (not linked to Projects, BR-4) */}
      {concern.showcase.length > 0 && (
        <section className="cd-projects" id="projects">
          <div className="container">
            <div className="cd-section-head">
              <div>
                <span className="microlabel">Featured Projects</span>
                <h2>
                  Delivery speaks
                  <br />
                  louder than positioning.
                </h2>
              </div>
              <Link href="/projects" className="btn btn-outline-dark">
                View All Projects <Arrow />
              </Link>
            </div>
            <div className="cd-projects-grid">
              {concern.showcase.map((project, index) => (
                <div key={project.id} className={`cd-project-card ${index === 0 ? "wide" : ""}`}>
                  <div className="cd-project-img">
                    <MediaImage media={project.image} fill sizes="(max-width: 980px) 100vw, 50vw" />
                    {project.category && <span className="cd-project-cat">{project.category}</span>}
                  </div>
                  <div className="cd-project-body">
                    {project.location && <div className="cd-project-loc">{project.location}</div>}
                    <h3>{project.title}</h3>
                    {project.summary && <p>{project.summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {concern.process.length > 0 && (
        <section className="cd-process">
          <div className="container">
            <div className="cd-section-head">
              <div>
                <span className="microlabel on-dark">Work Process</span>
                <h2>A staged delivery protocol.</h2>
              </div>
              <p>Every project follows the same discipline from first site walk to final defects review.</p>
            </div>
            <div className="cd-process-track">
              {concern.process.map((step, index) => (
                <div key={step.id} className="cd-process-step">
                  <div className="cd-process-connector">
                    <span className="cd-process-dot" />
                    {index < concern.process.length - 1 && <span className="cd-process-line" />}
                  </div>
                  <div className="cd-process-body">
                    <div className="cd-process-num">{step.step}</div>
                    <h4>{step.title}</h4>
                    {step.copy && <p>{step.copy}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {concern.gallery.length > 0 && (
        <section className="cd-gallery">
          <div className="container">
            <div className="cd-section-head">
              <div>
                <span className="microlabel">Field Gallery</span>
                <h2>
                  Site conditions.
                  <br />
                  Engineering reality.
                </h2>
              </div>
              <p>Imagery from active and recently completed projects across this concern portfolio.</p>
            </div>
            <div className="cd-gallery-grid">
              {concern.gallery.map((item, index) => (
                <div key={item.id} className={`cd-gallery-cell g-${index}`}>
                  <MediaImage media={item.image} fill sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="cd-gallery-tag">{String(index + 1).padStart(2, "0")}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="cd-related">
          <div className="container">
            <div className="cd-section-head">
              <div>
                <span className="microlabel">Zakir Enterprise Group</span>
                <h2>Explore other concerns.</h2>
              </div>
              <p>One group, multiple specialized concerns, shared delivery discipline.</p>
            </div>
            <div className="cd-related-grid">
              {related.map((item, index) => (
                <Link key={item.slug} className="cd-related-card" href={`/concern-detail/${item.slug}`} style={{ textDecoration: "none" }}>
                  <div className="cd-related-index">{String(index + 2).padStart(2, "0")}</div>
                  {item.short && <span className="cd-related-tag">{item.short}</span>}
                  <h4>{item.name}</h4>
                  {item.tagline && <p>{item.tagline}</p>}
                  <span className="cd-related-arrow">
                    <ArrowUpRight />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {concern.faqs.length > 0 && (
        <section className="cd-faq">
          <div className="container cd-faq-grid">
            <div>
              <span className="microlabel">Frequently Asked</span>
              <h2>
                Answers before
                <br />
                you ask them.
              </h2>
              <p>Cannot find what you are looking for? Our project desk responds within two working days.</p>
              <Link href="/lets-collaborate" className="btn btn-dark">
                Ask the Project Desk <Arrow />
              </Link>
            </div>
            <ConcernFaq faqs={concern.faqs} />
          </div>
        </section>
      )}

      <section className="cd-cta">
        <div className="cd-cta-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=2000&q=80&auto=format&fit=crop)" }} />
        <div className="container cd-cta-grid">
          <div>
            <span className="microlabel on-dark">Start Here</span>
            <h2>
              Work with <span className="accent">{concern.name}</span>
              <br />
              on your next project.
            </h2>
          </div>
          <div className="cd-cta-right">
            <p>Tell us your scope, site and timeline. A named engineer will respond with structured next steps and indicative budget guidance.</p>
            <div className="cd-cta-btns">
              <Link href="/lets-collaborate" className="btn btn-primary">
                Contact Us <Arrow />
              </Link>
              <Link href="/lets-collaborate" className="btn btn-outline-light">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
