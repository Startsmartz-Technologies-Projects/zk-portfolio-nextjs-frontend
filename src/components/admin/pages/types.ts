import type { listPages, getPage } from "@/lib/data/pages";
import type { SectionType } from "@prisma/client";

export type PageListItem = Awaited<ReturnType<typeof listPages>>["data"][number];
export type PageAdmin = Awaited<ReturnType<typeof getPage>>;
export type SectionAdmin = PageAdmin["sections"][number];
export type SectionItemAdmin = SectionAdmin["items"][number];

export type { SectionType };

// Human labels for the section types (the builder's add-menu + section rows).
export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  expertise_cards: "Expertise cards",
  stat_strip: "Stat strip",
  about_intro: "About intro",
  featured_projects: "Featured projects",
  featured_services: "Featured services",
  featured_certifications: "Featured certifications",
  logo_wall: "Logo wall",
  testimonials: "Testimonials",
  cta_banner: "CTA banner",
  story: "Story",
  mvv: "Mission / Vision / Values",
  timeline: "Timeline",
  leadership_message: "Leadership message",
  why_us: "Why us",
  achievements: "Achievements",
  clients_filterable: "Clients (filterable)",
  final_cta: "Final CTA",
  intent_cards: "Intent cards",
  trust_hook: "Trust hook",
  contact_panel: "Contact panel",
  network_strip: "Network strip",
  insights_strip: "Insights strip",
  news_strip: "News strip",
  leadership_team: "Leadership team",
  culture: "Culture",
};

export function sectionLabel(type: string): string {
  return SECTION_LABELS[type] ?? type;
}

/** Section types that resolve their item values from SITE (read-only stat items). */
export const STAT_SECTION_TYPES: SectionType[] = ["stat_strip", "achievements"];

/** Section types whose records come from a collection feed (chrome + source_key + max_items, no items). */
export const COLLECTION_SECTION_TYPES: SectionType[] = [
  "featured_projects",
  "featured_services",
  "featured_certifications",
  "network_strip",
  "insights_strip",
  "news_strip",
];

/**
 * Canonical feed key per collection section type. `source_key` is system-determined and
 * read-only in the editor (SRS §8), so a newly-added collection section must be stamped with
 * its feed key here — otherwise publish fails ("source_key required") with no UI remedy.
 * Mirrors prisma/seed/pages.seed.ts; keep in sync if a feed key changes.
 */
export const COLLECTION_SOURCE_KEYS: Partial<Record<SectionType, string>> = {
  featured_projects: "projects.featured",
  featured_services: "services.featured",
  featured_certifications: "certifications.home-seals",
  network_strip: "concerns.published",
  insights_strip: "blog.featured",
  news_strip: "news.featured",
};

/**
 * Which editable fields a section type actually exposes in the editor. The default
 * (any type not listed) shows every chrome + item field. Each entry below lists ONLY the
 * fields the public renderer (src/components/pages/section-renderer.tsx) actually outputs
 * for that section type — so admins aren't shown inputs that have no effect on the live page.
 *
 * Derived field-by-field from the renderer. Two renderer quirks are honoured here:
 *  - the "eyebrow" microlabel reads `eyebrow ?? subheading`, and
 *  - `SectionHead`'s right-column lede reads `subheading ?? body`.
 * So where either of a fallback pair feeds a rendered slot, BOTH are kept (seeded content
 * stores the same copy in different keys across pages).
 *
 * NOTE: `cta` covers both primary + secondary CTAs. Fields rendered only from `settings`
 * (hero ticker/accent, about overlay, leadership quote/signature, story badge, mvv values,
 * testimonial initials) have no first-class editor input today and are unaffected by this map.
 * Stat sections (stat_strip, achievements) use the stat item editor and collection sections
 * (featured_*) use the collection editor; the `item` list here only affects the regular item
 * editor, but `chrome` still applies to those types.
 */
export type SectionChromeField =
  | "eyebrow"
  | "heading"
  | "subheading"
  | "body"
  | "background_image"
  | "cta";
export type SectionItemField =
  | "image"
  | "title"
  | "subtitle"
  | "tag"
  | "body"
  | "icon"
  | "link";

export interface SectionFieldConfig {
  /** Section-level (chrome) fields to show. Omit to show all. */
  chrome?: SectionChromeField[];
  /** Per-item fields to show. Omit to show all. */
  item?: SectionItemField[];
}

