"use client";
import * as React from "react";
import Link from "next/link";
import { Arrow } from "../site-ui";

// Client island: the service-detail FAQ accordion (services-fe-public §E). Section hidden by the
// caller when there are no items (BR-7). Data (question/answer) is passed in from the server page.

export function SvcFAQ({ items, title, lead }: { items: Array<{ question: string; answer: string | null }>; title: string | null; lead: string | null }) {
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" className="section-pad section-soft">
      <div className="container">
        <div className="faq-wrap">
          <div className="faq-left">
            <span
              className="num"
              style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.3em", color: "var(--gold)", marginBottom: 14, display: "block" }}
            >
              FREQUENTLY ASKED / 07
            </span>
            {title && <h2>{title}</h2>}
            {lead && <p>{lead}</p>}
            <div className="faq-cta-card">
              <h5>Still have a question?</h5>
              <p>Speak with our project team for a detailed discussion on scope, timeline and pricing.</p>
              <Link href="#svc-cta" className="btn btn-primary">
                Contact Project Team <Arrow />
              </Link>
            </div>
          </div>
          <div className="faq-list">
            {items.map((it, i) => (
              <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <span className="faq-num">Q.0{i + 1}</span>
                    <span>{it.question}</span>
                  </span>
                  <span className="faq-icon">{open === i ? "-" : "+"}</span>
                </button>
                <div className="faq-a">
                  <div>
                    <div className="faq-a-inner">{it.answer}</div>
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
