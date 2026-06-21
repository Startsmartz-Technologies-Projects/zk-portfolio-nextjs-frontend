"use client";
import * as React from "react";
import Link from "next/link";
import { Arrow as A3, ArrowUpRight as AUR3, ChevronLeft, ChevronRight, Social } from "./site-ui";
import { IMG } from "./sections1";
import { MediaImage } from "@/src/components/media/media-image";
import { socialIconKey } from "@/src/lib/site/social";
import type { SiteChrome } from "@/src/lib/site/chrome";

// Trusted-by, Testimonials, Insights, News, CTA, Footer

export function TrustedBy() {
  const logos = ["LGED", "RHD", "BWDB", "PWD", "DPHE", "CITY CORP.", "BPDB", "DESCO", "BSCIC", "BEZA", "RAJUK", "EPZ"];
  return (
    <section className="section-pad-sm section-soft" data-screen-label="10 Trusted">
      <div className="container">
        <div className="section-head single" style={{ textAlign: "center" }}>
          <div>
            <span className="microlabel">Trusted by Government & Industry</span>
            <h2 style={{ marginTop: 14, fontSize: "clamp(28px, 3vw, 40px)" }}>Selected clients & partners we've served.</h2>
          </div>
        </div>
        <div className="trusted-wall">{logos.map((l) => <div key={l} className="trusted-logo">{l}</div>)}</div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const items = [
    { q: "Professional execution and timely completion. Highly dependable team on every milestone of our facility build.", who: "Engr. Rafiqul Islam", role: "Project Director · LGED Cumilla Region", avi: "RI" },
    { q: "Strong communication, quality work and excellent site management - the kind of contractor you want on a complex tender.", who: "Tanvir Ahmed", role: "Infrastructure Lead · Private EPZ Developer", avi: "TA" },
    { q: "A trusted partner for demanding infrastructure works. Delivered our bridge project with full engineering discipline.", who: "Farhana Rahman", role: "Chief Engineer · Regional Authority", avi: "FR" },
  ];

  const [idx, setIdx] = React.useState(0);
  const go = (d: number) => setIdx((idx + d + items.length) % items.length);
  const cur = items[idx];

  return (
    <section className="section-pad section-dark" data-screen-label="11 Testimonials">
      <div className="container">
        <div className="testi-wrap">
          <div className="testi-left">
            <span className="microlabel on-dark">Client Voice</span>
            <h2 style={{ marginTop: 18 }}>What clients say after the last truck leaves the site.</h2>
            <p>Our reputation is built on what happens after handover - buildings that perform, roads that hold, bridges that stand.</p>
          </div>
          <div className="testi-card">
            <div className="quote-mark">"</div>
            <blockquote>{cur.q}</blockquote>
            <div className="testi-author">
              <div className="avi">{cur.avi}</div>
              <div>
                <div className="who">{cur.who}</div>
                <div className="role">{cur.role}</div>
              </div>
            </div>
            <div className="testi-controls">
              <button className="testi-btn" onClick={() => go(-1)}><ChevronLeft/></button>
              <button className="testi-btn" onClick={() => go(1)}><ChevronRight/></button>
              <div className="testi-dots">
                {items.map((_, i) => <span key={i} className={`dot ${i === idx ? "active" : ""}`} onClick={() => setIdx(i)}/>) }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Insights() {
  const posts = [
    { id: "quality-foundation-work", cat: "Standards", date: "APR 2026", img: IMG.insight1, t: "Modern Construction Standards in Bangladesh" },
    { id: "rural-roads-lged-bangladesh", cat: "Planning", date: "MAR 2026", img: IMG.insight2, t: "Why Site Planning Matters More Than Ever" },
    { id: "project-delivery-risk-framework", cat: "Economy", date: "MAR 2026", img: IMG.insight3, t: "Infrastructure Growth Opportunities in 2026" },
    { id: "safety-culture-site-level", cat: "Safety", date: "FEB 2026", img: IMG.insight4, t: "Safety Practices for Better Delivery" },
  ];

  return (
    <section className="section-pad" data-screen-label="12 Insights">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">INSIGHTS / 12</span>
            <h2>Industry thinking from our field teams.</h2>
          </div>
          <p className="head-right">Notes on construction methodology, safety practices and the infrastructure landscape in Bangladesh - written by the engineers doing the work.</p>
        </div>
        <div className="insights-grid">
          {posts.map((p) => (
            <Link key={p.t} href={`/blogs/${p.id}`} className="insight" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="insight-img" style={{ backgroundImage: `url(${p.img})` }} />
              <div className="insight-meta">
                <span className="cat">{p.cat}</span>
                <span className="dot"/>
                <span>{p.date}</span>
                <span className="dot"/>
                <span>6 min read</span>
              </div>
              <h4>{p.t}</h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function News() {
  const items = [
    { id: "road-dhaka-awarded", d: "18", m: "APR 2026", tag: "Contract Won", t: "Zakir Enterprise Wins New Infrastructure Contract in Chattogram Region" },
    { id: "new-batching-plant", d: "02", m: "APR 2026", tag: "Fleet", t: "New Equipment Added to Operational Fleet - Expanded Earthwork Capacity" },
    { id: "padma-bridge-milestone", d: "25", m: "MAR 2026", tag: "Milestone", t: "Project Milestone Successfully Completed - 14-Storey RCC Framework Topped Out" },
    { id: "rhd-partnership-framework", d: "10", m: "MAR 2026", tag: "Expansion", t: "Expansion Into New Service Regions - Sylhet & Barishal Operations Now Live" },
  ];

  return (
    <section id="news" className="section-pad section-soft" data-screen-label="13 News">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">COMPANY NEWS / 13</span>
            <h2>What's happening at Zakir Enterprise.</h2>
          </div>
          <Link href="/news" className="btn btn-ghost head-right" style={{ alignSelf: "end" }}>All News & Announcements <A3/></Link>
        </div>
        <div className="news-list">
          {items.map((it) => (
            <Link key={it.t} href={`/news/${it.id}`} className="news-item" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="news-date">
                <span className="d">{it.d}</span>
                <span>{it.m}</span>
              </div>
              <span className="news-tag">{it.tag}</span>
              <div className="news-title">{it.t}</div>
              <div className="news-arrow"><A3 size={12}/></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <section className="cta-banner" data-screen-label="14 CTA">
      <div className="cta-bg" style={{ backgroundImage: `url(${IMG.ctaBanner})` }} />
      <div className="container">
        <div className="cta-inner">
          <div>
            <span className="microlabel on-dark">Let's Build Together</span>
            <h2 style={{ marginTop: 20 }}>Let's build your next <span className="gold">project</span> <span className="accent">together.</span></h2>
          </div>
          <div className="cta-right">
            <p>From planning to execution, Zakir Enterprise is ready to deliver quality work with confidence and professionalism - on schedule, on budget, on standard.</p>
            <div className="cta-btns">
              <Link href="/lets-collaborate" className="btn btn-primary">Let's Collaborate <A3/></Link>
              <Link href="/lets-collaborate" className="btn btn-outline-light">Discuss Project <AUR3/></Link>
            </div>
          </div>
        </div>
        <div className="cta-feats">
          <div className="cta-feat"><div className="k">Response</div><div className="v">Within 24 hours</div></div>
          <div className="cta-feat"><div className="k">Site Visit</div><div className="v">Free nationwide</div></div>
          <div className="cta-feat"><div className="k">Estimate</div><div className="v">Detailed BOQ included</div></div>
          <div className="cta-feat"><div className="k">Contract</div><div className="v">Transparent terms</div></div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ site }: { site: SiteChrome }) {
  return (
    <footer id="contact" className="footer" data-screen-label="15 Footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">
              <span className="nav-logo-img" style={{ height: 48, maxWidth: "100%" }}>
                <MediaImage media={site.logoFooter} fallback={<strong>{site.brandName}</strong>} />
              </span>
            </Link>
            {site.tagline ? <p className="footer-tagline">{site.tagline}</p> : null}
            {site.brandDescription ? <p>{site.brandDescription}</p> : null}
            <div className="footer-contact">
              <strong>Head Office</strong>
              <span style={{ whiteSpace: "pre-line" }}>{site.officeAddress}</span>
              <strong style={{ marginTop: 14 }}>Get in touch</strong>
              {site.email ? <>{site.email}<br/></> : null}
              {site.phone}
            </div>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/about">Leadership</Link></li>
              <li><Link href="/concern-detail/zakir-enterprise">Business Network</Link></li>
              <li><Link href="/lets-collaborate">Careers</Link></li>
              <li><Link href="/certifications">Certifications</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li><Link href="/service-details/heavy-civil-infrastructure-development">Heavy Civil Infrastructure</Link></li>
              <li><Link href="/service-details/integrated-road-and-highway-construction">Road & Highway Construction</Link></li>
              <li><Link href="/service-details/bridge-culvert-and-structural-engineering-works">Bridge & Structural Works</Link></li>
              <li><Link href="/service-details/piling-rcc-and-structural-construction">Piling, RCC & Structural</Link></li>
              <li><Link href="/service-details/heavy-equipment-supply-rental-and-operation">Equipment Supply & Rental</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Projects</h5>
            <ul>
              <li><Link href="/projects">Government</Link></li>
              <li><Link href="/projects">Commercial</Link></li>
              <li><Link href="/projects">Private</Link></li>
              <li><Link href="/projects">Case Studies</Link></li>
              <li><Link href="/projects">Ongoing Works</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li><Link href="/lets-collaborate">Let's Collaborate</Link></li>
              <li><Link href="/lets-collaborate">Discuss a Project</Link></li>
              <li><Link href="/lets-collaborate">Vendor Enquiries</Link></li>
              <li><Link href="/news">Media Requests</Link></li>
              <li><Link href="/lets-collaborate">Careers</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{site.copyright}</span>
          {site.socials.length > 0 ? (
            <div className="footer-socials">
              {site.socials.map((s) => (
                <a key={s.platform} href={s.url} aria-label={s.platform} target="_blank" rel="noopener noreferrer">
                  <Social k={socialIconKey(s.platform)} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
