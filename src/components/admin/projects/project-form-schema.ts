import { z } from "zod";

import type { TermRef } from "@/lib/data/site";
import type { ProjectDetail } from "./types";
import {
  BADGE_STYLES,
  CLIENT_TYPES,
  DELIVERY_STATUSES,
} from "./types";

// The Project editor's form model (ADR 0002). It mirrors the shared server Zod schema
// (lib/validation/projects) but uses UI-convenient shapes the Wave-1 components expect:
//   • category/location as TermRef objects (taxonomy-selector is controlled)
//   • cover/gallery/og as { id, url } so the picker can render thumbnails
//   • SEO under camelCase keys matching seo-sidebar's field paths (seo.metaTitle, …)
// `toServerInput` converts this to the snake_case create/update input on submit;
// `fromDetail` builds it from a loaded record. Only `title` is required to first save.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const termRefSchema = z
  .object({ id: z.string(), slug: z.string(), label: z.string() })
  .nullable();

const mediaPickSchema = z
  .object({ id: z.string(), url: z.string().nullable() })
  .nullable();

// Every field is always populated by emptyForm()/fromDetail(), so we keep plain,
// non-optional shapes (no `.default()`) — that keeps the Zod input and output types
// identical, which the react-hook-form resolver requires.
const scopeSchema = z.object({
  icon: z.string(),
  value: z.string(),
  title: z.string().min(1, "Enter a title."),
  description: z.string(),
});

const highlightSchema = z.object({
  number: z.string(),
  unit: z.string(),
  title: z.string().min(1, "Enter a title."),
  body: z.string(),
});

const galleryItemSchema = z.object({
  media_id: z.string(),
  url: z.string().nullable(),
  caption: z.string(),
});

const relatedItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  published: z.boolean(),
});

const serviceItemSchema = z.object({ value: z.string() });

