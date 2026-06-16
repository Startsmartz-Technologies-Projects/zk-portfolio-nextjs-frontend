"use client";
import * as React from "react";

// Client island: the About "clients_filterable" sector filter (pages-fe-public §A — interactivity
// preserved). Items carry a `tag` (sector) + `title` (client name); the chips filter by sector.

export type ClientItem = { id?: string; tag: string | null; title: string | null };

export function ClientsFilter({ items }: { items: ClientItem[] }) {
  const sectors = React.useMemo(() => {
    const set = new Set<string>();
    for (const c of items) if (c.tag) set.add(c.tag);
    return ["All", ...Array.from(set)];
  }, [items]);
  const [sector, setSector] = React.useState("All");
  const filtered = sector === "All" ? items : items.filter((c) => c.tag === sector);

  return (
    <>
      <div className="trust-sectors">
        {sectors.map((s) => (
          <button key={s} className={`ts-chip ${sector === s ? "active" : ""}`} onClick={() => setSector(s)}>
            {s}
            <span className="ts-count">{s === "All" ? items.length : items.filter((c) => c.tag === s).length}</span>
          </button>
        ))}
      </div>
      <div className="trust-logos">
        {filtered.map((c, i) => (
          <div key={c.id ?? `${c.title}-${i}`} className="trust-logo">
            <span>{c.title}</span>
          </div>
        ))}
      </div>
    </>
  );
}
