"use client";
import * as React from "react";

// Client island for the project detail gallery (projects-fe-public §E). The gallery tiles are
// server-rendered with <MediaImage> (children); this overlays a click target per tile and owns
// the lightbox modal + keyboard nav. Image URLs for the modal are passed in (already resolved
// from the gallery MediaRefs server-side) so we don't re-fetch.

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <polyline points="15,3 21,3 21,9" />
      <polyline points="9,21 3,21 3,15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function Lightbox({ images, idx, onClose, setIdx }: { images: string[]; idx: number; onClose: () => void; setIdx: (i: number) => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((idx - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((idx + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, images.length, onClose, setIdx]);
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>Close</button>
      <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}>Left</button>
      <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}>Right</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[idx]} alt="" onClick={(e) => e.stopPropagation()} />
      <div className="lb-count">{idx + 1} / {images.length}</div>
    </div>
  );
}

/**
 * Wraps the server-rendered gallery tiles. `tiles[i]` is the fill <MediaImage> cell for tile i;
 * `tileClasses[i]` carries the grid-span class (feature/tall) — it MUST live on this trigger
 * wrapper, which is the real grid child, so the grid sizing/spans apply (a tile styled deeper
 * would not be a grid item and would collapse to zero height). `urls[i]` is the full-size image
 * URL opened in the lightbox.
 */
export function GalleryLightbox({ tiles, tileClasses = [], urls }: { tiles: React.ReactNode[]; tileClasses?: string[]; urls: string[] }) {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <>
      {tiles.map((tile, i) => (
        <div key={i} className={`gallery-cell-trigger ${tileClasses[i] ?? ""}`.trim()} role="button" tabIndex={0} onClick={() => setOpen(i)} onKeyDown={(e) => { if (e.key === "Enter") setOpen(i); }}>
          {tile}
          <div className="expand">
            <ExpandIcon />
          </div>
        </div>
      ))}
      {open !== null && urls.length > 0 && (
        <Lightbox images={urls} idx={open} setIdx={(i) => setOpen(i)} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
