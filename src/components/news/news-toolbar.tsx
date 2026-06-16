"use client";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

// Client island for the News index toolbar (news-fe-public §D): search, category chips, sort.
// Pushes state into the URL query params; the /news server page reads them and re-fetches.

export type ChipOption = { value: string; label: string; count: number };

function Search({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <circle cx="11" cy="11" r="7" />
      <line x1="16" y1="16" x2="21" y2="21" />
    </svg>
  );
}

export function NewsToolbar({ q, category, sort, chips }: { q: string; category: string; sort: string; chips: ChipOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = React.useState(q);
  React.useEffect(() => setSearch(q), [q]);

  const apply = React.useCallback(
    (next: { q?: string; category?: string; sort?: string }) => {
      const merged = { q, category, sort, ...next };
      const params = new URLSearchParams();
      if (merged.q) params.set("q", merged.q);
      if (merged.category) params.set("category", merged.category);
      if (merged.sort && merged.sort !== "latest") params.set("sort", merged.sort);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [q, category, sort, pathname, router],
  );

  React.useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => apply({ q: search }), 350);
    return () => clearTimeout(t);
  }, [search, q, apply]);

  return (
    <div className="nc-toolbar" data-screen-label="03 Toolbar">
      <div className="container">
        <div className="nc-toolbar-inner">
          <div className="nc-search">
            <Search />
            <input type="text" placeholder="Search news, achievements, projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="nc-chips-wrap">
            {chips.map((c) => (
              <button key={c.value || "all"} className={`nc-chip ${category === c.value ? "active" : ""}`} onClick={() => apply({ category: c.value })}>
                {c.label} <span className="count">{c.count}</span>
              </button>
            ))}
          </div>
          <div className="nc-sort">
            <select value={sort || "latest"} onChange={(e) => apply({ sort: e.target.value })}>
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
