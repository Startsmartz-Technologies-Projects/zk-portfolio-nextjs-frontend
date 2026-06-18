"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "../site-ui";

// Testimonials carousel (pages-fe-public). Client island extracted so the PAGES section
// renderer (a server component) can mount it. Mirrors the original static Testimonials in
// sections3.tsx: a dark two-column band — copy on the left, a rotating quote card on the
// right with prev/next + dots. Items come from the resolved section: title = author,
// subtitle = role, body = quote, meta.initials = avatar text.

export type TestimonialItem = {
  id?: string;
  quote: string;
  author: string;
  role: string | null;
  initials: string;
};

export function Testimonials({
  eyebrow,
  heading,
  intro,
  items,
}: {
  eyebrow: string | null;
  heading: string | null;
  intro: string | null;
  items: TestimonialItem[];
}) {
  const [idx, setIdx] = React.useState(0);
  if (items.length === 0) return null;
  const go = (d: number) => setIdx((i) => (i + d + items.length) % items.length);
  const cur = items[idx];

  return (
    <section className="section-pad section-dark" data-screen-label="Testimonials">
      <div className="container">
        <div className="testi-wrap">
          <div className="testi-left">
            {eyebrow && <span className="microlabel on-dark">{eyebrow}</span>}
            {heading && <h2 style={{ marginTop: 18 }}>{heading}</h2>}
            {intro && <p>{intro}</p>}
          </div>
          <div className="testi-card">
            <div className="quote-mark">&ldquo;</div>
            <blockquote>{cur.quote}</blockquote>
            <div className="testi-author">
              <div className="avi">{cur.initials}</div>
              <div>
                <div className="who">{cur.author}</div>
                {cur.role && <div className="role">{cur.role}</div>}
              </div>
            </div>
            <div className="testi-controls">
              <button type="button" className="testi-btn" aria-label="Previous testimonial" onClick={() => go(-1)}>
                <ChevronLeft />
              </button>
              <button type="button" className="testi-btn" aria-label="Next testimonial" onClick={() => go(1)}>
                <ChevronRight />
              </button>
              <div className="testi-dots">
                {items.map((it, i) => (
                  <span
                    key={it.id ?? i}
                    className={`dot ${i === idx ? "active" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => setIdx(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setIdx(i);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
