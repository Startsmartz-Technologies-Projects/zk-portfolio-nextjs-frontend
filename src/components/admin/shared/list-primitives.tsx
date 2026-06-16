"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import type { MediaRef } from "@/lib/data/media";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";

// Shared building blocks for the admin collection list screens (Wave 2/3). Each module
// composes these so the table chrome, states, selection, thumbnails, and pagination
// stay consistent without re-implementing them per module.

/** A small cover/hero thumbnail; placeholder for a missing or withdrawn asset (BR-6). */
export function Thumb({
  media,
  alt,
  className,
}: {
  media: MediaRef | null | undefined;
  alt: string;
  className?: string;
}) {
  const url = media && "url" in media ? media.url : null;
  const withdrawn = !!media && "withdrawn" in media;
  return (
    <div
      className={cn(
        "flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/40",
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <ImageOff
          className="h-4 w-4 text-muted-foreground"
          aria-label={withdrawn ? "Image was removed" : "No image"}
        />
      )}
    </div>
  );
}

/** Tri-state row-selection checkbox (native, accessible — avoids a Radix dep). */
export function CheckboxCell({
  checked,
  onChange,
  label,
}: {
  checked: boolean | "indeterminate";
  onChange: (v: boolean) => void;
  label: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === "indeterminate";
  }, [checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      role="checkbox"
      aria-label={label}
      checked={checked === true}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 cursor-pointer rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

/** Skeleton rows for the loading state. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-10 w-14 rounded-md" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Centered empty / no-results / error panel. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon}
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

/** Server pagination control (prev/next + range readout). */
export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (next: number) => void;
}) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span className="tabular-nums">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <span className="tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/** Shared content-status badge variants. */
export const CONTENT_STATUS_BADGE: Record<
  "draft" | "published" | "archived",
  { variant: "draft" | "published" | "archived"; label: string }
> = {
  draft: { variant: "draft", label: "Draft" },
  published: { variant: "published", label: "Published" },
  archived: { variant: "archived", label: "Archived" },
};
