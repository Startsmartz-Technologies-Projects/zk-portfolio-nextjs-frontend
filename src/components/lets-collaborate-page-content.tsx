"use client";

import * as React from "react";
import { Arrow, ArrowUpRight, SvcIcon } from "./site-ui";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=2200&q=80&auto=format&fit=crop";

const INTENT_ITEMS = [
  { id: "quote", icon: "building", title: "Let's Collaborate", description: "Priced scope for a defined construction brief." },
  { id: "new", icon: "concrete", title: "New Construction Project", description: "Start a fresh development from concept to delivery." },
  { id: "collab", icon: "special", title: "Request Collaboration", description: "Joint execution on complex or multi-party builds." },
  { id: "gov", icon: "road", title: "Government Project", description: "LGED, RHD, PWD tenders and institutional works." },
  { id: "tender", icon: "finish", title: "Bid / Tender Inquiry", description: "Subcontract partnership for active bid opportunities." },
  { id: "vendor", icon: "equip", title: "Vendor / Supplier", description: "Material, machinery or specialist supply partnership." },
  { id: "sub", icon: "drain", title: "Subcontracting", description: "Trade subcontracting for ongoing Zakir sites." },
  { id: "partner", icon: "foundation", title: "Partnership Discussion", description: "Long-term strategic or joint-venture partnership." },
  { id: "general", icon: "renov", title: "General Inquiry", description: "Anything else - we will route it to the right team." },
] as const;

const SERVICE_ITEMS = [
  "Building Construction",
  "Road Works",
  "Bridge & Culvert Works",
  "Earthwork & Site Development",
  "Drainage Work",
  "Structural Concrete Work",
  "Foundation Work",
  "Renovation & Maintenance",
  "Finishing Work",
  "Special Work",
  "Equipment Systems",
] as const;

type InquiryType = (typeof INTENT_ITEMS)[number]["id"];

type FormState = {
  name: string;
  company: string;
  phone: string;
  email: string;
  subject: string;
  inquiryType: InquiryType | "";
  services: string[];
  budget: string;
  location: string;
  timeline: string;
  bidName: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  company: "",
  phone: "",
  email: "",
  subject: "",
  inquiryType: "quote",
  services: [],
  budget: "",
  location: "",
  timeline: "",
  bidName: "",
  message: "",
};

