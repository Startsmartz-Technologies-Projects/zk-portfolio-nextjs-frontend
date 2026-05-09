// Let's Collaborate — sections

const { Arrow: LcA, ArrowUpRight: LcAUR, SvcIcon: LcIcon } = window.UI;

const LIMG = {
  hero: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=2200&q=80&auto=format&fit=crop",
};

// ───────── Hero ─────────
function LcHero() {
  return (
    <section className="lc-hero" data-screen-label="01 Hero">
      <div className="lc-hero-bg" style={{ backgroundImage: `url(${LIMG.hero})` }}/>
      <div className="container lc-hero-inner">
        <div className="lc-hero-grid">
          <div>
            <span className="microlabel on-dark">Collaborate · Quote · Build</span>
            <h1>Let's Build Something <span className="accent">Great</span> Together</h1>
            <p className="lc-sub">
              From private developments to government-scale infrastructure, Zakir Enterprise is
              ready to collaborate, quote and execute with confidence across all 64 districts
              of Bangladesh.
            </p>
            <div className="lc-hero-ctas">
              <a href="#form" className="btn btn-primary">Let's Collaborate <LcA/></a>
              <a href="#form" className="btn btn-outline-light">Start Discussion <LcAUR/></a>
              <a href="tel:+8801700000000" className="btn btn-outline-light">Call Now</a>
            </div>
          </div>
          <aside className="lc-hero-rightcard">
            <h5>Project Desk</h5>
            <ul>
              <li><span className="k">Response</span><span className="v">Within 2 working days</span></li>
              <li><span className="k">Languages</span><span className="v">English · বাংলা</span></li>
              <li><span className="k">Coverage</span><span className="v">All 64 districts</span></li>
              <li><span className="k">Desk</span><span className="v">projects@zakirenterprise.com.bd</span></li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ───────── Trust Hook ─────────
function LcTrustHook() {
  const chips = [
    "Nationwide Capability", "Skilled Workforce", "Timely Delivery",
    "Trusted Execution", "Multi-Sector Expertise"
  ];
  return (
    <section className="trusthook" data-screen-label="02 Trust Hook">
      <div className="container">
        <h2>We collaborate with developers, businesses, institutions and government
          stakeholders to deliver quality construction solutions across Bangladesh.</h2>
        <div className="trust-chips">
          {chips.map(c => <span key={c} className="trust-chip">{c}</span>)}
        </div>
      </div>
    </section>
  );
}

// ───────── Intent Grid ─────────
const INTENT_ITEMS = [
  { id: "quote",    icon: "building",   t: "Let's Collaborate",         d: "Priced scope for a defined construction brief." },
  { id: "new",      icon: "concrete",   t: "New Construction Project",  d: "Start a fresh development from concept to delivery." },
  { id: "collab",   icon: "special",    t: "Request Collaboration",     d: "Joint execution on complex or multi-party builds." },
  { id: "gov",      icon: "road",       t: "Government Project",        d: "LGED, RHD, PWD tenders and institutional works." },
  { id: "tender",   icon: "finish",     t: "Bid / Tender Inquiry",      d: "Subcontract partnership for active bid opportunities." },
  { id: "vendor",   icon: "equip",      t: "Vendor / Supplier",         d: "Material, machinery or specialist supply partnership." },
  { id: "sub",      icon: "drain",      t: "Subcontracting",            d: "Trade subcontracting for ongoing Zakir sites." },
  { id: "partner",  icon: "foundation", t: "Partnership Discussion",    d: "Long-term strategic or joint-venture partnership." },
  { id: "general",  icon: "renov",      t: "General Inquiry",           d: "Anything else — we'll route it to the right team." },
];

function LcIntentGrid({ selected, setSelected }) {
  return (
    <section className="section-pad" data-screen-label="03 Intent Grid">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">HOW CAN WE HELP / 01</span>
            <h2>Tell us what you're here for.</h2>
          </div>
          <p className="head-right">
            Pick the intent that best matches your project — we'll route it straight
            to the relevant Zakir Enterprise team and prefill your inquiry form below.
          </p>
        </div>
        <div className="intent-grid">
          {INTENT_ITEMS.map(it => (
            <button
              key={it.id}
              className={`intent-card ${selected === it.id ? "active" : ""}`}
              onClick={() => setSelected(it.id)}
            >
              <div className="intent-icon"><LcIcon kind={it.icon}/></div>
              <h4>{it.t}</h4>
              <p>{it.d}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────── Conversion Section ─────────
const SERVICES = [
  "Building Construction", "Road Works", "Bridge & Culvert Works",
  "Earthwork & Site Development", "Drainage Work", "Structural Concrete Work",
  "Foundation Work", "Renovation & Maintenance", "Finishing Work",
  "Special Work", "Equipment Systems"
];

function LcConversion({ intent, setIntent, prefillService }) {
  const [form, setForm] = React.useState({
    name: "", company: "", phone: "", email: "",
    subject: "", inquiryType: intent || "quote",
    services: prefillService ? [prefillService] : [],
    budget: "", location: "", timeline: "",
    bidName: "", message: ""
  });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (intent) setForm(f => ({ ...f, inquiryType: intent }));
  }, [intent]);
  React.useEffect(() => {
    if (prefillService && !form.services.includes(prefillService))
      setForm(f => ({ ...f, services: [...f.services, prefillService] }));
  }, [prefillService]);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };
  const toggleSvc = (s) => {
    setForm(f => f.services.includes(s)
      ? { ...f, services: f.services.filter(x => x !== s) }
      : { ...f, services: [...f.services, s] });
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = "Full name required";
    if (!form.phone.trim()) err.phone = "Phone number required";
    if (!form.email.trim()) err.email = "Email required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = "Enter a valid email";
    if (!form.subject.trim()) err.subject = "Subject required";
    if (!form.inquiryType) err.inquiryType = "Select an inquiry type";
    if (!form.message.trim()) err.message = "Message required";
    setErrors(err);
    if (Object.keys(err).length === 0) setSubmitted(true);
  };

  const intentLabel = (id) => (INTENT_ITEMS.find(i => i.id === id) || {}).t || "";

  return (
    <section id="form" className="section-pad section-soft" data-screen-label="04 Conversion">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="num">START A CONVERSATION / 02</span>
            <h2>Share your project. We'll take it from there.</h2>
          </div>
          <p className="head-right">
            Tell us about your site, scope and timeline. Our project team responds
            within two working days with a structured next step.
          </p>
        </div>
        <div className="lc-conv-grid">
          {/* LEFT SIDE */}
          <aside className="lc-side">
            <div className="side-card">
              <h5>Contact</h5>
              <ul>
                <li><strong>Phone</strong>+8801791026074</li>
                <li><strong>Email</strong>projects@zakirenterprise.com.bd</li>
                <li><strong>Head Office</strong>House 42, Road 11, Banani,<br/>Dhaka 1213, Bangladesh</li>
                <li><strong>Business Hours</strong>Sun — Thu · 9:00 — 18:00 (GMT+6)</li>
              </ul>
            </div>
            <div className="side-card quick">
              <h5>Quick Actions</h5>
              <a href="https://wa.me/8801700000000"><span>WhatsApp Team</span><LcA/></a>
              <a href="tel:+8801700000000"><span>Direct Call</span><LcA/></a>
              <a href="mailto:projects@zakirenterprise.com.bd"><span>Email Desk</span><LcA/></a>
            </div>
            <div className="side-card dark">
              <h5>Why Collaborate</h5>
              <ul className="dots">
                <li>Proven capability — decade of delivery</li>
                <li>Reliable project team & supervision</li>
                <li>Transparent, milestone-based reporting</li>
                <li>Nationwide execution, every district</li>
                <li>Safety & quality assurance culture</li>
              </ul>
              <div className="stats-row">
                <div className="stat-mini"><div className="b">50+</div><div className="l">Projects</div></div>
                <div className="stat-mini"><div className="b">11+</div><div className="l">Service Lines</div></div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE */}
          <div>
            {!submitted ? (
            <form className="lc-form" onSubmit={submit} noValidate>
              <h3>Collaboration Request</h3>
              <p className="form-lead">All fields marked * are required. Files up to 25MB welcome.</p>
              <div className="form-grid">
                <div className={`field ${errors.name ? "has-error" : ""}`}>
                  <label>Full Name<span className="req">*</span></label>
                  <input type="text" placeholder="Your full name" value={form.name} onChange={e=>update("name",e.target.value)}/>
                  {errors.name && <div className="err">{errors.name}</div>}
                </div>
                <div className="field">
                  <label>Company Name</label>
                  <input type="text" placeholder="Company / organization" value={form.company} onChange={e=>update("company",e.target.value)}/>
                </div>
                <div className={`field ${errors.phone ? "has-error" : ""}`}>
                  <label>Phone Number<span className="req">*</span></label>
                  <input type="tel" placeholder="+880 1XXX XXXXXX" value={form.phone} onChange={e=>update("phone",e.target.value)}/>
                  {errors.phone && <div className="err">{errors.phone}</div>}
                </div>
                <div className={`field ${errors.email ? "has-error" : ""}`}>
                  <label>Email<span className="req">*</span></label>
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={e=>update("email",e.target.value)}/>
                  {errors.email && <div className="err">{errors.email}</div>}
                </div>
                <div className={`field full ${errors.subject ? "has-error" : ""}`}>
                  <label>Subject<span className="req">*</span></label>
                  <input type="text" placeholder="e.g. 10-storey commercial tower — Banani" value={form.subject} onChange={e=>update("subject",e.target.value)}/>
                  {errors.subject && <div className="err">{errors.subject}</div>}
                </div>
                <div className={`field ${errors.inquiryType ? "has-error" : ""}`}>
                  <label>Inquiry Type<span className="req">*</span></label>
                  <select value={form.inquiryType} onChange={e=>{update("inquiryType",e.target.value); setIntent(e.target.value);}}>
                    <option value="">Select type…</option>
                    {INTENT_ITEMS.map(it => <option key={it.id} value={it.id}>{it.t}</option>)}
                  </select>
                  {errors.inquiryType && <div className="err">{errors.inquiryType}</div>}
                </div>
                <div className="field">
                  <label>Budget Range</label>
                  <select value={form.budget} onChange={e=>update("budget",e.target.value)}>
                    <option value="">Select range…</option>
                    <option>Under BDT 1 Cr</option>
                    <option>BDT 1 — 5 Cr</option>
                    <option>BDT 5 — 20 Cr</option>
                    <option>BDT 20 — 50 Cr</option>
                    <option>BDT 50 Cr +</option>
                    <option>To be discussed</option>
                  </select>
                </div>
                <div className="field">
                  <label>Project Location</label>
                  <input type="text" placeholder="City / district" value={form.location} onChange={e=>update("location",e.target.value)}/>
                </div>
                <div className="field">
                  <label>Expected Timeline</label>
                  <select value={form.timeline} onChange={e=>update("timeline",e.target.value)}>
                    <option value="">Select timeline…</option>
                    <option>Immediate ({"<"} 1 month)</option>
                    <option>1 — 3 months</option>
                    <option>3 — 6 months</option>
                    <option>6 — 12 months</option>
                    <option>12 months +</option>
                    <option>Flexible / planning stage</option>
                  </select>
                </div>
                {form.inquiryType === "tender" && (
                  <div className="field full">
                    <label>Bid / Project Name</label>
                    <input type="text" placeholder="Tender reference or project name" value={form.bidName} onChange={e=>update("bidName",e.target.value)}/>
                  </div>
                )}
                <div className="field full">
                  <label>Interested Services</label>
                  <div className="svc-chips">
                    {SERVICES.map(s => (
                      <button type="button" key={s}
                        className={`svc-chip ${form.services.includes(s) ? "active" : ""}`}
                        onClick={() => toggleSvc(s)}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className={`field full ${errors.message ? "has-error" : ""}`}>
                  <label>Project Brief / Message<span className="req">*</span></label>
                  <textarea placeholder="Describe your scope, site conditions, key constraints and any deadlines…" value={form.message} onChange={e=>update("message",e.target.value)}/>
                  {errors.message && <div className="err">{errors.message}</div>}
                </div>
                <div className="field full">
                  <label>Attachments</label>
                  <label className="attach-field">
                    <div className="attach-ic">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                        <path d="M21 12.5L12.5 21 a6 6 0 0 1-8.5-8.5L13 3.5a4 4 0 0 1 5.7 5.7L10 18a2 2 0 0 1-2.8-2.8L15 7"/>
                      </svg>
                    </div>
                    <div>
                      <div className="attach-t">Add drawings, BoQ, RFP or site images</div>
                      <div className="attach-s">PDF · DWG · XLS · JPG · PNG · up to 25MB</div>
                    </div>
                    <input type="file" style={{display:"none"}} multiple/>
                  </label>
                </div>
              </div>
              <div className="submit-row">
                <button type="submit" className="btn btn-primary">Submit Collaboration Request <LcA/></button>
                <a href="https://wa.me/8801700000000" className="btn btn-outline-dark">Talk on WhatsApp <LcAUR/></a>
                <div className="submit-note">By submitting, you agree to be contacted by the Zakir Enterprise project team.</div>
              </div>
            </form>
            ) : (
              <div className="success-panel">
                <div className="success-icon">✓</div>
                <h3>Thank You — We've Got It.</h3>
                <p>
                  Our business team has received your {intentLabel(form.inquiryType).toLowerCase()} and
                  will contact you on <strong>{form.phone}</strong> or <strong>{form.email}</strong> within
                  two working days with a structured next step.
                </p>
                <div className="success-meta">
                  <div>Reference<strong>ZE-{Math.floor(100000 + Math.random()*899999)}</strong></div>
                  <div>Desk<strong>Project Team · Dhaka</strong></div>
                  <div>Response<strong>Within 2 days</strong></div>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
                  <a href="Projects.html" className="btn btn-outline-dark">View Our Projects <LcA/></a>
                  <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Submit Another <LcA/></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────── Map ─────────
function LcMap() {
  return (
    <section data-screen-label="05 Office Map">
      <div className="map-wrap">
        <div className="map-canvas">
          <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="gr" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0H0v60" fill="none" stroke="rgba(255,255,255,0.04)"/>
              </pattern>
            </defs>
            <rect width="1200" height="520" fill="url(#gr)"/>
            {/* abstract roads */}
            <path d="M0 300 C200 290 400 340 600 310 S 1000 250 1200 280" stroke="rgba(180,222,53,0.18)" strokeWidth="2" fill="none"/>
            <path d="M0 360 C250 380 500 330 750 380 S 1100 360 1200 340" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none"/>
            <path d="M700 0 L720 520" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none"/>
            <path d="M300 0 L320 520" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div className="map-pin main" style={{ right: "38%", top: "48%" }}/>
        <div className="map-pin" style={{ right: "55%", top: "30%" }}/>
        <div className="map-pin" style={{ right: "22%", top: "62%" }}/>
        <div className="map-pin" style={{ right: "66%", top: "70%" }}/>
        <div className="map-info">
          <h5>Head Office · Dhaka</h5>
          <h3>Zakir Enterprise Ltd.</h3>
          <p>House 42, Road 11, Banani,<br/>Dhaka 1213, Bangladesh</p>
          <p><strong>Phone</strong>+8801791026074</p>
          <p><strong>Email</strong>projects@zakirenterprise.com.bd</p>
          <div style={{marginTop:20,display:"flex",gap:10,flexWrap:"wrap"}}>
            <a href="#" className="btn btn-primary" style={{padding:"12px 18px",fontSize:11}}>Get Directions <LcA size={12}/></a>
            <a href="tel:+8801700000000" className="btn btn-outline-dark" style={{padding:"12px 18px",fontSize:11}}>Call Office</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────── Final CTA ─────────
function LcFinalCTA() {
  return (
    <section className="final-cta" data-screen-label="06 Final CTA">
      <div className="container">
        <div className="final-cta-grid">
          <div>
            <span className="microlabel on-dark">Need Immediate Help</span>
            <h2 style={{marginTop:20}}>Need <span className="accent">immediate</span> assistance on site?</h2>
            <p>
              Our project desk is staffed across business hours — for urgent coordination,
              tender deadlines or ongoing site issues, reach us directly.
            </p>
            <div className="final-cta-btns">
              <a href="tel:+8801700000000" className="btn btn-primary">Call Now <LcA/></a>
              <a href="https://wa.me/8801700000000" className="btn btn-outline-light">WhatsApp Us</a>
              <a href="#form" className="btn btn-outline-light">Send Proposal</a>
            </div>
          </div>
          <div className="final-cta-lines">
            <a href="tel:+8801700000000" className="fc-line">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.5 2L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.5c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2.1z"/>
                </svg>
              </div>
              <div><span className="k">Direct Line</span><span className="v">+8801791026074</span></div>
              <span className="chev"><LcA size={14}/></span>
            </a>
            <a href="https://wa.me/8801700000000" className="fc-line">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.5 11.5 0 0 0 2.1 17.2L1 22l4.9-1.1A11.5 11.5 0 1 0 20.5 3.5zm-8.4 17.5a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-2.9.7.6-2.8-.2-.3a9.5 9.5 0 1 1 7.6 3.9zm5.2-6.6c-.3-.1-1.8-.8-2-1s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a7.8 7.8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.1-.3 0-.4.1-.6l.4-.4.3-.5c.1-.2 0-.3 0-.5s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.5 0-.7.3a3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1 2.7c.2.3 1.6 2.5 3.9 3.5a13 13 0 0 0 1.3.5 3.1 3.1 0 0 0 1.4.1 2.4 2.4 0 0 0 1.5-1 1.9 1.9 0 0 0 .1-1c0-.2-.2-.2-.5-.4z"/></svg>
              </div>
              <div><span className="k">WhatsApp Desk</span><span className="v">Chat with project team</span></div>
              <span className="chev"><LcA size={14}/></span>
            </a>
            <a href="mailto:projects@zakirenterprise.com.bd" className="fc-line">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <rect x="3" y="5" width="18" height="14"/>
                  <polyline points="3,6 12,13 21,6"/>
                </svg>
              </div>
              <div><span className="k">Email Desk</span><span className="v">projects@zakirenterprise.com.bd</span></div>
              <span className="chev"><LcA size={14}/></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LcHero, LcTrustHook, LcIntentGrid, LcConversion, LcMap, LcFinalCTA });