export const projectFormSchema = z
  .object({
    title: z.string().min(1, "Enter a project title (max 160).").max(160, "Enter a project title (max 160)."),
    slug: z.string().regex(SLUG_RE, "That slug is taken — try another.").or(z.literal("")),
    summary: z.string().max(280, "Keep the summary under 280 characters."),

    category: termRefSchema,
    location: termRefSchema,
    locationDetail: z.string(),
    clientType: z.enum(CLIENT_TYPES).nullable(),
    deliveryStatus: z.enum(DELIVERY_STATUSES),
    startDate: z.string(), // yyyy-mm-dd
    endDate: z.string(),
    cover: mediaPickSchema,
    badgeText: z.string(),
    badgeStyle: z.enum(BADGE_STYLES),

    overviewTitle: z.string(),
    overviewBody: z.string(),
    pullQuote: z.string(),
    client: z.string(),

    scopeDescription: z.string(),
    scopes: z.array(scopeSchema),
    highlightsDescription: z.string(),
    highlights: z.array(highlightSchema),

    galleryHeading: z.string(),
    galleryDescription: z.string(),
    gallery: z.array(galleryItemSchema).max(30, "Up to 30 gallery images."),

    caseStudyChallenge: z.string(),
    caseStudyApproach: z.string(),
    caseStudyResult: z.string(),
    ctaHeading: z.string(),
    servicesDelivered: z.array(serviceItemSchema),

    related: z.array(relatedItemSchema).max(3, "Pick up to 3 other published projects."),

    seo: z.object({
      metaTitle: z.string(),
      metaDescription: z.string(),
      canonicalUrl: z.string(),
      ogImage: z.string().nullable(), // MediaAsset id
      ogTitle: z.string(),
      ogDescription: z.string(),
      noindex: z.boolean(),
    }),
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.endDate && v.endDate < v.startDate) {
      ctx.addIssue({ path: ["endDate"], code: z.ZodIssueCode.custom, message: "End date can't be before start date." });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

/** A blank form for the New screen. */
export function emptyForm(): ProjectFormValues {
  return {
    title: "",
    slug: "",
    summary: "",
    category: null,
    location: null,
    locationDetail: "",
    clientType: null,
    deliveryStatus: "Completed",
    startDate: "",
    endDate: "",
    cover: null,
    badgeText: "",
    badgeStyle: "default",
    overviewTitle: "",
    overviewBody: "",
    pullQuote: "",
    client: "",
    scopeDescription: "",
    scopes: [],
    highlightsDescription: "",
    highlights: [],
    galleryHeading: "",
    galleryDescription: "",
    gallery: [],
    caseStudyChallenge: "",
    caseStudyApproach: "",
    caseStudyResult: "",
    ctaHeading: "",
    servicesDelivered: [],
    related: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      ogImage: null,
      ogTitle: "",
      ogDescription: "",
      noindex: false,
    },
  };
}

function dateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function refUrl(m: { url: string } | { withdrawn: true } | null): string | null {
  if (!m) return null;
  return "url" in m ? m.url : null;
}

/** Build the form values from a loaded ProjectDetail (the edit screen). */
export function fromDetail(p: ProjectDetail): ProjectFormValues {
  return {
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? "",
    category: p.category ? { id: p.category.id, slug: p.category.slug, label: p.category.label } : null,
    location: p.location ? { id: p.location.id, slug: p.location.slug, label: p.location.label } : null,
    locationDetail: p.location_detail ?? "",
    clientType: p.client_type ?? null,
    deliveryStatus: p.delivery_status,
    startDate: dateInput(p.start_date),
    endDate: dateInput(p.end_date),
    cover: p.cover_image ? { id: p.cover_image.id, url: refUrl(p.cover_image) } : null,
    badgeText: p.badge_text ?? "",
    badgeStyle: p.badge_style,
    overviewTitle: p.overview_title ?? "",
    overviewBody: p.overview_body ?? "",
    pullQuote: p.pull_quote ?? "",
    client: p.client ?? "",
    scopeDescription: p.scope_description ?? "",
    scopes: p.scopes.map((s) => ({
      icon: s.icon,
      value: s.value ?? "",
      title: s.title,
      description: s.description ?? "",
    })),
    highlightsDescription: p.highlights_description ?? "",
    highlights: p.highlights.map((h) => ({
      number: h.number ?? "",
      unit: h.unit ?? "",
      title: h.title,
      body: h.body ?? "",
    })),
    galleryHeading: p.gallery_heading ?? "",
    galleryDescription: p.gallery_description ?? "",
    gallery: p.gallery.map((g) => ({
      media_id: g.media.id,
      url: refUrl(g.media),
      caption: g.caption ?? "",
    })),
    caseStudyChallenge: p.case_study_challenge ?? "",
    caseStudyApproach: p.case_study_approach ?? "",
    caseStudyResult: p.case_study_result ?? "",
    ctaHeading: p.cta_heading ?? "",
    servicesDelivered: (p.services_delivered ?? []).map((value) => ({ value })),
    related: (p.related ?? []).map((r) => ({ id: r.id, title: r.title, published: true })),
    seo: {
      metaTitle: p.seo.meta_title ?? "",
      metaDescription: p.seo.meta_description ?? "",
      canonicalUrl: p.seo.canonical_url ?? "",
      ogImage: p.seo.og_image?.id ?? null,
      ogTitle: p.seo.og_title ?? "",
      ogDescription: p.seo.og_description ?? "",
      noindex: p.seo.noindex,
    },
  };
}

function blank(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

/** Convert the form values to the server create/update input (snake_case). */
export function toServerInput(v: ProjectFormValues) {
  return {
    title: v.title.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    summary: blank(v.summary),
    category_id: v.category?.id ?? null,
    location_id: v.location?.id ?? null,
    location_detail: blank(v.locationDetail),
    client_type: v.clientType,
    delivery_status: v.deliveryStatus,
    start_date: v.startDate || null,
    end_date: v.endDate || null,
    cover_image_id: v.cover?.id ?? null,
    badge_text: blank(v.badgeText),
    badge_style: v.badgeStyle,
    overview_title: blank(v.overviewTitle),
    overview_body: blank(v.overviewBody),
    pull_quote: blank(v.pullQuote),
    client: blank(v.client),
    scope_description: blank(v.scopeDescription),
    scopes: v.scopes.map((s) => ({
      icon: s.icon || "default",
      value: s.value ?? "",
      title: s.title,
      description: blank(s.description ?? ""),
    })),
    highlights_description: blank(v.highlightsDescription),
    highlights: v.highlights.map((h) => ({
      number: h.number ?? "",
      unit: blank(h.unit ?? ""),
      title: h.title,
      body: blank(h.body ?? ""),
    })),
    gallery_heading: blank(v.galleryHeading),
    gallery_description: blank(v.galleryDescription),
    gallery: v.gallery.map((g) => ({ media_id: g.media_id, caption: blank(g.caption ?? "") })),
    case_study_challenge: blank(v.caseStudyChallenge),
    case_study_approach: blank(v.caseStudyApproach),
    case_study_result: blank(v.caseStudyResult),
    cta_heading: blank(v.ctaHeading),
    services_delivered: v.servicesDelivered.map((s) => s.value).filter((s) => s.trim()),
    related_project_ids: v.related.map((r) => r.id),
    seo: {
      meta_title: blank(v.seo.metaTitle),
      meta_description: blank(v.seo.metaDescription),
      canonical_url: blank(v.seo.canonicalUrl),
      og_image_id: v.seo.ogImage ?? null,
      og_title: blank(v.seo.ogTitle),
      og_description: blank(v.seo.ogDescription),
      noindex: v.seo.noindex,
    },
  };
}