export function LetsCollaboratePageContent() {
  const [intent, setIntent] = React.useState<InquiryType | "">("");
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [referenceNo, setReferenceNo] = React.useState("");

  React.useEffect(() => {
    if (!intent) return;
    setForm((prev) => ({ ...prev, inquiryType: intent }));
  }, [intent]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((item) => item !== service)
        : [...prev.services, service],
    }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Full name required";
    if (!form.phone.trim()) nextErrors.phone = "Phone number required";
    if (!form.email.trim()) nextErrors.email = "Email required";
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) nextErrors.email = "Enter a valid email";
    if (!form.subject.trim()) nextErrors.subject = "Subject required";
    if (!form.inquiryType) nextErrors.inquiryType = "Select an inquiry type";
    if (!form.message.trim()) nextErrors.message = "Message required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitted(true);
    setReferenceNo(`ZE-${Math.floor(100000 + Math.random() * 899999)}`);
  };

  const intentLabel = INTENT_ITEMS.find((item) => item.id === form.inquiryType)?.title ?? "inquiry";

  return (
    <>
      <section className="lc-hero">
        <div className="lc-hero-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="container lc-hero-inner">
          <div className="lc-hero-grid">
            <div>
              <span className="microlabel on-dark">Collaborate - Quote - Build</span>
              <h1>
                Let&apos;s Build Something <span className="accent">Great</span> Together
              </h1>
              <p className="lc-sub">
                From private developments to government-scale infrastructure, Zakir Enterprise is ready to collaborate, quote and execute with confidence across all 64 districts of Bangladesh.
              </p>
              <div className="lc-hero-ctas">
                <a href="#form" className="btn btn-primary">
                  Let's Collaborate <Arrow />
                </a>
                {/* <a href="#form" className="btn btn-outline-light">
                  Start Discussion <ArrowUpRight />
                </a> */}
                <a href="tel:+8801700000000" className="btn btn-outline-light">
                  Call Now
                </a>
              </div>
            </div>
            <aside className="lc-hero-rightcard">
              <h5>Project Desk</h5>
              <ul>
                <li>
                  <span className="k">Response</span>
                  <span className="v">Within 2 working days</span>
                </li>
                <li>
                  <span className="k">Languages</span>
                  <span className="v">English - Bangla</span>
                </li>
                <li>
                  <span className="k">Coverage</span>
                  <span className="v">All 64 districts</span>
                </li>
                <li>
                  <span className="k">Desk</span>
                  <span className="v">zakirenterprise307@gmail.com</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="trusthook">
        <div className="container">
          <h2>We collaborate with developers, businesses, institutions and government stakeholders to deliver quality construction solutions across Bangladesh.</h2>
          <div className="trust-chips">
            {["Nationwide Capability", "Skilled Workforce", "Timely Delivery", "Trusted Execution", "Multi-Sector Expertise"].map((chip) => (
              <span key={chip} className="trust-chip">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">HOW CAN WE HELP / 01</span>
              <h2>Tell us what you&apos;re here for.</h2>
            </div>
            <p className="head-right">Pick the intent that best matches your project - we will route it straight to the relevant Zakir Enterprise team and prefill your inquiry form below.</p>
          </div>
          <div className="intent-grid">
            {INTENT_ITEMS.map((item) => (
              <button key={item.id} className={`intent-card ${intent === item.id ? "active" : ""}`} onClick={() => setIntent(item.id)}>
                <div className="intent-icon">
                  <SvcIcon kind={item.icon} />
                </div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="form" className="section-pad section-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">START A CONVERSATION / 02</span>
              <h2>Share your project. We&apos;ll take it from there.</h2>
            </div>
            <p className="head-right">Tell us about your site, scope and timeline. Our project team responds within two working days with a structured next step.</p>
          </div>

          <div className="lc-conv-grid">
            <aside className="lc-side">
              <div className="side-card">
                <h5>Contact</h5>
                <ul>
                  <li>
                    <strong>Phone</strong>+8801791026074
                  </li>
                  <li>
                    <strong>Email</strong>zakirenterprise307@gmail.com
                  </li>
                  <li>
                    <strong>Head Office</strong>House 42, Road 11, Banani,
                    <br />
                    Dhaka 1213, Bangladesh
                  </li>
                  <li>
                    <strong>Business Hours</strong>Sun - Thu, 9:00 - 18:00 (GMT+6)
                  </li>
                </ul>
              </div>

              <div className="side-card quick">
                <h5>Quick Actions</h5>
                <a href="https://wa.me/01791026074">
                  <span>WhatsApp Team</span>
                  <Arrow />
                </a>
                <a href="tel:+8801791026074">
                  <span>Direct Call</span>
                  <Arrow />
                </a>
                <a href="mailto:zakirenterprise307@gmail.com">
                  <span>Email Desk</span>
                  <Arrow />
                </a>
              </div>

              <div className="side-card dark">
                <h5>Why Collaborate</h5>
                <ul className="dots">
                  <li>Proven capability - decade of delivery</li>
                  <li>Reliable project team and supervision</li>
                  <li>Transparent, milestone-based reporting</li>
                  <li>Nationwide execution, every district</li>
                  <li>Safety and quality assurance culture</li>
                </ul>
                <div className="stats-row">
                  <div className="stat-mini">
                    <div className="b">50+</div>
                    <div className="l">Projects</div>
                  </div>
                  <div className="stat-mini">
                    <div className="b">11+</div>
                    <div className="l">Service Lines</div>
                  </div>
                </div>
              </div>
            </aside>

            <div>
              {!submitted ? (
                <form className="lc-form" onSubmit={onSubmit} noValidate>
                  <h3>Collaboration Request</h3>
                  <p className="form-lead">All fields marked * are required. Files up to 25MB welcome.</p>
                  <div className="form-grid">
                    <div className={`field ${errors.name ? "has-error" : ""}`}>
                      <label>
                        Full Name<span className="req">*</span>
                      </label>
                      <input type="text" placeholder="Your full name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
                      {errors.name && <div className="err">{errors.name}</div>}
                    </div>

                    <div className="field">
                      <label>Company Name</label>
                      <input type="text" placeholder="Company / organization" value={form.company} onChange={(event) => updateField("company", event.target.value)} />
                    </div>

                    <div className={`field ${errors.phone ? "has-error" : ""}`}>
                      <label>
                        Phone Number<span className="req">*</span>
                      </label>
                      <input type="tel" placeholder="+880 1XXX XXXXXX" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
                      {errors.phone && <div className="err">{errors.phone}</div>}
                    </div>

                    <div className={`field ${errors.email ? "has-error" : ""}`}>
                      <label>
                        Email<span className="req">*</span>
                      </label>
                      <input type="email" placeholder="you@company.com" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
                      {errors.email && <div className="err">{errors.email}</div>}
                    </div>

                    <div className={`field full ${errors.subject ? "has-error" : ""}`}>
                      <label>
                        Subject<span className="req">*</span>
                      </label>
                      <input type="text" placeholder="e.g. 10-storey commercial tower - Banani" value={form.subject} onChange={(event) => updateField("subject", event.target.value)} />
                      {errors.subject && <div className="err">{errors.subject}</div>}
                    </div>

                    <div className={`field ${errors.inquiryType ? "has-error" : ""}`}>
                      <label>
                        Inquiry Type<span className="req">*</span>
                      </label>
                      <select
                        value={form.inquiryType}
                        onChange={(event) => {
                          const next = event.target.value as InquiryType;
                          updateField("inquiryType", next);
                          setIntent(next);
                        }}
                      >
                        <option value="">Select type...</option>
                        {INTENT_ITEMS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                      {errors.inquiryType && <div className="err">{errors.inquiryType}</div>}
                    </div>

                    <div className="field">
                      <label>Budget Range</label>
                      <select value={form.budget} onChange={(event) => updateField("budget", event.target.value)}>
                        <option value="">Select range...</option>
                        <option>Under BDT 1 Cr</option>
                        <option>BDT 1 - 5 Cr</option>
                        <option>BDT 5 - 20 Cr</option>
                        <option>BDT 20 - 50 Cr</option>
                        <option>BDT 50 Cr +</option>
                        <option>To be discussed</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>Project Location</label>
                      <input type="text" placeholder="City / district" value={form.location} onChange={(event) => updateField("location", event.target.value)} />
                    </div>

                    <div className="field">
                      <label>Expected Timeline</label>
                      <select value={form.timeline} onChange={(event) => updateField("timeline", event.target.value)}>
                        <option value="">Select timeline...</option>
                        <option>Immediate (&lt; 1 month)</option>
                        <option>1 - 3 months</option>
                        <option>3 - 6 months</option>
                        <option>6 - 12 months</option>
                        <option>12 months +</option>
                        <option>Flexible / planning stage</option>
                      </select>
                    </div>

                    {form.inquiryType === "tender" && (
                      <div className="field full">
                        <label>Bid / Project Name</label>
                        <input type="text" placeholder="Tender reference or project name" value={form.bidName} onChange={(event) => updateField("bidName", event.target.value)} />
                      </div>
                    )}

                    <div className="field full">
                      <label>Interested Services</label>
                      <div className="svc-chips">
                        {SERVICE_ITEMS.map((service) => (
                          <button key={service} type="button" className={`svc-chip ${form.services.includes(service) ? "active" : ""}`} onClick={() => toggleService(service)}>
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`field full ${errors.message ? "has-error" : ""}`}>
                      <label>
                        Project Brief / Message<span className="req">*</span>
                      </label>
                      <textarea
                        placeholder="Describe your scope, site conditions, key constraints and any deadlines..."
                        value={form.message}
                        onChange={(event) => updateField("message", event.target.value)}
                      />
                      {errors.message && <div className="err">{errors.message}</div>}
                    </div>

                    <div className="field full">
                      <label>Attachments</label>
                      <label className="attach-field">
                        <div className="attach-ic">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                            <path d="M21 12.5L12.5 21a6 6 0 0 1-8.5-8.5L13 3.5a4 4 0 0 1 5.7 5.7L10 18a2 2 0 0 1-2.8-2.8L15 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="attach-t">Add drawings, BoQ, RFP or site images</div>
                          <div className="attach-s">PDF - DWG - XLS - JPG - PNG - up to 25MB</div>
                        </div>
                        <input type="file" style={{ display: "none" }} multiple />
                      </label>
                    </div>
                  </div>

                  <div className="submit-row">
                    <button type="submit" className="btn btn-primary">
                      Submit Collaboration Request <Arrow />
                    </button>
                    <a href="https://wa.me/8801700000000" className="btn btn-outline-dark">
                      Talk on WhatsApp <ArrowUpRight />
                    </a>
                    <div className="submit-note">By submitting, you agree to be contacted by the Zakir Enterprise project team.</div>
                  </div>
                </form>
              ) : (
                <div className="success-panel">
                  <div className="success-icon">OK</div>
                  <h3>Thank You - We&apos;ve Got It.</h3>
                  <p>
                    Our business team has received your {intentLabel.toLowerCase()} and will contact you on <strong>{form.phone}</strong> or <strong>{form.email}</strong> within two working days with a structured next step.
                  </p>
                  <div className="success-meta">
                    <div>
                      Reference<strong>{referenceNo || "ZE-000000"}</strong>
                    </div>
                    <div>
                      Desk<strong>Project Team - Dhaka</strong>
                    </div>
                    <div>
                      Response<strong>Within 2 days</strong>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <a href="/projects" className="btn btn-outline-dark">
                      View Our Projects <Arrow />
                    </a>
                    <button type="button" className="btn btn-primary" onClick={() => setSubmitted(false)}>
                      Submit Another <Arrow />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="map-wrap">
          <div className="map-canvas">
            <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M60 0H0v60" fill="none" stroke="rgba(255,255,255,0.04)" />
                </pattern>
              </defs>
              <rect width="1200" height="520" fill="url(#gridPattern)" />
              <path d="M0 300 C200 290 400 340 600 310 S 1000 250 1200 280" stroke="rgba(180,222,53,0.18)" strokeWidth="2" fill="none" />
              <path d="M0 360 C250 380 500 330 750 380 S 1100 360 1200 340" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
              <path d="M700 0 L720 520" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
              <path d="M300 0 L320 520" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <div className="map-pin main" style={{ right: "38%", top: "48%" }} />
          <div className="map-pin" style={{ right: "55%", top: "30%" }} />
          <div className="map-pin" style={{ right: "22%", top: "62%" }} />
          <div className="map-pin" style={{ right: "66%", top: "70%" }} />

          <div className="map-info">
            <h5>Head Office - Dhaka</h5>
            <h3>Zakir Enterprise Ltd.</h3>
            <p>
              House 42, Road 11, Banani,
              <br />
              Dhaka 1213, Bangladesh
            </p>
            <p>
              <strong>Phone</strong>+8801791026074
            </p>
            <p>
              <strong>Email</strong>zakirenterprise307@gmail.com
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <a href="#" className="btn btn-primary" style={{ padding: "12px 18px", fontSize: 11 }}>
                Get Directions <Arrow size={12} />
              </a>
              <a href="tel:+8801791026074" className="btn btn-outline-dark" style={{ padding: "12px 18px", fontSize: 11 }}>
                Call Office
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <div className="final-cta-grid">
            <div>
              <span className="microlabel on-dark">Need Immediate Help</span>
              <h2 style={{ marginTop: 20 }}>
                Need <span className="accent">immediate</span> assistance on site?
              </h2>
              <p>Our project desk is staffed across business hours. For urgent coordination, tender deadlines or ongoing site issues, reach us directly.</p>
              <div className="final-cta-btns">
                <a href="tel:+8801791026074" className="btn btn-primary">
                  Call Now <Arrow />
                </a>
                <a href="https://wa.me/8801791026074" className="btn btn-outline-light">
                  WhatsApp Us
                </a>
                {/* <a href="#form" className="btn btn-outline-light">
                  Send Proposal
                </a> */}
              </div>
            </div>

            <div className="final-cta-lines">
              <a href="tel:+8801791026074" className="fc-line">
                <div className="ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.5 2L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.5c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2.1z" />
                  </svg>
                </div>
                <div>
                  <span className="k">Direct Line</span>
                  <span className="v">+880 1791 026 074</span>
                </div>
                <span className="chev">
                  <Arrow size={14} />
                </span>
              </a>

              <a href="https://wa.me/8801791026074" className="fc-line">
                <div className="ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.5 3.5A11.5 11.5 0 0 0 2.1 17.2L1 22l4.9-1.1A11.5 11.5 0 1 0 20.5 3.5zm-8.4 17.5a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-2.9.7.6-2.8-.2-.3a9.5 9.5 0 1 1 7.6 3.9zm5.2-6.6c-.3-.1-1.8-.8-2-1s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a7.8 7.8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.1-.3 0-.4.1-.6l.4-.4.3-.5c.1-.2 0-.3 0-.5s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.5 0-.7.3a3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1 2.7c.2.3 1.6 2.5 3.9 3.5a13 13 0 0 0 1.3.5 3.1 3.1 0 0 0 1.4.1 2.4 2.4 0 0 0 1.5-1 1.9 1.9 0 0 0 .1-1c0-.2-.2-.2-.5-.4z" />
                  </svg>
                </div>
                <div>
                  <span className="k">WhatsApp Desk</span>
                  <span className="v">Chat with project team</span>
                </div>
                <span className="chev">
                  <Arrow size={14} />
                </span>
              </a>

              <a href="mailto:zakirenterprise307@gmail.com" className="fc-line">
                <div className="ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <rect x="3" y="5" width="18" height="14" />
                    <polyline points="3,6 12,13 21,6" />
                  </svg>
                </div>
                <div>
                  <span className="k">Email Desk</span>
                  <span className="v">zakirenterprise307@gmail.com</span>
                </div>
                <span className="chev">
                  <Arrow size={14} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <a href="https://wa.me/8801791026074" className="whatsapp-sticky" aria-label="Chat on WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 3.5A11.5 11.5 0 0 0 2.1 17.2L1 22l4.9-1.1A11.5 11.5 0 1 0 20.5 3.5zm-8.4 17.5a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-2.9.7.6-2.8-.2-.3a9.5 9.5 0 1 1 7.6 3.9z" />
        </svg>
      </a>
    </>
  );
}
