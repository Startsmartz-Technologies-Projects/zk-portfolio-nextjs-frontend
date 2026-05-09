// Blog Detail — article body data + sections

const { Arrow: BdA } = window.UI;

// ───────── Article Bodies (rich content per blog id) ─────────
// Shape: { lead, sections: [{ id, heading, level, blocks: [...]}], tags }
// block kinds: "p" | "ul" | "quote" | "h3" | "stats" | "img"

const BLOG_BODIES = {
  "quality-foundation-work": {
    lead: "Nobody walks through a finished building and compliments the foundation. It's buried. It's invisible. And yet every crack, every settlement, every lawsuit ten years later traces back to decisions made before a single wall went up. This is an engineer's case for spending more — and thinking harder — below ground level.",
    sections: [
      { id: "why-quality-foundation-work-matters", heading: "Why Quality Foundation Work Matters", level: 2, blocks: [
        { kind: "p", text: "In Bangladesh's soft alluvial soils, the foundation is not a line item — it is the project. We have walked onto inherited sites where thirty percent of the budget had already been spent on cosmetic finishes while the sub-structure sat on under-designed pad footings. The math never works." },
        { kind: "p", text: "Good foundation work pays for itself three ways: fewer remedials during construction, lower insurance exposure on handover, and — most importantly — a building that behaves predictably for its full design life." },
        { kind: "stats", items: [
          { big: "42%", lbl: "of site disputes trace to foundation issues" },
          { big: "3.2×", lbl: "remedial cost vs. original scope" },
          { big: "< 2%", lbl: "foundation-related claims on ZE projects" },
        ]},
      ]},
      { id: "key-risks-in-poor-site-preparation", heading: "Key Risks in Poor Site Preparation", level: 2, blocks: [
        { kind: "p", text: "Site preparation is where most foundation projects quietly go wrong. The risks are rarely dramatic. They show up as small compromises that compound." },
        { kind: "ul", items: [
          "<strong>Inadequate soil investigation.</strong> One borehole per plot is not investigation — it is a box-ticking exercise. We specify minimum three boreholes on any structure over four floors, with standard penetration tests at every 1.5 metres.",
          "<strong>Incorrect bearing capacity assumptions.</strong> Designers pulling figures from neighbouring projects without verifying local stratigraphy is the single most common root cause of settlement cracks.",
          "<strong>Poor dewatering discipline.</strong> Pumping water out of an excavation is not dewatering. Maintaining a controlled drawdown with piezometer monitoring is.",
          "<strong>Rushed pile integrity testing.</strong> Low-strain integrity tests are cheap. Skipping them to stay on schedule is the most expensive shortcut available.",
        ]},
        { kind: "h3", heading: "A real example" },
        { kind: "p", text: "On a commercial project in Narayanganj last year, a contractor we later replaced had cast pile caps before receiving the pile integrity reports. When the reports came back, three piles showed necking at 8 metres depth. The remedial work — jet grouting plus additional micropiles — cost BDT 2.4 crore. The integrity tests would have cost BDT 3 lakh." },
      ]},
      { id: "how-zakir-enterprise-ensures-delivery", heading: "How Zakir Enterprise Ensures Delivery", level: 2, blocks: [
        { kind: "p", text: "Our foundation protocol is not proprietary. It is standard engineering, executed with discipline." },
        { kind: "h3", heading: "Design stage" },
        { kind: "ul", items: [
          "<strong>Independent geotechnical review</strong> by a second consultant on every structure over 8 floors or BDT 50 crore.",
          "<strong>Settlement modelling</strong> for the full structure, not only the worst-case footing.",
          "<strong>Buildability check</strong> with the site team before drawings are released — avoids the late redesigns that burn schedule.",
        ]},
        { kind: "h3", heading: "Execution stage" },
        { kind: "quote", text: "If you cannot trace every pour back to a soil test, a rebar inspection, a concrete cube and a signed pour card — you do not have a foundation. You have a gamble.", cite: "Engr. Mahmudul Hasan — Head of Structural Engineering" },
        { kind: "ul", items: [
          "<strong>100% rebar inspection</strong> before every foundation pour. Non-negotiable.",
          "<strong>Concrete cube strength testing</strong> at 7, 14 and 28 days with results tracked in a live project log visible to the client.",
          "<strong>Pile integrity testing</strong> on every pile, not a sample, on any project where we are the principal contractor.",
        ]},
        { kind: "img", url: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?w=1600&q=80&auto=format&fit=crop", cap: "Foundation rebar check before a mat pour on an active ZE site." },
        { kind: "p", text: "None of this is heroic. It is the minimum an industrial client should expect. The fact that it is not the norm in the market is what keeps our repeat-client rate where it is." },
      ]},
      { id: "what-to-ask-your-contractor", heading: "What to Ask Your Contractor", level: 2, blocks: [
        { kind: "p", text: "If you are commissioning a building, three questions will tell you most of what you need to know about how seriously a contractor takes foundation work:" },
        { kind: "ul", items: [
          "Can I see the last three pile integrity reports you issued?",
          "What is your standard concrete cube testing schedule, and who retains the results?",
          "Who signs off a foundation pour on your projects, and what is the escalation path if they refuse?",
        ]},
        { kind: "p", text: "A contractor who cannot answer these in under two minutes is a contractor who will blame someone else when a crack appears in year three. Ask. Then decide." },
      ]},
    ],
    tags: ["Foundation", "Quality Control", "Structural Engineering", "Site Preparation", "QA/QC"],
  },
};

// Default body for articles without custom content
function defaultBody(article) {
  return {
    lead: article.excerpt + " The full article below walks through the engineering, the field conditions and the delivery discipline we apply on projects of this type.",
    sections: [
      { id: "context-and-why-it-matters", heading: "Context & Why It Matters", level: 2, blocks: [
        { kind: "p", text: "This piece draws on field data from Zakir Enterprise's active project portfolio. The goal is not advocacy — it is a working engineer's view of what the discipline requires and where the industry typically cuts corners." },
        { kind: "p", text: "Readers should come away with a clearer mental model of the decision points, the tradeoffs, and the cost of getting them wrong." },
        { kind: "stats", items: [
          { big: "12+", lbl: "Active projects informing this view" },
          { big: "6", lbl: "Divisions of field evidence" },
          { big: "10 yrs", lbl: "Delivery track record" },
        ]},
      ]},
      { id: "the-engineering-view", heading: "The Engineering View", level: 2, blocks: [
        { kind: "p", text: "Every project under this category shares a common spine of engineering decisions. The specifics vary — soil, scale, schedule — but the logic we apply is consistent." },
        { kind: "ul", items: [
          "<strong>Start from the ground conditions.</strong> Every shortcut taken during investigation compounds downstream.",
          "<strong>Design for the worst realistic case,</strong> not the average. Bangladesh's climate does not respect averages.",
          "<strong>Sequence the works to isolate risk.</strong> Parallel paths are tempting; they are also how small problems become project-wide delays.",
          "<strong>Test early, test often, test publicly.</strong> A result that arrives after a pour is not a test — it is a post-mortem.",
        ]},
        { kind: "h3", heading: "A field-level example" },
        { kind: "p", text: "On a recent package, a change in site water table forced a complete rework of our dewatering strategy mid-execution. Because the monitoring regime caught the shift two weeks before it would have affected the pour, the cost impact was absorbed inside the float. Without that monitoring the project would have lost a month." },
      ]},
      { id: "how-we-deliver", heading: "How We Deliver", level: 2, blocks: [
        { kind: "p", text: "Delivery on a Zakir Enterprise project follows a three-gate discipline: design review, execution gate, handover gate. Each gate is owned by a named engineer, not a committee." },
        { kind: "quote", text: "Discipline is boring. The things discipline prevents are expensive. The trade is always worth it.", cite: "Engineering Leadership · Zakir Enterprise" },
        { kind: "img", url: article.image, cap: "Active site conditions that shape the methodology described above." },
        { kind: "p", text: "The result is a delivery record that speaks for itself — and a client base that returns for the second and third project because the first one behaved the way the drawings said it would." },
      ]},
      { id: "what-this-means-for-your-project", heading: "What This Means for Your Project", level: 2, blocks: [
        { kind: "p", text: "If you are scoping a project in this category, three things are worth pressing your contractor on early:" },
        { kind: "ul", items: [
          "The depth of their site investigation regime — not the number of pages, the number of decisions it forces.",
          "The named individuals who sign off at each project gate, and what happens if they refuse.",
          "The test data from the last three comparable projects they completed. If it is not available in under a week, it is not a discipline.",
        ]},
        { kind: "p", text: "These are not hard questions. They are the questions that separate a contractor from a subcontractor-with-a-letterhead." },
      ]},
    ],
    tags: article.tags || [article.category, "Engineering", "Delivery"],
  };
}

window.getBlogBody = (article) => BLOG_BODIES[article.id] || defaultBody(article);

// ───────── Icons ─────────
const LnIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.03-1.85-3.03-1.85 0-2.13 1.44-2.13 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.22 0z"/></svg>;
const FbIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.07"/></svg>;
const XIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const ClockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;
const CalIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const UserIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

// ───────── Hero ─────────
function BdHero({ article }) {
  const [copied, setCopied] = React.useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const copyLink = () => {
    try { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return (
    <section className="bd-hero" data-screen-label="01 Article Hero">
      <div className="bd-hero-bg" style={{ backgroundImage: `url(${article.image})` }}/>
      <div className="bd-hero-inner">
        <div className="bg-crumbs" style={{marginBottom:28}}>
          <a href="Zakir Enterprise.html">Home</a>
          <span className="sep">/</span>
          <a href="Blogs.html">Blogs</a>
          <span className="sep">/</span>
          <span className="current">Article</span>
        </div>
        <div className="bd-header-meta">
          <span className="bd-pill">{article.category}</span>
          <span className="bd-meta-item"><CalIcon/> {article.date}</span>
          <span className="bd-meta-item"><ClockIcon/> {article.readTime}</span>
          <span className="bd-meta-item"><UserIcon/> {article.author}</span>
        </div>
        <h1>{article.title}</h1>
        <div className="bd-hero-author">
          <div className="bd-author-block">
            <div className="bd-author-avatar">{window.blogInitials(article.author)}</div>
            <div className="bd-author-info">
              <div className="name">{article.author}</div>
              <div className="role">{article.authorRole}</div>
            </div>
          </div>
          <div className="bd-share-row">
            <button className="bd-share-inline-btn" title="Share on LinkedIn" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,'_blank')}><LnIcon/></button>
            <button className="bd-share-inline-btn" title="Share on Facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank')}><FbIcon/></button>
            <button className="bd-share-inline-btn" title="Share on X" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`,'_blank')}><XIcon/></button>
            <button className="bd-share-inline-btn" title="Copy link" onClick={copyLink} style={copied ? {background:'var(--lime2)',color:'var(--forest)',borderColor:'var(--lime2)'}:{}}>
              <LinkIcon/>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────── Body renderer ─────────
function BdBlocks({ blocks }) {
  return <>{blocks.map((b, i) => {
    if (b.kind === "p") return <p key={i}>{b.text}</p>;
    if (b.kind === "h3") return <h3 key={i}>{b.heading}</h3>;
    if (b.kind === "ul") return <ul key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{__html: it}}/>)}</ul>;
    if (b.kind === "quote") return (
      <div key={i} className="bd-pullquote">
        <blockquote>{b.text}</blockquote>
        {b.cite && <cite>— {b.cite}</cite>}
      </div>
    );
    if (b.kind === "stats") return (
      <div key={i} className="bd-data-card">
        {b.items.map((s, j) => <div key={j} className="stat"><div className="big">{s.big}</div><div className="lbl">{s.lbl}</div></div>)}
      </div>
    );
    if (b.kind === "img") return (
      <div key={i} className="bd-inline-img">
        <div className="frame" style={{backgroundImage:`url(${b.url})`}}/>
        {b.cap && <div className="cap">{b.cap}</div>}
      </div>
    );
    return null;
  })}</>;
}

// ───────── Article Body + Sidebar ─────────
function BdArticle({ article, body, related }) {
  const [activeId, setActiveId] = React.useState(body.sections[0]?.id);
  const [copied, setCopied] = React.useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  // Scroll-spy TOC
  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
    }, { rootMargin: "-120px 0px -70% 0px" });
    body.sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [body.sections]);

  const copyLink = () => {
    try { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <section className="bd-article" data-screen-label="02 Article Body">
      <div className="bd-article-inner">
        <div className="bd-body-wrap">
          <div className="bd-hero-image" style={{backgroundImage:`url(${article.image})`}}/>
          <div className="bd-body">
            <p className="lead">{body.lead}</p>
            {body.sections.map(s => (
              <section key={s.id} id={s.id}>
                <h2>{s.heading}</h2>
                <BdBlocks blocks={s.blocks}/>
              </section>
            ))}
            <div className="bd-tags">
              <span className="lbl">Tags</span>
              {body.tags.map(t => <a key={t} href={`Blogs.html?q=${encodeURIComponent(t)}`} className="bd-tag">{t}</a>)}
            </div>
            <div className="bd-article-actions">
              <span className="share-label">Share this article</span>
              <div className="bd-share-row">
                <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,'_blank')}><LnIcon/></button>
                <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank')}><FbIcon/></button>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`,'_blank')}><XIcon/></button>
                <button className={copied ? "copied" : ""} onClick={copyLink}><LinkIcon/></button>
              </div>
            </div>
          </div>
        </div>

        <aside className="bd-sidebar">
          {/* Author card */}
          <div className="bd-card bd-author-card">
            <div className="bd-card-label">Written by</div>
            <div className="bd-author-card-head">
              <div className="bd-author-card-avatar">{window.blogInitials(article.author)}</div>
              <div>
                <div className="bd-author-card-name">{article.author}</div>
                <div className="bd-author-card-role">{article.authorRole}</div>
              </div>
            </div>
            <p className="bd-author-card-bio">
              Writing from Zakir Enterprise's live project portfolio across Bangladesh. Contact the desk for project-specific technical consultation.
            </p>
            <a href="Let's Collaborate.html" className="btn btn-primary">Contact Author <BdA/></a>
          </div>

          {/* Quick contact */}
          <div className="bd-card bd-contact-card">
            <div className="bd-card-label">Project Desk</div>
            <h4>Need similar project support?</h4>
            <p>Discuss scope, timeline and budget with our engineering team. Structured response within two working days.</p>
            <a href="Let's Collaborate.html" className="btn btn-dark">Contact Us</a>
          </div>

          {/* TOC */}
          <div className="bd-card bd-toc">
            <div className="bd-card-label">On this page</div>
            <ul>
              {body.sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`}
                     className={activeId === s.id ? "active" : ""}
                     onClick={(e) => { e.preventDefault(); document.getElementById(s.id).scrollIntoView({behavior:'smooth', block:'start'}); }}>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Services */}
          <div className="bd-card bd-services">
            <div className="bd-card-label">Related Services</div>
            <ul>
              <li><a href="Service Details.html">Building Construction</a></li>
              <li><a href="Service Details.html">Earthwork & Foundation</a></li>
              <li><a href="Service Details.html">Road Works & Highways</a></li>
              <li><a href="Service Details.html">Bridge Construction</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ───────── Mid CTA ─────────
function BdMidCTA() {
  return (
    <section className="bd-mid-cta" data-screen-label="03 Mid CTA">
      <div className="bd-mid-cta-inner">
        <div>
          <h3>Planning a construction project?<br/><span className="accent">Let's build it right.</span></h3>
          <p>Skip the back-and-forth. Share your scope, site, and timeline — our project desk will come back with a clear next step.</p>
        </div>
        <div className="btn-row">
          <a href="Let's Collaborate.html" className="btn btn-primary">Get Consultation <BdA/></a>
          <a href="tel:+8801700000000" className="btn btn-outline-light">Call Now</a>
        </div>
      </div>
    </section>
  );
}

// ───────── Related ─────────
function BdRelated({ items }) {
  return (
    <section className="bd-related" data-screen-label="04 Related">
      <div className="container">
        <div className="bd-related-head">
          <div>
            <span className="microlabel">Keep Reading</span>
            <h2>Related articles.</h2>
          </div>
          <a href="Blogs.html" className="btn btn-outline-dark">View All Articles <BdA/></a>
        </div>
        <div className="bd-related-grid">
          {items.map(it => <window.BlogCard key={it.id} item={it}/>)}
        </div>
      </div>
    </section>
  );
}

// ───────── Final CTA ─────────
function BdFinalCTA() {
  return (
    <section className="bd-final-cta" data-screen-label="05 Final CTA">
      <div className="bd-final-cta-bg" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=2000&q=80&auto=format&fit=crop)` }}/>
      <div className="container">
        <div className="bd-final-cta-grid">
          <div>
            <span className="microlabel on-dark">Partner With Us</span>
            <h2>Trusted construction partner across <span className="accent">Bangladesh.</span></h2>
          </div>
          <div className="bd-final-cta-right">
            <p>From tender to handover, Zakir Enterprise delivers infrastructure that performs for its full design life. Ten years, 100+ projects, zero foundation claims.</p>
            <div className="bd-final-cta-btns">
              <a href="Let's Collaborate.html" className="btn btn-primary">Let's Collaborate <BdA/></a>
              <a href="Zakir Enterprise.html#projects" className="btn btn-outline-light">Explore Projects</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { BdHero, BdArticle, BdMidCTA, BdRelated, BdFinalCTA });
