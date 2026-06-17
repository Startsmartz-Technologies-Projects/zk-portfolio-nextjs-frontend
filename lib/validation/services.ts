import { z } from 'zod'

// Server-side validation for the Services admin API (services-be-2, SRS §12).
// Snake_case input keys per the operations contract (docs/api-contracts/services.md §2).

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const contentStatusEnum = z.enum(['draft', 'published', 'archived'])

const metaInput = z.object({ key: z.string().min(1), value: z.string().min(1) })
const scopeInput = z.object({ icon: z.string().nullish(), title: z.string().min(1), body: z.string().nullish() })
const processInput = z.object({ tag: z.string().nullish(), title: z.string().min(1), body: z.string().nullish() })
const benefitInput = z.object({ icon: z.string().nullish(), title: z.string().min(1), body: z.string().nullish() })
const machineInput = z.object({ title: z.string().min(1), description: z.string().nullish() })
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

const serviceFields = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().regex(SLUG_RE, 'slug must be lowercase, hyphenated'),
  subtitle: z.string().nullish(),
  icon: z.string().nullish(),
  position: z.number().int().min(0),
  hero_image_id: z.string().uuid().nullish(),
  machine_image_id: z.string().uuid().nullish(),
  cta_image_id: z.string().uuid().nullish(),
  overview_title: z.string().nullish(),
  overview_lead: z.string().nullish(),
  overview_body: z.array(z.string()),
  overview_bullets: z.array(z.string()),
  scope_title: z.string().nullish(),
  scope_lead: z.string().nullish(),
  process_title: z.string().nullish(),
  process_lead: z.string().nullish(),
  benefits_title: z.string().nullish(),
  benefits_lead: z.string().nullish(),
  capability_title: z.string().nullish(),
  capability_lead: z.string().nullish(),
  capability_body_title: z.string().nullish(),
  capability_body_desc: z.string().nullish(),
  faq_title: z.string().nullish(),
  faq_lead: z.string().nullish(),
  meta: z.array(metaInput),
  scope: z.array(scopeInput),
  process: z.array(processInput),
  benefits: z.array(benefitInput),
  machine: z.array(machineInput),
  faq: z.array(faqInput),
  seo: seoMetaInput,
})

export const createServiceSchema = serviceFields.partial().required({ title: true })
export type CreateServiceInput = z.infer<typeof createServiceSchema>

export const updateServiceSchema = serviceFields.partial()
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>

export const listServicesSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  contentStatus: contentStatusEnum.optional(),
  includeDeleted: z.coerce.boolean().optional(),
})
export type ListServicesInput = z.infer<typeof listServicesSchema>

export const orderSchema = z.object({ ordered_ids: z.array(z.string().uuid()) })
export type OrderInput = z.infer<typeof orderSchema>

export const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
})
export type BulkInput = z.infer<typeof bulkSchema>
