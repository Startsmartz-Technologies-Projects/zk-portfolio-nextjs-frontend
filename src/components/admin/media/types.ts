import type { toAdminView, MediaRef } from "@/lib/data/media";

/** Admin view of a MediaAsset (lib/data/media `toAdminView`). */
export type MediaAssetView = ReturnType<typeof toAdminView>;

export type ResourceType = "image" | "document";

/** What the picker hands back to the host field on confirm (FR-MEDIA-018). */
export interface ConfirmedMedia {
  ref: MediaRef;
  alt_present: boolean;
  /** Convenience fields for the host placeholder/thumbnail. */
  id: string;
  url: string;
  resource_type: ResourceType;
  title: string | null;
  original_filename: string | null;
}

export interface MediaPickerOptions {
  /** Constrain selection; `undefined` allows both. */
  resourceType?: ResourceType;
  multiple?: boolean;
  /** Header title override (else mode-aware default). */
  title?: string;
}

/** Build the denormalized MediaRef + confirm payload from an admin view. */
export function toConfirmed(v: MediaAssetView): ConfirmedMedia {
  const ref =
    v.resource_type === "image"
      ? { id: v.id, url: v.url, alt: v.alt_text, width: v.width, height: v.height }
      : {
          id: v.id,
          url: v.url,
          format: v.format,
          original_filename: v.original_filename,
          bytes: v.bytes,
        };
  return {
    ref,
    alt_present: v.alt_present,
    id: v.id,
    url: v.url,
    resource_type: v.resource_type as ResourceType,
    title: v.title,
    original_filename: v.original_filename,
  };
}

/** Human-readable byte size (foundations §9 / MEDIA §12). */
export function humanBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
