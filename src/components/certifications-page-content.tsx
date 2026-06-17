import Link from "next/link";
import { Arrow } from "./site-ui";
import { CertificationsDirectory, type CertItem } from "./certifications/certifications-directory";
import { getPublishedCertifications, getCertificationFacets } from "@/lib/data/certifications";
import { getTermList } from "@/src/lib/site/taxonomy";
import { getIndexHero } from "@/src/lib/pages/index-hero";

// Public Certifications directory — server component on getPublishedCertifications +
// getCertificationFacets (certifications-fe-public §A/§D). No detail route; the document library
// (toolbar + grid + ?preview=<slug> modal) is a client island fed by the server-fetched set. Hero/
// intro/trust/CTA copy stays static — the PAGES-managed source lands with pages-fe-public (Wave C).

export async function CertificationsPageContent() {
  const [listed, facets, categoryTerms, indexHero] = await Promise.all([
    getPublishedCertifications({ pageSize: 100 }),
    getCertificationFacets(),
    getTermList("certifications-category"),
    getIndexHero("certifications-index"), // hero chrome from PAGES (§D)
  ]);

  const items = listed.data as Array<CertItem & { id: string }>;
  const total = listed.meta.total;
  const renewedCount = facets.statuses.find((s) => s.value === "Renewed")?.count ?? items.filter((c) => c.status === "Renewed").length;

  // Filter option labels from the SITE taxonomy helper + facet statuses ("All" first).
  const categories = ["All", ...categoryTerms.map((t) => t.label)];
  const statuses = ["All", ...facets.statuses.map((s) => s.value)];

  return (
    <>
      <section className="ct-hero">
        <div className="ct-hero-bg" style={{ backgroundImage: "url(https://res.cloudinary.com/dk4csiouq/image/upload/v1778566967/Credentials_HERO_ln0rym.jpg)" }} />
        <div className="container ct-hero-inner">
          <div className="bg-crumbs" style={{ marginBottom: 28 }}>
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Certifications</span>
          </div>
          <span className="ct-hero-label">{indexHero?.eyebrow ?? "Trust & Compliance"}</span>
          <h1>
            {indexHero?.heading ?? (
              <>
                Certifications
                <br />&amp; Credentials.
              </>
            )}
          </h1>
          <p className="ct-hero-sub">
            {indexHero?.subheading ?? "Official registrations, approvals, and certifications that reinforce capability, quality, and readiness."}
          </p>
          <div className="ct-hero-ctas">
            <Link href="/lets-collaborate" className="btn btn-primary">
              Contact Us <Arrow />
            </Link>
            <a href="#certs" className="btn btn-outline-light">
              Browse Documents
            </a>
          </div>
          <div className="ct-hero-meta">
            <div className="m">
              <span className="k">Documents On File</span>
              <span className="v">{total} Active</span>
            </div>
            <div className="m">
              <span className="k">Recently Renewed</span>
              <span className="v">{renewedCount} Updated</span>
            </div>
            <div className="m">
              <span className="k">Compliance Cycle</span>
              <span className="v">Continuous</span>
            </div>
            <div className="m">
              <span className="k">Audit Ready</span>
              <span className="v">
                <span className="dot-live" />
                Yes
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-intro">
        <div className="container ct-intro-grid">
          <div className="ct-intro-left">
            <span className="microlabel">Why Certifications Matter</span>
            <h2 className="ct-intro-head">
              Certified capability
              <br /> <span className="accent">verified in writing.</span>
            </h2>
            <p className="ct-intro-lede">
              Zakir Enterprise maintains the registrations, licenses, and professional certifications necessary to support public and private sector
              construction projects across Bangladesh.
            </p>
          </div>
          <div className="ct-intro-right">
            <div className="ct-intro-card">
              <div className="ct-intro-num">01</div>
              <div>
                <h4>Verified Documents</h4>
                <p>Every document on this page is current, signed, and verifiable through the issuing authority.</p>
              </div>
            </div>
            <div className="ct-intro-card">
              <div className="ct-intro-num">02</div>
              <div>
                <h4>Operational Readiness</h4>
                <p>Pre-qualified for Class-A public tenders, BEZA zones, and private institutional projects.</p>
              </div>
            </div>
            <div className="ct-intro-card">
              <div className="ct-intro-num">03</div>
              <div>
                <h4>Nationwide Capability</h4>
                <p>Credentials cover all 64 districts - infrastructure, commercial, industrial, and civil works.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-section" id="certs">
        <div className="container">
          <div className="ct-section-head">
            <div>
              <span className="microlabel">Document Library</span>
              <h2>
                Our credentials,
                <br />
                transparently presented.
              </h2>
            </div>
            <p>Browse, filter, and preview every document we hold - each one current, verified, and available on request for pre-qualification.</p>
          </div>
          <CertificationsDirectory items={items} categories={categories} statuses={statuses} />
        </div>
      </section>

      <section className="ct-trust">
        <div className="container">
          <div className="ct-trust-head">
            <span className="microlabel on-dark">Built for Serious Projects</span>
            <h2>
              Built on documentation.
              <br />
              <span className="accent">Delivered with confidence.</span>
            </h2>
          </div>
          <div className="ct-trust-grid">
            <div className="ct-trust-card">
              <div className="ct-trust-num">01</div>
              <div className="ct-trust-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                  <path d="M12 3 L20 7 L20 13 Q20 18 12 21 Q4 18 4 13 L4 7 Z" />
                  <path d="M8 12 L11 15 L16 9" />
                </svg>
              </div>
              <h4>Verified Company Credentials</h4>
              <p>Every certificate on this page is current, traceable, and verifiable through the issuing body.</p>
            </div>
            <div className="ct-trust-card">
              <div className="ct-trust-num">02</div>
              <div className="ct-trust-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                  <rect x="4" y="4" width="16" height="16" />
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="14" x2="20" y2="14" />
                  <line x1="9" y1="4" x2="9" y2="20" />
                </svg>
              </div>
              <h4>Structured Operational Compliance</h4>
              <p>ISO-certified operations for quality, environment, and safety under one management system.</p>
            </div>
            <div className="ct-trust-card">
              <div className="ct-trust-num">03</div>
              <div className="ct-trust-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="3" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="21" y2="12" />
                </svg>
              </div>
              <h4>Ready for Public &amp; Private Projects</h4>
              <p>Pre-qualified and deployable for nationwide infrastructure, commercial, and civil project scopes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-cta">
        <div className="ct-cta-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=2000&q=80&auto=format&fit=crop)" }} />
        <div className="container ct-cta-grid">
          <div>
            <span className="microlabel on-dark">Start Here</span>
            <h2>
              Need a qualified
              <br />
              construction partner?
            </h2>
          </div>
          <div className="ct-cta-right">
            <p>Let&apos;s discuss your next project with a team backed by execution experience and professional credentials.</p>
            <div className="ct-cta-btns">
              <Link href="/lets-collaborate" className="btn btn-primary">
                Contact Us <Arrow />
              </Link>
              <Link href="/projects" className="btn btn-outline-light">
                View Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
