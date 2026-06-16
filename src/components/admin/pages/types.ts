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
