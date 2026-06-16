"use client";

import { ImageOff } from "lucide-react";

import type { MediaRef } from "@/lib/data/media";
import { cn } from "@/src/lib/utils";

/**
 * A small cover thumbnail for list/card/featured rows. Renders a placeholder for a
 * missing or withdrawn asset (BR-6 / edge: withdrawn cover) so the row still renders.
 */
export function CoverThumb({
  cover,
  alt,
  className,
}: {
  cover: MediaRef | null | undefined;
  alt: string;
  className?: string;
}) {
  const url = cover && "url" in cover ? cover.url : null;
  const withdrawn = !!cover && "withdrawn" in cover;

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
          aria-label={withdrawn ? "Cover image was removed" : "No cover image"}
        />
      )}
    </div>
  );
}
