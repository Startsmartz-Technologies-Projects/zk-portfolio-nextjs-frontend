"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import type { TermRef } from "@/lib/data/site";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { TaxonomySelector } from "@/src/components/admin/taxonomy-selector/taxonomy-selector";
import {
  CLIENT_TYPES,
  CONTENT_STATUSES,
  CONTENT_STATUS_BADGE,
  DELIVERY_STATUSES,
  SORTS,
  SORT_LABELS,
  type Sort,
} from "./types";

const ALL = "__all";

export interface ListFilters {
  q: string;
  category: string | null; // term slug
  location: string | null; // term slug
  clientType: string | null;
  deliveryStatus: string | null;
  contentStatus: string | null;
  featured: boolean;
  sort: Sort;
}

export interface ProjectListToolbarProps {
  filters: ListFilters;
  /** Patch one or more filter keys; the host re-syncs the URL + reloads. */
  onChange: (patch: Partial<ListFilters>) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export function ProjectListToolbar({
  filters,
  onChange,
  onClearAll,
  hasActiveFilters,
}: ProjectListToolbarProps) {
  // Local search text so typing is responsive; the host debounces the actual query.
  const [search, setSearch] = React.useState(filters.q);

  // Keep the local box in sync if the URL/query is changed elsewhere (e.g. Clear all).
  React.useEffect(() => {
    setSearch(filters.q);
  }, [filters.q]);

  React.useEffect(() => {
    if (search === filters.q) return;
    const t = setTimeout(() => onChange({ q: search }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, locations…"
            aria-label="Search projects"
            className="pl-8"
          />
        </div>

        <div className="w-40">
          <Select
            value={filters.sort}
            onValueChange={(v) => onChange({ sort: v as Sort })}
          >
            <SelectTrigger aria-label="Sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Category + location via the shared taxonomy-selector in filter mode. */}
        <div className="w-48">
          <TaxonomySelector
            vocabularySlug="projects-category"
            fieldNoun="category"
            placeholder="All categories"
            value={
              filters.category
                ? ({ id: filters.category, slug: filters.category, label: filters.category } as TermRef)
                : null
            }
            onChange={(term) => onChange({ category: term?.slug ?? null })}
          />
        </div>
        <div className="w-48">
          <TaxonomySelector
            vocabularySlug="location"
            fieldNoun="location"
            placeholder="All locations"
            value={
              filters.location
                ? ({ id: filters.location, slug: filters.location, label: filters.location } as TermRef)
                : null
            }
            onChange={(term) => onChange({ location: term?.slug ?? null })}
          />
        </div>

        <EnumFilter
          label="Client type"
          value={filters.clientType}
          options={CLIENT_TYPES.map((v) => ({ value: v, label: v }))}
          onChange={(v) => onChange({ clientType: v })}
        />
        <EnumFilter
          label="Delivery"
          value={filters.deliveryStatus}
          options={DELIVERY_STATUSES.map((v) => ({ value: v, label: v }))}
          onChange={(v) => onChange({ deliveryStatus: v })}
        />
        <EnumFilter
          label="Status"
          value={filters.contentStatus}
          options={CONTENT_STATUSES.map((v) => ({
            value: v,
            label: CONTENT_STATUS_BADGE[v].label,
          }))}
          onChange={(v) => onChange({ contentStatus: v })}
        />

        <Button
          type="button"
          variant={filters.featured ? "secondary" : "outline"}
          size="sm"
          aria-pressed={filters.featured}
          onClick={() => onChange({ featured: !filters.featured })}
        >
          Featured only
        </Button>

        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onClearAll} className="gap-1">
            <X className="h-4 w-4" /> Clear all
          </Button>
        )}
      </div>
    </div>
  );
}

function EnumFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="w-40">
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? null : v)}
      >
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
