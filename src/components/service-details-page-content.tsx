import Link from "next/link";
import { Arrow, ArrowUpRight, SvcIcon } from "./site-ui";
import { MediaImage } from "./media/media-image";
import { SvcSubnav } from "./services/svc-subnav";
import { SvcFAQ } from "./services/svc-faq";
import type { getPublishedServiceBySlug } from "@/lib/data/services";

// Public Service detail — server component on getPublishedServiceBySlug (services-fe-public
// §A/§C/§E). Renders fully server-side; the sticky sub-nav + FAQ accordion are the only client
// islands. Optional FAQ/machinery sections are omitted when empty (BR-7). Contact block sourced
// from the SITE chrome bundle (§E).

type Service = NonNullable<Awaited<ReturnType<typeof getPublishedServiceBySlug>>>;

export type SvcContact = {
  phone: string;
  email: string;
  officeAddress: string;
};

export function ServiceDetailsPageContent({ service, contact }: { service: Service; contact: SvcContact }) {
  const d = service;
  const titleHead = d.title.split(" ").slice(0, -1).join(" ");
  const titleTail = d.title.split(" ").slice(-1).join(" ");

  return (
    <>
      <section className="svc-hero">
        <div className="svc-hero-bg">
          <MediaImage media={d.hero_image} fill priority sizes="100vw" />
        </div>
        <div className="container svc-hero-inner">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/services">Services</Link>
            <span className="sep">/</span>
            <span className="crumb-now">{d.title}</span>
          </div>
          <div className="svc-hero-title-row">
            <div>
              <span className="microlabel on-dark">
                Construction Service - {String(d.service_number).padStart(2, "0")} / {String(d.total_services).padStart(2, "0")}
              </span>
              <h1 style={{ marginTop: 24 }}>
                {titleHead} <span className="accent">{titleTail}</span>
              </h1>
            </div>
            {d.subtitle && <p className="svc-hero-sub">{d.subtitle}</p>}
          </div>
          {d.meta.length > 0 && (
            <div className="svc-hero-meta">
              {d.meta.map((m) => (
                <div key={m.id}>
                  <span className="k">{m.key}</span>
                  <span className="v">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SvcSubnav />

      <section id="overview" className="section-pad">
        <div className="container">
          <div className="svc-overview-grid">
            <div>
              <span className="num" style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.3em", color: "var(--gold)", marginBottom: 14, display: "block" }}>
                SERVICE OVERVIEW / 01
              </span>
              {d.overview_title && <h2>{d.overview_title}</h2>}
              {d.overview_lead && <p className="overview-lead">{d.overview_lead}</p>}
            </div>
            <div className="overview-body">
              {d.overview_body && <p>{d.overview_body}</p>}
              {d.overview_bullets.length > 0 && (
                <ul className="overview-keybullets">
                  {d.overview_bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {d.scope.length > 0 && (
        <section id="scope" className="section-pad section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num">SCOPE OF WORK / 02</span>
                {d.scope_title && <h2>{d.scope_title}</h2>}
              </div>
              {d.scope_lead && <p className="head-right">{d.scope_lead}</p>}
            </div>
            <div className="scope-grid">
              {d.scope.map((it, i) => (
                <div key={it.id} className="scope-card">
                  <div className="scope-top">
                    <div className="scope-icon">
                      <SvcIcon kind={it.icon ?? ""} />
                    </div>
                    <span className="scope-num">
                      {String(i + 1).padStart(2, "0")} / {String(d.scope.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h4>{it.title}</h4>
                  {it.body && <p>{it.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {d.process.length > 0 && (
        <section id="process" className="section-pad section-dark">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num" style={{ color: "var(--lime)" }}>
                  EXECUTION PROCESS / 03
                </span>
                {d.process_title && <h2>{d.process_title}</h2>}
              </div>
              {d.process_lead && <p className="head-right" style={{ color: "rgba(255,255,255,0.65)" }}>{d.process_lead}</p>}
            </div>
            <div className="process-wrap">
              <div className="process-track">
                {d.process.map((s, i) => (
                  <div key={s.id} className="process-step">
                    <div className="process-dot">{String(i + 1).padStart(2, "0")}</div>
                    {s.tag && <span className="process-tag">{s.tag}</span>}
                    <h4>{s.title}</h4>
                    {s.body && <p>{s.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {d.benefits.length > 0 && (
        <section id="benefits" className="section-pad">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num">WHY ZAKIR ENTERPRISE / 04</span>
                {d.benefits_title && <h2>{d.benefits_title}</h2>}
              </div>
              {d.benefits_lead && <p className="head-right">{d.benefits_lead}</p>}
            </div>
            <div className="benefits-grid">
              {d.benefits.map((it, i) => (
                <div key={it.id} className="benefit-card">
                  <div className="benefit-top">
                    <div className="benefit-icon">
                      <SvcIcon kind={it.icon ?? ""} />
                    </div>
                    <span className="benefit-num">0{i + 1}</span>
                  </div>
                  <h4>{it.title}</h4>
                  {it.body && <p>{it.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Capability / machinery — hidden when no machine items (BR-7) */}
      {d.machine.length > 0 && (
        <section id="capability" className="section-pad section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="num">EXECUTION STRENGTH / 05</span>
                {d.capability_title && <h2>{d.capability_title}</h2>}
              </div>
              {d.capability_lead && <p className="head-right">{d.capability_lead}</p>}
            </div>
            <div className="machinery-wrap">
              <div className="machinery-image">
                <MediaImage media={d.machine_image} fill sizes="(max-width: 980px) 100vw, 40vw" />
                <div className="machine-badge">Owned Fleet - Trained Operators</div>
                <div className="machine-overlay">
                  <div className="big">120+</div>
                  <div className="lbl">Active equipment units</div>
                </div>
              </div>
              <div className="machinery-copy">
                {d.capability_body_title && <h3>{d.capability_body_title}</h3>}
                {d.capability_body_desc && <p>{d.capability_body_desc}</p>}
                <div className="machine-list">
                  {d.machine.map((it, i) => (
                    <div key={it.id} className="machine-item">
                      <span className="n">0{i + 1}</span>
                      <div>
                        <div className="t">{it.title}</div>
                        {it.description && <div className="d">{it.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ — hidden when empty (BR-7) */}
      {d.faq.length > 0 && <SvcFAQ items={d.faq} title={d.faq_title} lead={d.faq_lead} />}

      <section id="svc-cta" className="svc-cta">
        <div className="svc-cta-bg">
          <MediaImage media={d.cta_image} fill sizes="100vw" />
        </div>
        <div className="container">
          <div className="svc-cta-inner">
            <div>
              <span className="svc-cta-tag">Ready To Build - Nationwide</span>
              <h2>
                Planning a <span className="accent">{d.title}</span> project? <span className="italic">Let&apos;s deliver it right.</span>
              </h2>
              <p>
                Share your site details, scope and timeline. Our project team will respond with a structured quotation and delivery roadmap
                within two working days.
              </p>
              <div className="svc-cta-btns">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Let&apos;s Collaborate <Arrow />
                </Link>
                <Link href="/lets-collaborate" className="btn btn-outline-light">
                  Let&apos;s Collaborate <ArrowUpRight />
                </Link>
              </div>
              <div className="svc-cta-tertiary">
                <span>Looking at our work first?</span>
                <Link href="/projects">
                  View All Projects <Arrow size={12} />
                </Link>
              </div>
            </div>
            <aside className="svc-cta-info">
              <h5>Project Desk</h5>
              <ul>
                <li>
                  <span className="k">Direct line</span>
                  <span className="v">{contact.phone}</span>
                </li>
                <li>
                  <span className="k">Email</span>
                  <span className="v">{contact.email}</span>
                </li>
                <li>
                  <span className="k">Head office</span>
                  <span className="v">{contact.officeAddress}</span>
                </li>
                <li>
                  <span className="k">Response time</span>
                  <span className="v">Within 2 working days</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <div className="mobile-sticky-cta">
        <div className="caption">
          Zakir Enterprise<span>{d.title}</span>
        </div>
        <a href="#svc-cta" className="btn btn-primary">
          Get Quote <Arrow />
        </a>
      </div>
    </>
  );
}
