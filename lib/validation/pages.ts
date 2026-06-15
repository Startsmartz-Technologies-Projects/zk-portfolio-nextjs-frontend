import { z } from 'zod'

// Server-side validation for the Pages admin API (pages-be-2, SRS §12).
// Snake_case input keys per docs/api-contracts/pages.md §2.

const sectionTypeEnum = z.enum([
  'hero', 'expertise_cards', 'stat_strip', 'about_intro', 'featured_projects', 'featured_services',
  'featured_certifications', 'logo_wall', 'testimonials', 'cta_banner', 'story', 'mvv', 'timeline',
  'leadership_message', 'why_us', 'achievements', 'clients_filterable', 'final_cta', 'intent_cards',
  'trust_hook', 'contact_panel', 'network_strip', 'insights_strip', 'news_strip', 'leadership_team', 'culture',
])

const itemInput = z.object({
  icon: z.string().nullish(),
  image_id: z.string().uuid().nullish(),
  tag: z.string().nullish(),
  title: z.string().nullish(),
  subtitle: z.string().nullish(),
  body: z.string().nullish(),
  value: z.string().nullish(),
  unit: z.string().nullish(),
  stat_key: z.string().nullish(),
  is_active: z.boolean().nullish(),
  link_url: z.string().nullish(),
  link_label: z.string().nullish(),
  meta: z.unknown().nullish(),
})
export type ItemInput = z.infer<typeof itemInput>

const ctaInput = z.object({ label: z.string(), url: z.string() }).nullish()

const sectionChrome = {
  is_visible: z.boolean().optional(),
  eyebrow: z.string().nullish(),
  heading: z.string().nullish(),
  subheading: z.string().nullish(),
  body: z.string().nullish(),
  variant: z.string().nullish(),
  background_image_id: z.string().uuid().nullish(),
  cta_primary: ctaInput,
  cta_secondary: ctaInput,
  max_items: z.number().int().min(1).nullish(),
  source_key: z.string().nullish(),
  settings: z.unknown().nullish(),
}

const sectionInput = z.object({
  type: sectionTypeEnum,
  ...sectionChrome,
  items: z.array(itemInput).optional(),
})
export type SectionInput = z.infer<typeof sectionInput>

export const seoMetaInput = z.object({
  meta_title: z.string().max(60).nullish(),
  meta_description: z.string().max(160).nullish(),
  canonical_url: z.string().url().nullish(),
  og_image_id: z.string().uuid().nullish(),
  og_title: z.string().nullish(),
  og_description: z.string().nullish(),
  noindex: z.boolean().nullish(),
})

export const updatePageSchema = z.object({
  seo: seoMetaInput.optional(),
  sections: z.array(sectionInput).optional(),
})
export type UpdatePageInput = z.infer<typeof updatePageSchema>

export const addSectionSchema = z.object({ type: sectionTypeEnum, position: z.number().int().min(0).optional() })
export type AddSectionInput = z.infer<typeof addSectionSchema>

export const updateSectionSchema = z.object(sectionChrome)
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>

export const reorderSectionsSchema = z.object({ ordered_ids: z.array(z.string().uuid()) })
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>

export const replaceItemsSchema = z.object({ items: z.array(itemInput) })
export type ReplaceItemsInput = z.infer<typeof replaceItemsSchema>
