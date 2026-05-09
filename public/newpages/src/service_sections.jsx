// Service Details Page — sections

const { Arrow, ArrowUpRight, SvcIcon } = window.UI;

const SIMG = {
  hero:   "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=2200&q=80&auto=format&fit=crop",
  scope:  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
  machine:"https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format&fit=crop",
  cta:    "https://images.unsplash.com/photo-1590644875981-3b4dbbd8b8ac?w=2000&q=80&auto=format&fit=crop",
  p1:     "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1200&q=80&auto=format&fit=crop",
  p2:     "https://images.unsplash.com/photo-1621352452648-c717c4eba35f?w=1200&q=80&auto=format&fit=crop",
  p3:     "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1200&q=80&auto=format&fit=crop",
};

function SvcHero({ title, subtitle, meta }) {
  return (
    <section className="svc-hero" data-screen-label="01 Service Hero">
      <div className="svc-hero-bg" style={{ backgroundImage: `url(${SIMG.hero})` }}/>
      <div className="container svc-hero-inner">
        <div className="breadcrumb">
          <a href="Zakir Enterprise.html">Home</a>
          <span className="sep">/</span>
          <a href="Zakir Enterprise.html#services">Services</a>
          <span className="sep">/</span>
          <span className="crumb-now">{title}</span>
        </div>
        <div className="svc-hero-title-row">
          <div>
            <span className="microlabel on-dark">Construction Service · 04 / 12</span>
            <h1 style={{marginTop: 24}}>{title.split(" ").slice(0, -1).join(" ")} <span className="accent">{title.split(" ").slice(-1)}</span></h1>
          </div>
          <p className="svc-hero-sub">{subtitle}</p>
        </div>
        <div className="svc-hero-meta">
          {meta.map((m, i) => (
            <div key={i}>
              <span className="k">{m.k}</span>
              <span className="v">{m.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SvcSubnav() {
  const [active, setActive] = React.useState("overview");
  const items = [
    { id: "overview", label: "Overview" },
    { id: "scope", label: "Scope of Work" },
    { id: "process", label: "Execution Process" },
    { id: "benefits", label: "Why Choose Us" },
    { id: "capability", label: "Capability" },
    { id: "projects", label: "Related Projects" },
    { id: "faq", label: "FAQ" },
  ];
  return (
    <div className="svc-subnav">
      <div className="container">
        <div className="svc-subnav-inner">
          {items.map(it => (
            <a key={it.id} href={`#${it.id}`} onClick={() => setActive(it.id)}
               className={active === it.id ? "active" : ""}>{it.label}</a>
          ))}
          <div className="subnav-cta">
            <a href="#svc-cta" className="btn btn-dark">Let's Collaborate <Arrow/></a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SvcOverview({ title, lead, body, bullets }) {
  return (
    <section id="overview" className="section-pad" data-screen-label="03 Overview">
      <div className="container">
        <div className="svc-overview-grid">
          <div>
            <span className="num" style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'0.3em',color:'var(--gold)',marginBottom:14,display:'block'}}>SERVICE OVERVIEW / 01</span>
            <h2>{title}</h2>
            <p className="overview-lead">{lead}</p>
          </div>
          <div className="overview-body">
            {body.map((p,i) => <p key={i}>{p}</p>)}
            <ul className="overview-keybullets">
              {bullets.map((b,i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function SvcScope({ items }) {
  return (
    <section id="scope" className="section-pad section-soft" data-screen-label="04 Scope">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">SCOPE OF WORK / 02</span>
            <h2>End-to-end capability under one delivery team.</h2>
          </div>
          <p className="head-right">
            From earliest planning through final handover, we execute every stage in-house
            with dedicated engineers, equipment and site supervision.
          </p>
        </div>
        <div className="scope-grid">
          {items.map((it, i) => (
            <div key={i} className="scope-card">
              <div className="scope-top">
                <div className="scope-icon"><SvcIcon kind={it.icon}/></div>
                <span className="scope-num">{String(i+1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span>
              </div>
              <h4>{it.title}</h4>
              <p>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SvcProcess({ steps }) {
  return (
    <section id="process" className="section-pad section-dark" data-screen-label="05 Process">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num" style={{color:'var(--lime)'}}>EXECUTION PROCESS / 03</span>
            <h2>A disciplined five-stage delivery workflow.</h2>
          </div>
          <p className="head-right" style={{color:'rgba(255,255,255,0.65)'}}>
            Every project we undertake moves through the same structured stages —
            transparent, measurable and built to keep timelines and quality on track.
          </p>
        </div>
        <div className="process-wrap">
          <div className="process-track">
            {steps.map((s, i) => (
              <div key={i} className="process-step">
                <div className="process-dot">{String(i+1).padStart(2,'0')}</div>
                <span className="process-tag">{s.tag}</span>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SvcBenefits({ items }) {
  return (
    <section id="benefits" className="section-pad" data-screen-label="06 Benefits">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">WHY ZAKIR ENTERPRISE / 04</span>
            <h2>Chosen for delivery discipline, not just lowest bid.</h2>
          </div>
          <p className="head-right">
            Public clients, developers and industrial partners return to us because we
            execute on commitment — safely, on time, and to specification.
          </p>
        </div>
        <div className="benefits-grid">
          {items.map((it, i) => (
            <div key={i} className="benefit-card">
              <div className="benefit-top">
                <div className="benefit-icon"><SvcIcon kind={it.icon}/></div>
                <span className="benefit-num">0{i+1}</span>
              </div>
              <h4>{it.title}</h4>
              <p>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SvcMachinery({ items, stat }) {
  return (
    <section id="capability" className="section-pad section-soft" data-screen-label="07 Machinery">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">EXECUTION STRENGTH / 05</span>
            <h2>Equipment, methods &amp; site discipline.</h2>
          </div>
          <p className="head-right">
            We operate our own fleet of construction equipment, backed by trained operators,
            safety systems and quality assurance methods used on every site.
          </p>
        </div>
        <div className="machinery-wrap">
          <div className="machinery-image" style={{ backgroundImage: `url(${SIMG.machine})` }}>
            <div className="machine-badge">Owned Fleet · Trained Operators</div>
            <div className="machine-overlay">
              <div className="big">{stat.big}</div>
              <div className="lbl">{stat.lbl}</div>
            </div>
          </div>
          <div className="machinery-copy">
            <h3>Operational capability built for scale and compliance.</h3>
            <p>
              Our execution strength is grounded in owned equipment, proven construction
              methods and structured site management — supported by independent quality
              checks and full compliance documentation for every delivery.
            </p>
            <div className="machine-list">
              {items.map((it, i) => (
                <div key={i} className="machine-item">
                  <span className="n">0{i+1}</span>
                  <div>
                    <div className="t">{it.t}</div>
                    <div className="d">{it.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SvcRelated({ items }) {
  return (
    <section id="projects" className="section-pad" data-screen-label="08 Related Projects">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">RELATED PROJECTS / 06</span>
            <h2>Recent work in this service line.</h2>
          </div>
          <p className="head-right">
            A selection of recent and ongoing executions under Building Construction — delivered
            across government, commercial and private sectors.
          </p>
        </div>
        <div className="related-grid">
          {items.map((it, i) => (
            <article key={i} className="related-card">
              <div className="rp-img" style={{ backgroundImage: `url(${it.img})` }}/>
              <span className="rp-type">{it.type}</span>
              <div className="rp-body">
                <div className="rp-meta">
                  <span>{it.cat}</span>
                  <span className="dot"></span>
                  <span className="loc">{it.loc}</span>
                </div>
                <h4>{it.title}</h4>
                <p className="rp-line">{it.line}</p>
                <a href="Project Detail.html" className="rp-link">View Project <ArrowUpRight size={12}/></a>
              </div>
            </article>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'center',marginTop:50}}>
          <a href="Projects.html" className="btn btn-outline-dark">View All Projects <Arrow/></a>
        </div>
      </div>
    </section>
  );
}

function SvcFAQ({ items }) {
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" className="section-pad section-soft" data-screen-label="09 FAQ">
      <div className="container">
        <div className="faq-wrap">
          <div className="faq-left">
            <span className="num" style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'0.3em',color:'var(--gold)',marginBottom:14,display:'block'}}>FREQUENTLY ASKED / 07</span>
            <h2>Questions from clients and stakeholders.</h2>
            <p>
              Clear, practical answers to the most common questions we receive from
              government bodies, developers, and private clients before engaging on a build.
            </p>
            <div className="faq-cta-card">
              <h5>Still have a question?</h5>
              <p>Speak with our project team for a detailed discussion on scope, timeline and pricing.</p>
              <a href="#svc-cta" className="btn btn-primary">Contact Project Team <Arrow/></a>
            </div>
          </div>
          <div className="faq-list">
            {items.map((it, i) => (
              <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span style={{display:'flex',alignItems:'center',flex:1}}>
                    <span className="faq-num">Q.0{i+1}</span>
                    <span>{it.q}</span>
                  </span>
                  <span className="faq-icon">{open === i ? "–" : "+"}</span>
                </button>
                <div className="faq-a">
                  <div>
                    <div className="faq-a-inner">{it.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SvcCTA({ service }) {
  return (
    <section id="svc-cta" className="svc-cta" data-screen-label="10 CTA">
      <div className="svc-cta-bg" style={{ backgroundImage: `url(${SIMG.cta})` }}/>
      <div className="container">
        <div className="svc-cta-inner">
          <div>
            <span className="svc-cta-tag">Ready To Build · Nationwide</span>
            <h2>Planning a <span className="accent">{service}</span> project? <span className="italic">Let's deliver it right.</span></h2>
            <p>
              Share your site details, scope and timeline. Our project team will respond with
              a structured quotation and delivery roadmap within two working days.
            </p>
            <div className="svc-cta-btns">
              <a href="#" className="btn btn-primary">Let's Collaborate <Arrow/></a>
              <a href="#" className="btn btn-outline-light">Let's Collaborate <ArrowUpRight/></a>
            </div>
            <div className="svc-cta-tertiary">
              <span>Looking at our work first?</span>
              <a href="Projects.html">View All Projects <Arrow size={12}/></a>
            </div>
          </div>
          <aside className="svc-cta-info">
            <h5>Project Desk</h5>
            <ul>
              <li>
                <span className="k">Direct line</span>
                <span className="v">+8801791026074</span>
              </li>
              <li>
                <span className="k">Email</span>
                <span className="v">projects@zakirenterprise.com.bd</span>
              </li>
              <li>
                <span className="k">Head office</span>
                <span className="v">Banani, Dhaka 1213</span>
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
  );
}

function MobileSticky() {
  return (
    <div className="mobile-sticky-cta">
      <div className="caption">Zakir Enterprise<span>Building Construction</span></div>
      <a href="#svc-cta" className="btn btn-primary">Get Quote <Arrow/></a>
    </div>
  );
}

Object.assign(window, {
  SvcHero, SvcSubnav, SvcOverview, SvcScope, SvcProcess,
  SvcBenefits, SvcMachinery, SvcRelated, SvcFAQ, SvcCTA, MobileSticky
});
