"use client";
import * as React from "react";

// Client island wrapping the featured-projects carousel (projects-fe-public §D). The slides
// are server-rendered (<MediaImage> + links) and passed in as children, one node per slide;
// this only owns the prev/next paging + the translate transform. Keeping the cards on the
// server means the Cloudinary images and links are in the initial HTML.

export function FeaturedCarousel({ slides }: { slides: React.ReactNode[] }) {
  const [page, setPage] = React.useState(0);
  const pageCount = Math.max(1, slides.length);

  React.useEffect(() => {
    setPage((prev) => Math.min(prev, pageCount - 1));
  }, [pageCount]);

  const next = () => setPage((p) => (p + 1) % pageCount);
  const prev = () => setPage((p) => (p - 1 + pageCount) % pageCount);

  return (
    <>
      <div className="featured-carousel-controls">
        <button type="button" className="featured-nav-btn" onClick={prev} disabled={slides.length <= 1} aria-label="Previous featured projects">
          <span className="icon left">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </span>
          Prev
        </button>
        <span className="featured-page-indicator">
          {Math.min(page + 1, pageCount)} / {pageCount}
        </span>
        <button type="button" className="featured-nav-btn" onClick={next} disabled={slides.length <= 1} aria-label="Next featured projects">
          Next
          <span className="icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <polyline points="9,6 15,12 9,18" />
            </svg>
          </span>
        </button>
      </div>
      <div className="featured-carousel-viewport">
        <div className="featured-carousel-track" style={{ transform: `translate3d(-${page * 100}%, 0, 0)` }}>
          {slides.map((slide, i) => (
            <div className="featured-carousel-slide" key={`featured-slide-${i}`}>
              <div className="featured-grid">{slide}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
