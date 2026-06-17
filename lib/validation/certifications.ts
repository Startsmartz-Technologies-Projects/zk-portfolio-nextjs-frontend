import { z } from 'zod'

// Server-side validation for the Certifications admin API (certifications-be-2,
// SRS §12). Snake_case input keys per docs/api-contracts/certifications.md §2. The
// input `status` is the real-world CertStatus; the publishing workflow status
// (content_status) is managed by publish/unpublish, not set directly.

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const certStatusEnum = z.enum(['Active', 'Completed', 'Expired', 'Renewed'])
export const contentStatusEnum = z.enum(['draft', 'published', 'archived'])
export const toneEnum = z.enum(['paper', 'slate', 'cream'])
export const sealShapeEnum = z.enum(['round', 'hex'])
export const sortEnum = z.enum(['recent', 'title', 'expiry'])

const certFields = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(SLUG_RE, 'slug must be lowercase, hyphenated'),
  authority: z.string().nullish(),
  number: z.string().nullish(),
  category_id: z.string().uuid().nullish(),
  status: certStatusEnum,
  issued_date: z.coerce.date().nullish(),
  expiry_date: z.coerce.date().nullish(),
  description: z.string().nullish(),
  document_id: z.string().uuid().nullish(),
  tone: toneEnum,
  seal_shape: sealShapeEnum,
  show_on_home: z.boolean(),
  seal_label: z.string().nullish(),
  seal_id: z.string().nullish(),
  seal_validity: z.string().nullish(),
})

function refine<T extends { issued_date?: Date | null; expiry_date?: Date | null; show_on_home?: boolean; seal_label?: string | null }>(data: T, ctx: z.RefinementCtx): void {
  if (data.issued_date && data.expiry_date && data.expiry_date < data.issued_date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiry_date'], message: 'expiry_date must be on or after issued_date' })
  }
  if (data.show_on_home && !data.seal_label?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['seal_label'], message: 'seal_label is required when show_on_home is set' })
  }
}

export const createCertSchema = certFields.partial().required({ title: true }).superRefine(refine)
export type CreateCertInput = z.infer<typeof createCertSchema>

export const updateCertSchema = certFields.partial().superRefine(refine)
export type UpdateCertInput = z.infer<typeof updateCertSchema>

export const listCertsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  sort: sortEnum.optional(),
  category: z.string().optional(),
  status: certStatusEnum.optional(),
  contentStatus: contentStatusEnum.optional(),
  showOnHome: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional(),
})
export type ListCertsInput = z.infer<typeof listCertsSchema>

export const publicListCertsSchema = listCertsSchema.pick({ page: true, pageSize: true, q: true, sort: true, category: true, status: true })
export type PublicListCertsInput = z.infer<typeof publicListCertsSchema>

export const homeSealsSchema = z.object({ ordered_ids: z.array(z.string().uuid()) })
export type HomeSealsInput = z.infer<typeof homeSealsSchema>

export const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
})
export type BulkInput = z.infer<typeof bulkSchema>
