"use client";
import * as React from "react";
import { ArrowUpRight } from "../site-ui";
import { MediaDocLink } from "../media/media-doc-link";
import type { MediaRef } from "@/lib/data/media";

// Client island: the certifications document library — toolbar (search/category/status/sort),
// card grid, and the inline preview modal (certifications-fe-public §B/§C/§D). The cert set is
// fetched server-side and passed in (small, unpaginated directory); filtering + the ?preview=<slug>
// deep-link are client-only. Each card's certificate `document` renders as a <MediaDocLink>.

export type CertItem = {
  slug: string;
  title: string;
  authority: string | null;
  number: string | null;
  category: { label: string } | null;
  status: string;
  display_issued: string | null;
  display_expiry: string | null;
  description: string | null;
  document: MediaRef | null;
  tone: string;
  seal_shape: string;
};

const statusClass = (s: string) => s.replace(/\s+/g, "-").toLowerCase();

function CertThumb({ item }: { item: CertItem }) {
  return (
    <div className={`ct-thumb tone-${item.tone}`}>
      <div className="ct-thumb-frame">
        <div className="ct-thumb-header">
          <div className="ct-thumb-mark">Z</div>
          {item.number && <div className="ct-thumb-id">{item.number}</div>}
        </div>
        <div className="ct-thumb-title">Certificate of {(item.category?.label ?? "Compliance").split(" ")[0]}</div>
        {item.authority && <div className="ct-thumb-auth">{item.authority}</div>}
        <div className="ct-thumb-footer">
          <div className={`ct-thumb-seal seal-${item.seal_shape}`} />
        </div>
      </div>
    </div>
  );
}

function CtCard({ item, onPreview }: { item: CertItem; onPreview: (i: CertItem) => void }) {
  return (
    <div className="ct-card">
      <div className="ct-card-thumb">
        <CertThumb item={item} />
        <span className={`ct-status ${statusClass(item.status)}`}>{item.status}</span>
      </div>
      <div className="ct-card-body">
        {item.category && <span className="ct-chip">{item.category.label}</span>}
        <h3>{item.title}</h3>
        {item.authority && <div className="ct-card-auth">{item.authority}</div>}
        <div className="ct-card-meta">
          <div>
            <span className="k">Issued</span>
            <span className="v">{item.display_issued ?? "—"}</span>
          </div>
          <div>
            <span className="k">Valid Until</span>
            <span className="v">{item.display_expiry ?? "—"}</span>
          </div>
        </div>
        <div className="ct-card-foot">
          {item.number && <span className="ct-card-num">{item.number}</span>}
          <button className="ct-preview" onClick={() => onPreview(item)}>
            Preview <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CtModal({ item, onClose }: { item: CertItem; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ct-modal-backdrop" onClick={onClose}>
      <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ct-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="ct-modal-body">
          <div className="ct-modal-preview">
            <CertThumb item={item} />
          </div>
          <div className="ct-modal-info">
            {item.category && <span className="ct-chip">{item.category.label}</span>}
            <h3>{item.title}</h3>
            {item.description && <p className="ct-modal-desc">{item.description}</p>}
            <div className="ct-modal-meta">
              {item.authority && (
                <div>
                  <span className="k">Issuing Authority</span>
                  <span className="v">{item.authority}</span>
                </div>
              )}
              {item.number && (
                <div>
                  <span className="k">Certificate No.</span>
                  <span className="v">{item.number}</span>
                </div>
              )}
              <div>
                <span className="k">Issue Date</span>
                <span className="v">{item.display_issued ?? "—"}</span>
              </div>
              <div>
                <span className="k">Valid Until</span>
                <span className="v">{item.display_expiry ?? "—"}</span>
              </div>
              <div>
                <span className="k">Status</span>
                <span className="v">
                  <span className={`ct-status inline ${statusClass(item.status)}`}>{item.status}</span>
                </span>
              </div>
            </div>
            <div className="ct-modal-ctas">
              {/* Real certificate document: download/preview via the Wave-A media doc link. */}
              <MediaDocLink media={item.document} className="btn btn-primary" label="Download Certificate" fallback={null} />
              <button className="btn btn-outline-dark" onClick={onClose}>
                Close Preview
              </button>
            </div>
            <div className="ct-modal-note">
              {item.document
                ? "Download the verified certificate document above."
                : "Document preview is a visual representation. Original verified copies are provided during pre-qualification on request."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificationsDirectory({
  items,
  categories,
  statuses,
}: {
  items: CertItem[];
  categories: string[]; // labels, with "All" first
  statuses: string[]; // status values, with "All" first
}) {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [sort, setSort] = React.useState("recent");
  const [preview, setPreview] = React.useState<CertItem | null>(null);

  // Open the preview deep-linked by ?preview=<slug> on first mount.
  React.useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("preview");
    if (!slug) return;
    const target = items.find((c) => c.slug === slug);
    if (target) setPreview(target);
  }, [items]);

  const setPreviewInUrl = React.useCallback((slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("preview", slug);
    else url.searchParams.delete("preview");
    if (!url.hash) url.hash = "certs";
    window.history.replaceState({}, "", url.toString());
  }, []);

  const openPreview = React.useCallback(
    (item: CertItem) => {
      setPreview(item);
      setPreviewInUrl(item.slug);
    },
    [setPreviewInUrl],
  );
  const closePreview = React.useCallback(() => {
    setPreview(null);
    setPreviewInUrl(null);
  }, [setPreviewInUrl]);

  const clearFilters = React.useCallback(() => {
    setQ("");
    setCat("All");
    setStatus("All");
    setSort("recent");
  }, []);

  const filtered = React.useMemo(() => {
    let list = items.filter((c) => {
      if (cat !== "All" && c.category?.label !== cat) return false;
      if (status !== "All" && c.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!c.title.toLowerCase().includes(s) && !(c.authority ?? "").toLowerCase().includes(s) && !(c.number ?? "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "expiry") list = [...list].sort((a, b) => (b.display_expiry ?? "").localeCompare(a.display_expiry ?? ""));
    return list;
  }, [items, q, cat, status, sort]);

  return (
    <>
      <div className="ct-toolbar">
        <div className="ct-toolbar-search">
          <input type="text" placeholder="Search by title, authority, or number..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="ct-toolbar-filters">
          <div className="ct-select">
            <label>Category</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="ct-select">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="ct-select">
            <label>Sort by</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="title">Title A-Z</option>
              <option value="expiry">Expiry Date</option>
            </select>
          </div>
          <button className="ct-clear" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
        <div className="ct-toolbar-count">
          <span>
            <strong>{filtered.length}</strong> documents
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ct-empty">
          <div className="ct-empty-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <rect x="4" y="4" width="16" height="16" />
              <path d="M4 4 L20 20" />
            </svg>
          </div>
          <h4>No documents match those filters</h4>
          <p>Try clearing the search or selecting a different category.</p>
          <button className="btn btn-dark" onClick={clearFilters}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="ct-grid">
          {filtered.map((item) => (
            <CtCard key={item.slug} item={item} onPreview={openPreview} />
          ))}
        </div>
      )}
      {preview && <CtModal item={preview} onClose={closePreview} />}
    </>
  );
}
