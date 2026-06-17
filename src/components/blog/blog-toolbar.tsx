"use client";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

// Client island for the Blog index toolbar (blog-fe-public §D): search box, category chips, sort
// select. Pushes the chosen state into the URL query params; the /blogs server page reads them and
// re-fetches the filtered set. No data fetching here.

export type ChipOption = { value: string; label: string; count: number };

const BSearch = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <circle cx="11" cy="11" r="7" />
    <line x1="16" y1="16" x2="21" y2="21" />
  </svg>
);

export function BlogToolbar({
  q,
  category,
  sort,
  chips,
}: {
  q: string;
  category: string;
  sort: string;
  chips: ChipOption[]; // value "" = all
}) {
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
    <div className="bg-toolbar">
      <div className="container">
        <div className="bg-toolbar-inner">
          <div className="bg-search">
            <BSearch />
            <input type="text" placeholder="Search articles, topics, engineers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="bg-chips-wrap">
            {chips.map((c) => (
              <button key={c.value || "all"} className={`bg-chip ${category === c.value ? "active" : ""}`} onClick={() => apply({ category: c.value })}>
                {c.label} <span className="count">{c.count}</span>
              </button>
            ))}
          </div>
          <div className="bg-sort">
            <select value={sort || "latest"} onChange={(e) => apply({ sort: e.target.value })}>
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