export const SECTION_FIELD_CONFIG: Partial<Record<SectionType, SectionFieldConfig>> = {
  // hero: eyebrow/subheading microlabel, heading, body lede, bg image, both CTAs; items = title + subtitle.
  hero: { chrome: ["eyebrow", "heading", "subheading", "body", "background_image", "cta"], item: ["title", "subtitle"] },
  // about_intro: eyebrow/subheading, heading, body lead, bg image, primary CTA; item bullets = title only.
  about_intro: { chrome: ["eyebrow", "heading", "subheading", "body", "background_image", "cta"], item: ["title"] },
  // expertise_cards: SectionHead (eyebrow/heading/subheading/body); items = image, tag, title, body, link.
  expertise_cards: { chrome: ["eyebrow", "heading", "subheading", "body"], item: ["image", "tag", "title", "body", "link"] },
  // stat_strip: SectionHead chrome only; items handled by the stat editor (no item-field config needed).
  stat_strip: { chrome: ["eyebrow", "heading", "subheading", "body"] },
  // featured_* (collection): SectionHead + primary CTA; records come from the feed, not items.
  featured_projects: { chrome: ["eyebrow", "heading", "subheading", "body", "cta"] },
  featured_services: { chrome: ["eyebrow", "heading", "subheading", "body", "cta"] },
  featured_certifications: { chrome: ["eyebrow", "heading", "subheading", "body", "cta"] },
  // logo_wall: eyebrow/subheading + heading only; items = title (the logo text).
  logo_wall: { chrome: ["eyebrow", "heading", "subheading"], item: ["title"] },
  // testimonials: eyebrow/subheading, heading, body intro; items = body (quote) + title (author) + subtitle (role).
  // subtitle has no editor input → items keep title + body.
  testimonials: { chrome: ["eyebrow", "heading", "subheading", "body"], item: ["title", "body"] },
  // cta_banner: eyebrow, heading, body, bg image, both CTAs; items = title + subtitle feature chips.
  cta_banner: { chrome: ["eyebrow", "heading", "body", "background_image", "cta"], item: ["title"] },
  // final_cta: eyebrow, heading, body, both CTAs; no items.
  final_cta: { chrome: ["eyebrow", "heading", "body", "cta"], item: [] },
  // story: eyebrow/subheading, heading, body, primary CTA; items = image (collage) + value/title (stats).
  // value has no plain-item input; image + title are the editable item fields used.
  story: { chrome: ["eyebrow", "heading", "subheading", "body", "cta"], item: ["image", "title"] },
  // mvv: SectionHead; items = icon, title, body (values come from item.meta — no editor input).
  mvv: { chrome: ["eyebrow", "heading", "subheading", "body"], item: ["icon", "title", "body"] },
  // timeline: eyebrow/subheading, heading, body; items = value(year)/title/body — value has no plain input.
  timeline: { chrome: ["eyebrow", "heading", "subheading", "body"], item: ["title", "body"] },
  // leadership_message: eyebrow/subheading, heading, body, portrait (bg image); quote/signature live in settings.
  leadership_message: { chrome: ["eyebrow", "heading", "subheading", "body", "background_image"], item: [] },
  // why_us: SectionHead; items = icon, title, body/subtitle.
  why_us: { chrome: ["eyebrow", "heading", "subheading", "body"], item: ["icon", "title", "body"] },
  // achievements: eyebrow/subheading + heading; items handled by the stat editor.
  achievements: { chrome: ["eyebrow", "heading", "subheading"] },
  // clients_filterable: eyebrow/subheading + heading; items = tag (sector) + title (client name).
  clients_filterable: { chrome: ["eyebrow", "heading", "subheading"], item: ["tag", "title"] },
  // trust_hook: heading only; items = title (the trust chips).
  trust_hook: { chrome: ["heading"], item: ["title"] },
  // intent_cards: SectionHead; items = icon, title, body.
  intent_cards: { chrome: ["eyebrow", "heading", "subheading", "body"], item: ["icon", "title", "body"] },
  // contact_panel: SectionHead only; contact values come from SITE, not items.
  contact_panel: { chrome: ["eyebrow", "heading", "subheading", "body"], item: [] },
};
