import { z } from "zod";

import type { MediaRef } from "@/lib/data/media";

// The SEO sub-object the seo-sidebar binds to (camelCase keys; ogImage = MediaAsset id).
// Shared by every module editor so the form↔server SEO mapping is written once.

export const seoFormSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  canonicalUrl: z.string(),
  ogImage: z.string().nullable(),
  ogTitle: z.string(),
  ogDescription: z.string(),
  noindex: z.boolean(),
});

export type SeoFormValues = z.infer<typeof seoFormSchema>;

export function emptySeo(): SeoFormValues {
  return {
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    ogImage: null,
    ogTitle: "",
    ogDescription: "",
    noindex: false,
  };
}

/** The snake_case SEO embed shape returned by the data-layer serializers. */
export interface SeoDetail {
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: MediaRef | null;
  og_title: string | null;
  og_description: string | null;
  noindex: boolean;
}

export function seoFromDetail(seo: SeoDetail | undefined | null): SeoFormValues {
  if (!seo) return emptySeo();
  return {
    metaTitle: seo.meta_title ?? "",
    metaDescription: seo.meta_description ?? "",
    canonicalUrl: seo.canonical_url ?? "",
    ogImage: seo.og_image?.id ?? null,
    ogTitle: seo.og_title ?? "",
    ogDescription: seo.og_description ?? "",
    noindex: seo.noindex,
  };
}

const blank = (s: string): string | null => (s.trim() ? s.trim() : null);

export function seoToInput(seo: SeoFormValues) {
  return {
    meta_title: blank(seo.metaTitle),
    meta_description: blank(seo.metaDescription),
    canonical_url: blank(seo.canonicalUrl),
    og_image_id: seo.ogImage ?? null,
    og_title: blank(seo.ogTitle),
    og_description: blank(seo.ogDescription),
    noindex: seo.noindex,
  };
}

/** Resolve the og_image thumbnail URL from a SeoDetail (for the sidebar's initial value). */
export function ogImageUrl(seo: SeoDetail | undefined | null): string | null {
  return seo?.og_image && "url" in seo.og_image ? seo.og_image.url : null;
}
