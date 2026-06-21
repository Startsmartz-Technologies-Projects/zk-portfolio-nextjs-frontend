"use client";

import * as React from "react";
import { Arrow, ArrowUpRight, SvcIcon } from "./site-ui";

// Page chrome resolved server-side from PAGES (lets-collaborate) + the SITE bundle and passed in
// (pages-fe-public §E). The inquiry form below keeps its own INTENT_ITEMS (the form's id↔type map
// is the leads-fe-public-form task, Wave D) — chrome only overrides the hero/trust-hook copy +
// contact lines, each with a static fallback so a missing page never blanks the page.
export type CollaborateChrome = {
  heroEyebrow: string | null;
  heroHeading: string | null;
  heroSub: string | null;
  trustHeading: string | null;
  trustChips: string[];
  intentEyebrow: string | null;
  intentHeading: string | null;
  intentSub: string | null;
  intentItems: Array<{ icon: string; title: string; description: string }>;
  contact: {
    phone: string;
    email: string;
    officeAddress: string;
    whatsapp: string;
    businessHours: string;
    coverageSummary: string;
  };
};

// Controlled option sets the form renders + validates against (leads-fe-public-form §A2), resolved
// server-side from getOptionSets() (lib/leads/options).
export type InquiryOptions = {
  inquiry_types: Array<{ value: string; label: string }>;
  services: string[];
  budgets: string[];
  timelines: string[];
};

// The hidden anti-spam field name — must match the backend (lib/validation/leads HONEYPOT_FIELD).
const HONEYPOT_FIELD = "company_website";
const MAX_ATTACHMENTS = 10;

type Attachment = {
  name: string;
  status: "uploading" | "done" | "error";
  media_id?: string;
  error?: string;
};

const HERO_IMAGE =
  "https://res.cloudinary.com/dk4csiouq/image/upload/v1778497992/Collobarote_Hero_fgpdk5.jpg";

const WHATSAPP_URL = "https://wa.me/8801791026074";
const OPEN_IN_NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

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

