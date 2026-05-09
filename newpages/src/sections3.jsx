// Trusted-by, Testimonials, Insights, News, CTA, Footer

const { Arrow: A3, ArrowUpRight: AUR3, ChevronLeft, ChevronRight, Social } = window.UI;

function TrustedBy() {
  const logos = [
    "LGED","RHD","BWDB","PWD","DPHE","CITY CORP.",
    "BPDB","DESCO","BSCIC","BEZA","RAJUK","EPZ",
  ];
  return (
    <section className="section-pad-sm section-soft" data-screen-label="10 Trusted">
      <div className="container">
        <div className="section-head single" style={{textAlign:"center"}}>
          <div>
            <span className="microlabel">Trusted by Government & Industry</span>
            <h2 style={{marginTop:14, fontSize:"clamp(28px, 3vw, 40px)"}}>
              Selected clients & partners we've served.
            </h2>
          </div>
        </div>
        <div className="trusted-wall">
          {logos.map(l => <div key={l} className="trusted-logo">{l}</div>)}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "Professional execution and timely completion. Highly dependable team on every milestone of our facility build.",
      who: "Engr. Rafiqul Islam", role: "Project Director · LGED Cumilla Region", avi: "RI" },
    { q: "Strong communication, quality work and excellent site management — the kind of contractor you want on a complex tender.",
      who: "Tanvir Ahmed", role: "Infrastructure Lead · Private EPZ Developer", avi: "TA" },
    { q: "A trusted partner for demanding infrastructure works. Delivered our bridge project with full engineering discipline.",
      who: "Farhana Rahman", role: "Chief Engineer · Regional Authority", avi: "FR" },
  ];
  const [idx, setIdx] = React.useState(0);
  const go = (d) => setIdx((idx + d + items.length) % items.length);
  const cur = items[idx];
  return (
    <section className="section-pad section-dark" data-screen-label="11 Testimonials">
      <div className="container">
        <div className="testi-wrap">
          <div className="testi-left">
            <span className="microlabel on-dark">Client Voice</span>
            <h2 style={{marginTop:18}}>What clients say after the last truck leaves the site.</h2>
            <p>Our reputation is built on what happens after handover —
               buildings that perform, roads that hold, bridges that stand.</p>
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
                {items.map((_, i) => (
                  <span key={i} className={`dot ${i === idx ? "active" : ""}`} onClick={() => setIdx(i)}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Insights() {
  const posts = [
    { cat: "Standards", date: "APR 2026", img: window.IMG.insight1, t: "Modern Construction Standards in Bangladesh" },
    { cat: "Planning",  date: "MAR 2026", img: window.IMG.insight2, t: "Why Site Planning Matters More Than Ever" },
    { cat: "Economy",   date: "MAR 2026", img: window.IMG.insight3, t: "Infrastructure Growth Opportunities in 2026" },
    { cat: "Safety",    date: "FEB 2026", img: window.IMG.insight4, t: "Safety Practices for Better Delivery" },
  ];
  return (
    <section className="section-pad" data-screen-label="12 Insights">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">INSIGHTS / 12</span>
            <h2>Industry thinking from our field teams.</h2>
          </div>
          <p className="head-right">
            Notes on construction methodology, safety practices and the infrastructure
            landscape in Bangladesh — written by the engineers doing the work.
          </p>
        </div>
        <div className="insights-grid">
          {posts.map(p => (
            <article key={p.t} className="insight">
              <div className="insight-img" style={{ backgroundImage: `url(${p.img})` }} />
              <div className="insight-meta">
                <span className="cat">{p.cat}</span>
                <span className="dot"/>
                <span>{p.date}</span>
                <span className="dot"/>
                <span>6 min read</span>
              </div>
              <h4>{p.t}</h4>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function News() {
  const items = [
    { d: "18", m: "APR 2026", tag: "Contract Won",    t: "Zakir Enterprise Wins New Infrastructure Contract in Chattogram Region" },
    { d: "02", m: "APR 2026", tag: "Fleet",           t: "New Equipment Added to Operational Fleet — Expanded Earthwork Capacity" },
    { d: "25", m: "MAR 2026", tag: "Milestone",       t: "Project Milestone Successfully Completed — 14-Storey RCC Framework Topped Out" },
    { d: "10", m: "MAR 2026", tag: "Expansion",       t: "Expansion Into New Service Regions — Sylhet & Barishal Operations Now Live" },
  ];
  return (
    <section id="news" className="section-pad section-soft" data-screen-label="13 News">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">COMPANY NEWS / 13</span>
            <h2>What's happening at Zakir Enterprise.</h2>
          </div>
          <a href="#" className="btn btn-ghost head-right" style={{alignSelf:"end"}}>All News & Announcements <A3/></a>
        </div>
        <div className="news-list">
          {items.map(it => (
            <article key={it.t} className="news-item">
              <div className="news-date">
                <span className="d">{it.d}</span>
                <span>{it.m}</span>
              </div>
              <span className="news-tag">{it.tag}</span>
              <div className="news-title">{it.t}</div>
              <div className="news-arrow"><A3 size={12}/></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="cta-banner" data-screen-label="14 CTA">
      <div className="cta-bg" style={{ backgroundImage: `url(${window.IMG.ctaBanner})` }} />
      <div className="container">
        <div className="cta-inner">
          <div>
            <span className="microlabel on-dark">Let's Build Together</span>
            <h2 style={{marginTop:20}}>
              Let's build your next <span className="gold">project</span> <span className="accent">together.</span>
            </h2>
          </div>
          <div className="cta-right">
            <p>From planning to execution, Zakir Enterprise is ready to deliver quality
               work with confidence and professionalism — on schedule, on budget, on standard.</p>
            <div className="cta-btns">
              <a href="#" className="btn btn-primary">Let's Collaborate <A3/></a>
              <a href="#" className="btn btn-outline-light">Discuss Project <AUR3/></a>
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

function Footer() {
  return (
    <footer id="contact" className="footer" data-screen-label="15 Footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <span className="mark">Z</span>
              <span className="title-stack">
                <span>ZAKIR ENTERPRISE</span>
                <span className="sub">Construction · Infrastructure · Bangladesh</span>
              </span>
            </a>
            <p>A Bangladesh-based construction firm delivering government, commercial and
               private works with disciplined execution and dependable project management.</p>
            <div className="footer-contact">
              <strong>Head Office</strong>
              House 42, Road 11, Banani,<br/>Dhaka 1213, Bangladesh<br/>
              <strong style={{marginTop:14}}>Get in touch</strong>
              zakirenterprise307@gmail.com<br/>
              +8801791026074
            </div>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Leadership</a></li>
              <li><a href="#">Business Network</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Certifications</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li><a href="#">Building Construction</a></li>
              <li><a href="#">Road & Bridge Works</a></li>
              <li><a href="#">Site Development</a></li>
              <li><a href="#">Structural & Foundation</a></li>
              <li><a href="#">Equipment Support</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Projects</h5>
            <ul>
              <li><a href="Projects.html">Government</a></li>
              <li><a href="Projects.html">Commercial</a></li>
              <li><a href="Projects.html">Private</a></li>
              <li><a href="Projects.html">Case Studies</a></li>
              <li><a href="Projects.html">Ongoing Works</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="#">Let's Collaborate</a></li>
              <li><a href="#">Discuss a Project</a></li>
              <li><a href="#">Vendor Enquiries</a></li>
              <li><a href="#">Media Requests</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Zakir Enterprise Ltd. · All rights reserved · Trade License · Dhaka</span>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><Social k="fb"/></a>
            <a href="#" aria-label="LinkedIn"><Social k="li"/></a>
            <a href="#" aria-label="Instagram"><Social k="ig"/></a>
            <a href="#" aria-label="YouTube"><Social k="yt"/></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { TrustedBy, Testimonials, Insights, News, CTABanner, Footer });
