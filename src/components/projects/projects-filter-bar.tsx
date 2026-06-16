"use client";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

// Client island for the Projects listing filter bar (projects-fe-public §D). The page
// itself is a server component that reads the query params and renders the filtered grid;
// this only owns the interactive controls (search box, the custom dropdowns, the sticky
// behaviour, active-filter chips) and pushes the chosen state back into the URL, which
// re-runs the server fetch. No data fetching happens here.

export type FacetOption = { value: string; label: string; count?: number };

export type ProjectsFilterState = {
  q: string;
  category: string; // term slug or "" (all)
  clientType: string; // Government|Commercial|Private or ""
  deliveryStatus: string; // Completed|Ongoing|Planning or ""
  location: string; // term slug or ""
  sort: string; // recent|oldest|title or ""
};

function CaretDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FacetOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  const current = options.find((o) => o.value === value) ?? options[0];
  const active = value !== options[0]?.value;
  return (
    <div ref={ref} className={`filter-select ${active ? "active" : ""}`} onClick={() => setOpen(!open)}>
      <span>{label}:</span>
      <span className="val">{current?.label}</span>
      <span className="caret">
        <CaretDown />
      </span>
      {open && (
        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
          {options.map((o) => (
            <button
              key={o.value}
              className={o.value === value ? "selected" : ""}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectsFilterBar({
  state,
  resultCount,
  categoryOptions,
  typeOptions,
  statusOptions,
  locationOptions,
  sortOptions,
  categoryChips,
}: {
  state: ProjectsFilterState;
  resultCount: number;
  categoryOptions: FacetOption[];
  typeOptions: FacetOption[];
  statusOptions: FacetOption[];
  locationOptions: FacetOption[];
  sortOptions: FacetOption[];
  categoryChips: FacetOption[]; // value "" = All
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = React.useState(state.q);

  // Keep the controlled input in sync when the URL changes from elsewhere (chip clear, etc.).
  React.useEffect(() => setSearchValue(state.q), [state.q]);

  // Push the next filter state into the URL (drops empty values, resets to page 1).
  const apply = React.useCallback(
    (next: Partial<ProjectsFilterState>) => {
      const merged: ProjectsFilterState = { ...state, ...next };
      const params = new URLSearchParams();
      if (merged.q) params.set("q", merged.q);
      if (merged.category) params.set("category", merged.category);
      if (merged.clientType) params.set("clientType", merged.clientType);
      if (merged.deliveryStatus) params.set("deliveryStatus", merged.deliveryStatus);
      if (merged.location) params.set("location", merged.location);
      if (merged.sort) params.set("sort", merged.sort);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [state, pathname, router],
  );

  // Debounce the free-text search so each keystroke doesn't navigate.
  React.useEffect(() => {
    if (searchValue === state.q) return;
    const t = setTimeout(() => apply({ q: searchValue }), 350);
    return () => clearTimeout(t);
  }, [searchValue, state.q, apply]);

  // Sticky filter bar (pin once the anchor scrolls under the header).
  const [pinned, setPinned] = React.useState(false);
  const [filterBarHeight, setFilterBarHeight] = React.useState(0);
  const stickyAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const filterBarRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const STICKY_TOP = 76;
    const update = () => {
      const anchorTop = stickyAnchorRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      setPinned(anchorTop <= STICKY_TOP);
      setFilterBarHeight(filterBarRef.current?.offsetHeight ?? 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const activeFilters: { k: string; l: string; clear: () => void }[] = [];
  if (state.q) activeFilters.push({ k: "search", l: `"${state.q}"`, clear: () => { setSearchValue(""); apply({ q: "" }); } });
  if (state.category) {
    const l = categoryOptions.find((o) => o.value === state.category)?.label ?? state.category;
    activeFilters.push({ k: "cat", l, clear: () => apply({ category: "" }) });
  }
  if (state.clientType) activeFilters.push({ k: "ty", l: state.clientType, clear: () => apply({ clientType: "" }) });
  if (state.deliveryStatus) activeFilters.push({ k: "st", l: state.deliveryStatus, clear: () => apply({ deliveryStatus: "" }) });
  if (state.location) {
    const l = locationOptions.find((o) => o.value === state.location)?.label ?? state.location;
    activeFilters.push({ k: "lo", l, clear: () => apply({ location: "" }) });
  }

  const resetAll = () => {
    setSearchValue("");
    router.push(pathname, { scroll: false });
  };

  return (
    <>
      <div ref={stickyAnchorRef} className="filter-sticky-anchor" aria-hidden />
      {pinned && <div className="filter-sticky-spacer" style={{ height: filterBarHeight }} aria-hidden />}
      <div ref={filterBarRef} className={`filter-bar ${pinned ? "pinned is-fixed" : ""}`}>
        <div className="container">
          <div className="filter-row">
            <div className="filter-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search projects, locations..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div className="filter-selects">
              <Select label="Category" options={categoryOptions} value={state.category} onChange={(v) => apply({ category: v })} />
              <Select label="Type" options={typeOptions} value={state.clientType} onChange={(v) => apply({ clientType: v })} />
              <Select label="Status" options={statusOptions} value={state.deliveryStatus} onChange={(v) => apply({ deliveryStatus: v })} />
              <Select label="Location" options={locationOptions} value={state.location} onChange={(v) => apply({ location: v })} />
            </div>
            <div className="filter-right">
              <div className="result-count">
                <strong>{resultCount}</strong> projects
              </div>
              <Select label="Sort" options={sortOptions} value={state.sort} onChange={(v) => apply({ sort: v })} />
            </div>
          </div>

          <div className="chips-row">
            {categoryChips.map((c) => (
              <button
                key={c.value || "all"}
                className={`chip ${state.category === c.value ? "active" : ""}`}
                onClick={() => apply({ category: c.value })}
              >
                {c.label} {c.count != null && <span className="count">{c.count}</span>}
              </button>
            ))}
          </div>

          {activeFilters.length > 0 && (
            <div className="active-chips">
              {activeFilters.map((f) => (
                <span key={f.k} className="active-chip">
                  {f.l} <button onClick={f.clear}>Clear</button>
                </span>
              ))}
              <button className="clear-all" onClick={resetAll}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