export function LetsCollaboratePageContent({ chrome, options }: { chrome?: CollaborateChrome; options?: InquiryOptions }) {
  // Option sets from the server (§A2); fall back to the legacy in-file lists if not provided.
  const inquiryTypes = options?.inquiry_types ?? INTENT_ITEMS.map((i) => ({ value: i.id, label: i.title }));
  const serviceOptions = options?.services ?? [...SERVICE_ITEMS];
  const budgetOptions = options?.budgets ?? [];
  const timelineOptions = options?.timelines ?? [];

  // Contact chrome from SITE settings, each with a static fallback so an unset field never
  // blanks the page. WhatsApp/business-hours/coverage are now admin-editable (Site Settings).
  const whatsappUrl = chrome?.contact.whatsapp || WHATSAPP_URL;
  const businessHours = chrome?.contact.businessHours || "Sun - Thu, 9:00 - 18:00 (GMT+6)";
  const coverage = chrome?.contact.coverageSummary || "All 64 districts";
  const phone = chrome?.contact.phone || "+8801791026074";
  const email = chrome?.contact.email || "zakirenterprise307@gmail.com";
  const officeAddress = chrome?.contact.officeAddress || "House 42, Road 11, Banani, Dhaka 1213, Bangladesh";
  // tel: links want a clean number; the WhatsApp fallback URL already embeds the default number.
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  const [intent, setIntent] = React.useState<InquiryType | "">("");
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [referenceNo, setReferenceNo] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string>(""); // banner: 429 / network / 500
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const honeypotRef = React.useRef<HTMLInputElement | null>(null);

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

  // Broker each selected file into MEDIA (§A3): POST to the attachment endpoint, collect media_id.
  const onFilesPicked = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList).slice(0, MAX_ATTACHMENTS - attachments.length);
    for (const file of files) {
      const idx = attachments.length;
      setAttachments((prev) => [...prev, { name: file.name, status: "uploading" }]);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/inquiries/attachments", { method: "POST", body: fd });
        if (res.status === 429) {
          setAttachments((prev) => prev.map((a, i) => (i === idx ? { ...a, status: "error", error: "Too many uploads — try again shortly." } : a)));
          continue;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = (data?.details?.[0]?.message as string) || (data?.message as string) || "Upload failed";
          setAttachments((prev) => prev.map((a, i) => (i === idx ? { ...a, status: "error", error: msg } : a)));
          continue;
        }
        setAttachments((prev) => prev.map((a, i) => (i === idx ? { ...a, status: "done", media_id: data.media_id } : a)));
      } catch {
        setAttachments((prev) => prev.map((a, i) => (i === idx ? { ...a, status: "error", error: "Upload failed" } : a)));
      }
    }
  };

  const removeAttachment = (idx: number) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

  // Map server 422 field issues (zod) onto the inline error map. Each issue has path[] + message.
  const applyServerErrors = (details: unknown): boolean => {
    if (!Array.isArray(details) || details.length === 0) return false;
    const next: Record<string, string> = {};
    const fieldMap: Record<string, string> = { inquiry_type: "inquiryType", attachment_ids: "attachments" };
    for (const issue of details as Array<{ path?: unknown[]; field?: string; message?: string }>) {
      const raw = String(issue.path?.[0] ?? issue.field ?? "");
      const key = fieldMap[raw] ?? raw;
      if (key) next[key] = issue.message || "Invalid value";
    }
    setErrors(next);
    return Object.keys(next).length > 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    // First-pass client validation (§A1 — the server is authoritative).
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

    if (attachments.some((a) => a.status === "uploading")) {
      setFormError("Please wait for attachments to finish uploading.");
      return;
    }

    const attachment_ids = attachments.filter((a) => a.status === "done" && a.media_id).map((a) => a.media_id!);

    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim() || null,
          phone: form.phone.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          inquiry_type: form.inquiryType,
          services: form.services,
          budget: form.budget || null,
          location: form.location.trim() || null,
          timeline: form.timeline || null,
          bid_name: form.inquiryType === "tender" ? form.bidName.trim() || null : null,
          message: form.message.trim(),
          attachment_ids,
          // Honeypot: read the hidden field's live value (bots fill it; humans never see it).
          [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
        }),
      });

      if (res.status === 429) {
        setFormError("You've sent several requests in a short time. Please wait a few minutes and try again.");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 422) {
        if (!applyServerErrors(data?.details)) setFormError(data?.message || "Please correct the highlighted fields.");
        return;
      }
      if (!res.ok) {
        setFormError(data?.message || "Something went wrong submitting your request. Please try again.");
        return;
      }
      // Success — show the server-generated reference (§A1).
      setReferenceNo(data.reference_no || "");
      setSubmitted(true);
    } catch {
      setFormError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm(INITIAL_FORM);
    setAttachments([]);
    setErrors({});
    setFormError("");
    setIntent("");
  };

  const intentLabel = inquiryTypes.find((item) => item.value === form.inquiryType)?.label ?? "inquiry";

  return (
    <>
      <section className="lc-hero">
        <div className="lc-hero-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="container lc-hero-inner">
          <div className="lc-hero-grid">
            <div>
              <span className="microlabel on-dark">{chrome?.heroEyebrow ?? "Collaborate - Quote - Build"}</span>
              <h1>
                {chrome?.heroHeading ?? (
                  <>
                    Let&apos;s Build Something <span className="accent">Great</span> Together
                  </>
                )}
              </h1>
              <p className="lc-sub">
                {chrome?.heroSub ??
                  "From private developments to government-scale infrastructure, Zakir Enterprise is ready to collaborate, quote and execute with confidence across all 64 districts of Bangladesh."}
              </p>
              <div className="lc-hero-ctas">
                <a href="#form" className="btn btn-primary">
                  Let's Collaborate <Arrow />
                </a>
                {/* <a href="#form" className="btn btn-outline-light">
                  Start Discussion <ArrowUpRight />
                </a> */}
                <a href={telHref} className="btn btn-outline-light">
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
                  <span className="v">{coverage}</span>
                </li>
                <li>
                  <span className="k">Desk</span>
                  <span className="v">{email}</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="trusthook">
        <div className="container">
          <h2>
            {chrome?.trustHeading ??
              "We collaborate with developers, businesses, institutions and government stakeholders to deliver quality construction solutions across Bangladesh."}
          </h2>
          <div className="trust-chips">
            {(chrome?.trustChips?.length ? chrome.trustChips : ["Nationwide Capability", "Skilled Workforce", "Timely Delivery", "Trusted Execution", "Multi-Sector Expertise"]).map((chip) => (
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
                    <strong>Phone</strong>{phone}
                  </li>
                  <li>
                    <strong>Email</strong>{email}
                  </li>
                  <li>
                    <strong>Head Office</strong>
                    <span style={{ whiteSpace: "pre-line" }}>{officeAddress}</span>
                  </li>
                  <li>
                    <strong>Business Hours</strong>{businessHours}
                  </li>
                </ul>
              </div>

              <div className="side-card quick">
                <h5>Quick Actions</h5>
                <a href={whatsappUrl} {...OPEN_IN_NEW_TAB}>
                  <span>WhatsApp Team</span>
                  <Arrow />
                </a>
                <a href={telHref}>
                  <span>Direct Call</span>
                  <Arrow />
                </a>
                <a href={`mailto:${email}`}>
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
                        {inquiryTypes.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      {errors.inquiryType && <div className="err">{errors.inquiryType}</div>}
                    </div>

                    <div className="field">
                      <label>Budget Range</label>
                      <select value={form.budget} onChange={(event) => updateField("budget", event.target.value)}>
                        <option value="">Select range...</option>
                        {budgetOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
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
                        {timelineOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
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
                        {serviceOptions.map((service) => (
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
                          <div className="attach-s">PDF - DWG - XLS - DOC - JPG - PNG - up to 25MB</div>
                        </div>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          multiple
                          accept=".pdf,.dwg,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            void onFilesPicked(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {attachments.length > 0 && (
                        <ul className="attach-list">
                          {attachments.map((a, i) => (
                            <li key={`${a.name}-${i}`} className={`attach-item ${a.status}`}>
                              <span className="attach-name">{a.name}</span>
                              <span className="attach-status">
                                {a.status === "uploading" ? "Uploading…" : a.status === "error" ? a.error || "Failed" : "Attached"}
                              </span>
                              <button type="button" className="attach-remove" aria-label={`Remove ${a.name}`} onClick={() => removeAttachment(i)}>
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {errors.attachments && <div className="err">{errors.attachments}</div>}
                    </div>
                  </div>

                  {/* Anti-spam honeypot (§A4): visually hidden, off the tab order; bots fill it, humans don't. */}
                  <input
                    ref={honeypotRef}
                    type="text"
                    name={HONEYPOT_FIELD}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  />

                  {formError && (
                    <div className="form-error" role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="submit-row">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit Collaboration Request"} <Arrow />
                    </button>
                    <a href={whatsappUrl} className="btn btn-outline-dark" {...OPEN_IN_NEW_TAB}>
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
                    <button type="button" className="btn btn-primary" onClick={resetForm}>
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
            <p style={{ whiteSpace: "pre-line" }}>{officeAddress}</p>
            <p>
              <strong>Phone</strong>{phone}
            </p>
            <p>
              <strong>Email</strong>{email}
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <a href="#" className="btn btn-primary" style={{ padding: "12px 18px", fontSize: 11 }}>
                Get Directions <Arrow size={12} />
              </a>
              <a href={telHref} className="btn btn-outline-dark" style={{ padding: "12px 18px", fontSize: 11 }}>
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
                <a href={telHref} className="btn btn-primary">
                  Call Now <Arrow />
                </a>
                <a href={whatsappUrl} className="btn btn-outline-light" {...OPEN_IN_NEW_TAB}>
                  WhatsApp Us
                </a>
                {/* <a href="#form" className="btn btn-outline-light">
                  Send Proposal
                </a> */}
              </div>
            </div>

            <div className="final-cta-lines">
              <a href={telHref} className="fc-line">
                <div className="ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.5 2L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.5c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2.1z" />
                  </svg>
                </div>
                <div>
                  <span className="k">Direct Line</span>
                  <span className="v">{phone}</span>
                </div>
                <span className="chev">
                  <Arrow size={14} />
                </span>
              </a>

              <a href={whatsappUrl} className="fc-line" {...OPEN_IN_NEW_TAB}>
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

              <a href={`mailto:${email}`} className="fc-line">
                <div className="ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <rect x="3" y="5" width="18" height="14" />
                    <polyline points="3,6 12,13 21,6" />
                  </svg>
                </div>
                <div>
                  <span className="k">Email Desk</span>
                  <span className="v">{email}</span>
                </div>
                <span className="chev">
                  <Arrow size={14} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <a
        href={whatsappUrl}
        className="whatsapp-sticky"
        aria-label="Chat on WhatsApp"
        {...OPEN_IN_NEW_TAB}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 3.5A11.5 11.5 0 0 0 2.1 17.2L1 22l4.9-1.1A11.5 11.5 0 1 0 20.5 3.5zm-8.4 17.5a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-2.9.7.6-2.8-.2-.3a9.5 9.5 0 1 1 7.6 3.9z" />
        </svg>
      </a>
    </>
  );
}
