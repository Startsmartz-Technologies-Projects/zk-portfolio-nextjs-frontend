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

/**
 * Computed metrics the public stat resolver derives (NOT stored as CompanyStat rows):
 * years_experience (from establishment year), projects_count + districts_covered (from
 * published projects). See lib/data/pages buildStatResolver. Always offered in stat pickers.
 */
export const COMPUTED_STAT_KEYS = ["years_experience", "projects_count", "districts_covered"];

/**
 * Static fallback list of stat-picker keys (computed metrics + the seeded CompanyStat keys).
 * Prefer the live list built by `statKeyOptions(companyStatKeys)` — the editor threads the
 * actual CompanyStat keys from Site Settings so newly-added stats are selectable. This constant
 * is the fallback when no live list is provided.
 */
export const STAT_KEYS = [
  ...COMPUTED_STAT_KEYS,
  "team_size",
  "client_confidence_pct",
  "on_schedule_pct",
];

/** Build the stat-picker option list: computed metrics first, then the live CompanyStat keys
 *  (deduped, computed keys never repeated even if a CompanyStat row shares the name). */
export function statKeyOptions(companyStatKeys: string[]): string[] {
  const seen = new Set(COMPUTED_STAT_KEYS);
  const extra = companyStatKeys.filter((k) => !seen.has(k));
  return [...COMPUTED_STAT_KEYS, ...extra];
}

/**
 * Valid `icon` (kind) values for item icon pickers — the keys of the `shapes` map in SvcIcon
 * (src/components/site-ui.tsx). An unknown value silently falls back to the `building` icon, so
 * the editor offers these as a dropdown. KEEP IN SYNC with SvcIcon's `shapes`.
 */
export const SVC_ICON_KINDS = [
  "building",
  "road",
  "bridge",
  "earth",
  "drain",
  "concrete",
  "foundation",
  "renov",
  "finish",
  "special",
  "equip",
] as const;

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
 * Derived field-by-field from the renderer. The renderer reads `subheading` two ways, and BOTH
 * are now consolidated onto a single first-class field so admins never see two inputs feeding
 * one rendered slot:
 *  - the "eyebrow" microlabel reads `eyebrow ?? subheading` → on those sections (hero,
 *    about_intro, story, timeline, …) only `eyebrow` is exposed; subheading-only labels were
 *    migrated into `eyebrow`.
 *  - `SectionHead`'s right-column lede reads `subheading ?? body` → on those sections
 *    (stat_strip, expertise_cards, featured_*, mvv, why_us, intent_cards, contact_panel) only
 *    `body` is exposed as the lede.
 * So `subheading` is no longer exposed by any config (the type member is kept for forward use).
 *
 * NOTE: `cta_primary`/`cta_secondary` are separate flags — a section lists only the CTA
 * buttons its renderer actually outputs (e.g. story/about_intro/featured_* render the primary
 * button only). Fields rendered only from `settings`
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
  | "cta_primary"
  | "cta_secondary";
export type SectionItemField =
  | "image"
  | "title"
  | "subtitle"
  | "tag"
  | "body"
  | "icon"
  | "link"
  | "value" // a plain item value — e.g. the Timeline step's year (renderer reads `value`)
  | "is_active"; // the Timeline "current step" highlight (renderer reads `is_active`)

export interface SectionFieldConfig {
  /** Section-level (chrome) fields to show. Omit to show all. */
  chrome?: SectionChromeField[];
  /** Per-item fields to show. Omit to show all. */
  item?: SectionItemField[];
}

export const SECTION_FIELD_CONFIG: Partial<Record<SectionType, SectionFieldConfig>> = {
  // hero: eyebrow microlabel, heading, body lede, bg image, both CTAs; items = title + subtitle.
  hero: { chrome: ["eyebrow", "heading", "body", "background_image", "cta_primary", "cta_secondary"], item: ["title", "subtitle"] },
  // about_intro: eyebrow, heading, body lead, bg image, primary CTA only; item bullets = title only.
  about_intro: { chrome: ["eyebrow", "heading", "body", "background_image", "cta_primary"], item: ["title"] },
  // expertise_cards: SectionHead (eyebrow/heading + body lede); items = image, tag, title, body, link.
  expertise_cards: { chrome: ["eyebrow", "heading", "body"], item: ["image", "tag", "title", "body", "link"] },
  // stat_strip: SectionHead chrome only; items handled by the stat editor (no item-field config needed).
  stat_strip: { chrome: ["eyebrow", "heading", "body"] },
  // featured_* (collection): SectionHead + primary CTA only; records come from the feed, not items.
  featured_projects: { chrome: ["eyebrow", "heading", "body", "cta_primary"] },
  featured_services: { chrome: ["eyebrow", "heading", "body", "cta_primary"] },
  featured_certifications: { chrome: ["eyebrow", "heading", "body", "cta_primary"] },
  // logo_wall: eyebrow + heading only; items = title (the logo text).
  logo_wall: { chrome: ["eyebrow", "heading"], item: ["title"] },
  // testimonials: eyebrow, heading, body intro; items = body (quote) + title (author) + subtitle (role).
  // subtitle has no editor input → items keep title + body.
  testimonials: { chrome: ["eyebrow", "heading", "body"], item: ["title", "body"] },
  // cta_banner: eyebrow, heading, body, bg image, both CTAs; items = title + subtitle feature chips.
  cta_banner: { chrome: ["eyebrow", "heading", "body", "background_image", "cta_primary", "cta_secondary"], item: ["title"] },
  // final_cta: eyebrow, heading, body, both CTAs; no items.
  final_cta: { chrome: ["eyebrow", "heading", "body", "cta_primary", "cta_secondary"], item: [] },
  // story: eyebrow, heading, body, primary CTA only. Items (collage photos + stats) are managed
  // by the dedicated StoryItemsEditor, not the generic item editor, so `item` is unused here.
  story: { chrome: ["eyebrow", "heading", "body", "cta_primary"] },
  // mvv: SectionHead; items = icon, title, body (values come from item.meta — no editor input).
  mvv: { chrome: ["eyebrow", "heading", "body"], item: ["icon", "title", "body"] },
  // timeline: eyebrow, heading, body; items = year (value) + title + body + active-step toggle.
  timeline: { chrome: ["eyebrow", "heading", "body"], item: ["value", "title", "body", "is_active"] },
  // leadership_message: eyebrow, heading, body, portrait (bg image); quote/signature live in settings.
  leadership_message: { chrome: ["eyebrow", "heading", "body", "background_image"], item: [] },
  // why_us: SectionHead; items = icon, title, body/subtitle.
  why_us: { chrome: ["eyebrow", "heading", "body"], item: ["icon", "title", "body"] },
  // achievements: eyebrow + heading; items handled by the stat editor.
  achievements: { chrome: ["eyebrow", "heading"] },
  // clients_filterable: eyebrow + heading; items = tag (sector) + title (client name).
  clients_filterable: { chrome: ["eyebrow", "heading"], item: ["tag", "title"] },
  // trust_hook: heading only; items = title (the trust chips).
  trust_hook: { chrome: ["heading"], item: ["title"] },
  // intent_cards: SectionHead; items = icon, title, body.
  intent_cards: { chrome: ["eyebrow", "heading", "body"], item: ["icon", "title", "body"] },
  // contact_panel: SectionHead only; contact values come from SITE, not items.
  contact_panel: { chrome: ["eyebrow", "heading", "body"], item: [] },
};
