"use client";

import * as React from "react";
import { Arrow, ArrowUpRight, SvcIcon } from "./site-ui";
import { CONCERNS, RELATED_CONCERNS, DEFAULT_CONCERN_ID, type ConcernId } from "@/src/data/concerns-data";


export function ConcernDetailPageContent({ concernId = DEFAULT_CONCERN_ID }: { concernId?: string }) {
  const [openFaq, setOpenFaq] = React.useState(0);
  const activeConcernId = (concernId in CONCERNS ? concernId : DEFAULT_CONCERN_ID) as ConcernId;
  const concern = CONCERNS[activeConcernId];
  const relatedConcerns = RELATED_CONCERNS.filter((item) => item.slug !== activeConcernId);

  return (
    <>
      <section className="cd-hero">
        <div className="cd-hero-bg" style={{ backgroundImage: `url(${concern.hero})` }} />
        <div className="container cd-hero-inner">
          <div className="bg-crumbs" style={{ marginBottom: 28 }}>
            <a href="/">Home</a>
            <span className="sep">/</span>
            <a href="/">Concerns</a>
            <span className="sep">/</span>
            <span className="current">{concern.short}</span>
          </div>
          <div className="cd-hero-badge">
            <div className="cd-hero-badge-mark">Z</div>
            <div className="cd-hero-badge-body">
              <div className="cd-hero-badge-unit">Concern - Zakir Enterprise Group</div>
              <div className="cd-hero-badge-code">
                {concern.code} - {concern.est}
              </div>
            </div>
          </div>
          <h1>{concern.name}</h1>
          <p className="cd-hero-tag">{concern.tagline}</p>
          <p className="cd-hero-sub">{concern.intro}</p>
          <div className="cd-hero-ctas">
            <a href="/lets-collaborate" className="btn btn-primary">
              Contact This Concern <Arrow />
            </a>
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
                <span className="dot-live" />Active &amp; Delivering
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="cd-overview">
        <div className="container cd-overview-grid">
          <div className="cd-overview-left">
            <span className="microlabel">Concern Overview</span>
            <h2>{concern.overview.title}</h2>
            <div className="cd-overview-quick">
              <div>
                <div className="n">2014</div>
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
            {concern.overview.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="cd-mission">
              <div className="cd-mission-label">Mission</div>
              <blockquote>{concern.overview.mission}</blockquote>
            </div>
          </div>
        </div>
      </section>

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
              <div key={fact.label} className="cd-fact-card">
                <div className="cd-fact-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="cd-fact-big">{fact.big}</div>
                <div className="cd-fact-lbl">{fact.label}</div>
                <div className="cd-fact-sub">{fact.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-services" id="services">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel">Services & Capabilities</span>
              <h2>What this concern delivers.</h2>
            </div>
            <p>A full civil engineering stack, assembled in-house and delivered with accountable execution.</p>
          </div>
          <div className="cd-services-grid">
            {concern.services.map((service, index) => (
              <div key={service.title} className="cd-service-card">
                <div className="cd-service-icon">
                  <SvcIcon kind={service.icon} />
                </div>
                <div className="cd-service-num">{String(index + 1).padStart(2, "0")}</div>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <span className="cd-service-more">
                  Learn more <Arrow size={12} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-why">
        <div className="container cd-why-grid">
          <div className="cd-why-aside">
            <span className="microlabel">Why Choose Us</span>
            <h2>
              Six reasons clients
              <br />
              come back for project two.
            </h2>
            <p>The industry has many contractors. We aim to be the one you do not need to chase.</p>
            <a href="/lets-collaborate" className="btn btn-dark">
              Start a Conversation <Arrow />
            </a>
          </div>
          <div className="cd-why-list">
            {concern.why.map((item) => (
              <div key={item.big} className="cd-why-item">
                <div className="cd-why-num">{item.big}</div>
                <div className="cd-why-body">
                  <h4>{item.title}</h4>
                  <p>{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            <a href="/projects" className="btn btn-outline-dark">
              View All Projects <Arrow />
            </a>
          </div>
          <div className="cd-projects-grid">
            {concern.projects.map((project, index) => (
              <a key={project.title} className={`cd-project-card ${index === 0 ? "wide" : ""}`} href="/projects" style={{ textDecoration: "none" }}>
                <div className="cd-project-img" style={{ backgroundImage: `url(${project.image})` }}>
                  <span className="cd-project-cat">{project.category}</span>
                </div>
                <div className="cd-project-body">
                  <div className="cd-project-loc">{project.location}</div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <span className="cd-project-more">
                    View Project <ArrowUpRight size={12} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-process">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel on-dark">Work Process</span>
              <h2>A six-stage delivery protocol.</h2>
            </div>
            <p>Every project follows the same discipline from first site walk to final defects review.</p>
          </div>
          <div className="cd-process-track">
            {concern.process.map((step, index) => (
              <div key={step.step} className="cd-process-step">
                <div className="cd-process-connector">
                  <span className="cd-process-dot" />
                  {index < concern.process.length - 1 && <span className="cd-process-line" />}
                </div>
                <div className="cd-process-body">
                  <div className="cd-process-num">{step.step}</div>
                  <h4>{step.title}</h4>
                  <p>{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            {concern.gallery.map((image, index) => (
              <div key={image} className={`cd-gallery-cell g-${index}`} style={{ backgroundImage: `url(${image})` }}>
                <div className="cd-gallery-tag">{String(index + 1).padStart(2, "0")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            {relatedConcerns.map((item, index) => (
              <a key={item.slug} className="cd-related-card" href={`/concern-detail/${item.slug}`} style={{ textDecoration: "none" }}>
                <div className="cd-related-index">{String(index + 2).padStart(2, "0")}</div>
                <span className="cd-related-tag">{item.tag}</span>
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
                <span className="cd-related-arrow">
                  <ArrowUpRight />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

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
            <a href="/lets-collaborate" className="btn btn-dark">
              Ask the Project Desk <Arrow />
            </a>
          </div>

          <div className="cd-faq-list">
            {concern.faqs.map((faq, index) => (
              <div key={faq.q} className={`cd-faq-item ${openFaq === index ? "open" : ""}`}>
                <button type="button" className="cd-faq-q" onClick={() => setOpenFaq((prev) => (prev === index ? -1 : index))}>
                  <span className="cd-faq-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="cd-faq-text">{faq.q}</span>
                  <span className="cd-faq-sign">{openFaq === index ? "-" : "+"}</span>
                </button>
                <div className="cd-faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-cta">
        <div
          className="cd-cta-bg"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=2000&q=80&auto=format&fit=crop)",
          }}
        />
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
              <a href="/lets-collaborate" className="btn btn-primary">
                Contact Us <Arrow />
              </a>
              <a href="/lets-collaborate" className="btn btn-outline-light">
                Get a Quote
              </a>
            </div>
            <div className="cd-cta-contact">
              <div>
                <span className="k">Project Desk</span>
                <span className="v">+8801791026074</span>
              </div>
              <div>
                <span className="k">Email</span>
                <span className="v">zakirenterprise307@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

