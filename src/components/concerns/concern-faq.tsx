"use client";
import * as React from "react";

// Client island: the concern-profile FAQ accordion (concerns-fe-public §C). Data passed in from
// the server page; section is hidden by the caller when there are no FAQs.

export function ConcernFaq({ faqs }: { faqs: Array<{ id: string; question: string; answer: string | null }> }) {
  const [open, setOpen] = React.useState(0);
  return (
    <div className="cd-faq-list">
      {faqs.map((faq, index) => (
        <div key={faq.id} className={`cd-faq-item ${open === index ? "open" : ""}`}>
          <button type="button" className="cd-faq-q" onClick={() => setOpen((prev) => (prev === index ? -1 : index))}>
            <span className="cd-faq-num">{String(index + 1).padStart(2, "0")}</span>
            <span className="cd-faq-text">{faq.question}</span>
            <span className="cd-faq-sign">{open === index ? "-" : "+"}</span>
          </button>
          <div className="cd-faq-a">{faq.answer}</div>
        </div>
      ))}
    </div>
  );
}
