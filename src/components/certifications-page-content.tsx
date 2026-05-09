"use client";

import * as React from "react";
import Link from "next/link";
import { Arrow, ArrowUpRight } from "./site-ui";
import { CERTIFICATIONS, type CertificationItem } from "../data/certifications";

function CertThumb({ item }: { item: CertificationItem }) {
  return (
    <div className={`ct-thumb ${item.thumbClass}`}>
      <div className="ct-thumb-frame">
        <div className="ct-thumb-header">
          <div className="ct-thumb-mark">Z</div>
          <div className="ct-thumb-id">{item.number}</div>
        </div>
        <div className="ct-thumb-title">Certificate of {item.category.split(" ")[0]}</div>
        <div className="ct-thumb-auth">{item.authority}</div>
        <div className="ct-thumb-footer">
          <div className={`ct-thumb-seal ${item.accent}`} />
        </div>
      </div>
    </div>
  );
}

function CtCard({ item, onPreview }: { item: CertificationItem; onPreview: (i: CertificationItem) => void }) {
  return (
    <div className="ct-card">
      <div className="ct-card-thumb">
        <CertThumb item={item} />
        <span className={`ct-status ${item.status.replace(/\s+/g, "-").toLowerCase()}`}>{item.status}</span>
      </div>
      <div className="ct-card-body">
        <span className="ct-chip">{item.category}</span>
        <h3>{item.title}</h3>
        <div className="ct-card-auth">{item.authority}</div>
        <div className="ct-card-meta">
          <div>
            <span className="k">Issued</span>
            <span className="v">{item.issued}</span>
          </div>
          <div>
            <span className="k">Valid Until</span>
            <span className="v">{item.expiry}</span>
          </div>
        </div>
        <div className="ct-card-foot">
          <span className="ct-card-num">{item.number}</span>
          <button className="ct-preview" onClick={() => onPreview(item)}>
            Preview <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CtModal({ item, onClose }: { item: CertificationItem; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ct-modal-backdrop" onClick={onClose}>
      <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ct-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="ct-modal-body">
          <div className="ct-modal-preview">
            <CertThumb item={item} />
          </div>
          <div className="ct-modal-info">
            <span className="ct-chip">{item.category}</span>
            <h3>{item.title}</h3>
            <p className="ct-modal-desc">{item.description}</p>
            <div className="ct-modal-meta">
              <div>
                <span className="k">Issuing Authority</span>
                <span className="v">{item.authority}</span>
              </div>
              <div>
                <span className="k">Certificate No.</span>
                <span className="v">{item.number}</span>
              </div>
              <div>
                <span className="k">Issue Date</span>
                <span className="v">{item.issued}</span>
              </div>
              <div>
                <span className="k">Valid Until</span>
                <span className="v">{item.expiry}</span>
              </div>
              <div>
                <span className="k">Status</span>
                <span className="v">
                  <span className={`ct-status inline ${item.status.replace(/\s+/g, "-").toLowerCase()}`}>{item.status}</span>
                </span>
              </div>
            </div>
            <div className="ct-modal-ctas">
              <button className="btn btn-outline-dark" onClick={onClose}>
                Close Preview
              </button>
            </div>
            <div className="ct-modal-note">
              Document preview is a visual representation. Original verified copies are provided during pre-qualification on request.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificationsPageContent() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [sort, setSort] = React.useState("recent");
  const [preview, setPreview] = React.useState<CertificationItem | null>(null);

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(CERTIFICATIONS.map((c) => c.category)))],
    []
  );
  const statuses = React.useMemo(
    () => ["All", ...Array.from(new Set(CERTIFICATIONS.map((c) => c.status)))],
    []
  );

  const filtered = React.useMemo(() => {
    let list = CERTIFICATIONS.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (status !== "All" && c.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!c.title.toLowerCase().includes(s) && !c.authority.toLowerCase().includes(s) && !c.number.toLowerCase().includes(s)) return false;
      }
      return true;
    });

    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "expiry") list = [...list].sort((a, b) => a.expiry.localeCompare(b.expiry));
    return list;
  }, [q, cat, status, sort]);

  const setPreviewInUrl = React.useCallback(
    (id: string | null) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (id) url.searchParams.set("preview", id);
      else url.searchParams.delete("preview");
      if (!url.hash) {
        url.hash = "certs";
      }
      window.history.replaceState({}, "", url.toString());
    },
    []
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const previewId = new URLSearchParams(window.location.search).get("preview");
    if (!previewId) return;
    const target = CERTIFICATIONS.find((c) => c.id === previewId);
    if (target) {
      setPreview(target);
    }
  }, []);

  const openPreview = React.useCallback(
    (item: CertificationItem) => {
      setPreview(item);
      setPreviewInUrl(item.id);
    },
    [setPreviewInUrl]
  );

  const closePreview = React.useCallback(() => {
    setPreview(null);
    setPreviewInUrl(null);
  }, [setPreviewInUrl]);

  const clearFilters = React.useCallback(() => {
    setQ("");
    setCat("All");
    setStatus("All");
    setSort("recent");
  }, []);

  return (
    <>
      <section className="ct-hero">
        <div className="ct-hero-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=2000&q=80&auto=format&fit=crop)" }} />
        <div className="container ct-hero-inner">
          <div className="bg-crumbs" style={{ marginBottom: 28 }}>
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Certifications</span>
          </div>
          <span className="ct-hero-label">Trust & Compliance</span>
          <h1>
            Certifications
            <br />& Credentials.
          </h1>
          <p className="ct-hero-sub">Official registrations, approvals, and certifications that reinforce capability, quality, and readiness.</p>
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
              <span className="v">{CERTIFICATIONS.length} Active</span>
            </div>
            <div className="m">
              <span className="k">Renewed Recently</span>
              <span className="v">{CERTIFICATIONS.filter((c) => c.status === "Renewed Recently").length} Updated</span>
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
              <br />
               <span className="accent">verified in writing.</span>
            </h2>
            <p className="ct-intro-lede">
              Zakir Enterprise maintains the registrations, licenses, and professional certifications necessary to support public and private sector construction projects across Bangladesh.
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
          <div className="ct-toolbar">
            <div className="ct-toolbar-search">
              <input type="text" placeholder="Search by title, authority, or number..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="ct-toolbar-filters">
              <div className="ct-select">
                <label>Category</label>
                <select value={cat} onChange={(e) => setCat(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="ct-select">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="ct-select">
                <label>Sort by</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recent">Most Recent</option>
                  <option value="title">Title A-Z</option>
                  <option value="expiry">Expiry Date</option>
                </select>
              </div>
              <button className="ct-clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
            <div className="ct-toolbar-count">
              <span>
                <strong>{filtered.length}</strong> documents
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="ct-empty">
              <div className="ct-empty-icon">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                  <rect x="4" y="4" width="16" height="16" />
                  <path d="M4 4 L20 20" />
                </svg>
              </div>
              <h4>No documents match those filters</h4>
              <p>Try clearing the search or selecting a different category.</p>
              <button className="btn btn-dark" onClick={clearFilters}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="ct-grid">
              {filtered.map((item) => (
                <CtCard key={item.id} item={item} onPreview={openPreview} />
              ))}
            </div>
          )}
        </div>
        {preview && <CtModal item={preview} onClose={closePreview} />}
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
              <h4>Ready for Public & Private Projects</h4>
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
            <p>Let's discuss your next project with a team backed by execution experience and professional credentials.</p>
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

