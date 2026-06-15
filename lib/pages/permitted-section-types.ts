import type { PageKey, SectionType } from '@prisma/client'

// The permitted SectionType set per Page (SRS §8.4 / BR-2). `pages-be-2` enforces
// this when a section is added or a page's sections are replaced. Keys are the
// Prisma PageKey enum members (underscore form); the public/API key is the hyphenated
// @map'd label (`lets_collaborate` ↔ `lets-collaborate`).

export const PERMITTED_SECTION_TYPES: Record<PageKey, SectionType[]> = {
  home: [
    'hero',
    'expertise_cards',
    'stat_strip',
    'about_intro',
    'featured_projects',
    'featured_services',
    'featured_certifications',
    'logo_wall',
    'testimonials',
    'cta_banner',
    'network_strip',
    'insights_strip',
    'news_strip',
  ],
  about: [
    'hero',
    'story',
    'expertise_cards',
    'mvv',
    'timeline',
    'leadership_message',
    'why_us',
    'achievements',
    'clients_filterable',
    'final_cta',
    'cta_banner',
    'leadership_team',
    'culture',
  ],
  lets_collaborate: ['hero', 'trust_hook', 'intent_cards', 'contact_panel', 'final_cta', 'cta_banner'],
  projects_index: ['hero', 'stat_strip', 'featured_projects', 'cta_banner', 'final_cta'],
  services_index: ['hero', 'stat_strip', 'featured_services', 'cta_banner', 'final_cta'],
  blog_index: ['hero', 'stat_strip', 'cta_banner', 'final_cta'],
  news_index: ['hero', 'stat_strip', 'cta_banner', 'final_cta'],
  certifications_index: ['hero', 'stat_strip', 'featured_certifications', 'cta_banner', 'final_cta'],
}

/** Whether `type` is permitted on `pageKey` (BR-2). */
export function isSectionTypePermitted(pageKey: PageKey, type: SectionType): boolean {
  return PERMITTED_SECTION_TYPES[pageKey].includes(type)
}

/** Hyphenated public key (`lets-collaborate`) ↔ Prisma enum member (`lets_collaborate`). */
export function pageKeyToPublic(key: PageKey): string {
  return key.replace(/_/g, '-')
}
export function publicToPageKey(s: string): PageKey | null {
  const key = s.replace(/-/g, '_') as PageKey
  return key in PERMITTED_SECTION_TYPES ? key : null
}
