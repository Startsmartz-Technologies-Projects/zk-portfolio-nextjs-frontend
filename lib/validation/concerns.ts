import { z } from 'zod'

// Server-side validation for the Concerns admin API (concerns-be-2, SRS §12).
// Snake_case input keys per docs/api-contracts/concerns.md §2. `is_default` is set
// via the dedicated set-default action (single-default invariant), not these schemas.

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const contentStatusEnum = z.enum(['draft', 'published', 'archived'])

const factInput = z.object({ big: z.string().min(1), label: z.string().min(1), sub: z.string().nullish() })
const serviceInput = z.object({ icon: z.string().nullish(), title: z.string().min(1), copy: z.string().nullish() })
const whyInput = z.object({ number: z.string().nullish(), title: z.string().min(1), copy: z.string().nullish() })
const showcaseInput = z.object({ title: z.string().min(1), location: z.string().nullish(), category: z.string().nullish(), summary: z.string().nullish(), image_id: z.string().uuid().nullish() })
const processInput = z.object({ step: z.string().nullish(), title: z.string().min(1), copy: z.string().nullish() })
const galleryInput = z.object({ media_id: z.string().uuid(), caption: z.string().nullish() })
const faqInput = z.object({ question: z.string().min(1), answer: z.string().nullish() })

export const seoMetaInput = z.object({
  meta_title: z.string().max(60).nullish(),
  meta_description: z.string().max(160).nullish(),
  canonical_url: z.string().url().nullish(),
  og_image_id: z.string().uuid().nullish(),
  og_title: z.string().nullish(),
  og_description: z.string().nullish(),
  noindex: z.boolean().nullish(),
})

const concernFields = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().regex(SLUG_RE, 'slug must be lowercase, hyphenated'),
  short: z.string().nullish(),
  tagline: z.string().nullish(),
  intro: z.string().nullish(),
  established_year: z.number().int().min(1900).max(new Date().getFullYear()).nullish(),
  code: z.string().nullish(),
  hero_image_id: z.string().uuid().nullish(),
  position: z.number().int().min(0),
  overview_title: z.string().nullish(),
  overview_body: z.array(z.string()),
  overview_mission: z.string().nullish(),
  facts: z.array(factInput),
  services: z.array(serviceInput),
  why: z.array(whyInput),
  showcase: z.array(showcaseInput),
  process: z.array(processInput),
  gallery: z.array(galleryInput),
  faqs: z.array(faqInput),
  seo: seoMetaInput,
})

export const createConcernSchema = concernFields.partial().required({ name: true })
export type CreateConcernInput = z.infer<typeof createConcernSchema>

export const updateConcernSchema = concernFields.partial()
export type UpdateConcernInput = z.infer<typeof updateConcernSchema>

export const listConcernsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  contentStatus: contentStatusEnum.optional(),
  includeDeleted: z.coerce.boolean().optional(),
})
export type ListConcernsInput = z.infer<typeof listConcernsSchema>

export const orderSchema = z.object({ ordered_ids: z.array(z.string().uuid()) })
export type OrderInput = z.infer<typeof orderSchema>
