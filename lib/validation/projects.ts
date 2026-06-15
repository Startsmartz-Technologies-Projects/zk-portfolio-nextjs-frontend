import { z } from 'zod'

// Server-side validation for the Projects admin API (projects-be-2, SRS §12).
// Input keys are snake_case to match the operations contract (docs/api-contracts/
// projects.md §2); the data layer maps them to the Prisma camelCase columns.

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const clientTypeEnum = z.enum(['Government', 'Commercial', 'Private'])
export const deliveryStatusEnum = z.enum(['Completed', 'Ongoing', 'Planning'])
export const contentStatusEnum = z.enum(['draft', 'published', 'archived'])
export const badgeStyleEnum = z.enum(['default', 'lime', 'black', 'gold'])
export const sortEnum = z.enum(['recent', 'oldest', 'title', 'featured'])

const scopeInput = z.object({
  icon: z.string().min(1),
  value: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullish(),
})

const highlightInput = z.object({
  number: z.string().optional(),
  unit: z.string().nullish(),
  title: z.string().min(1),
  body: z.string().nullish(),
})

const galleryInput = z.object({
  media_id: z.string().uuid(),
  caption: z.string().nullish(),
})

export const seoMetaInput = z.object({
  meta_title: z.string().max(60).nullish(),
  meta_description: z.string().max(160).nullish(),
  canonical_url: z.string().url().nullish(),
  og_image_id: z.string().uuid().nullish(),
  og_title: z.string().nullish(),
  og_description: z.string().nullish(),
  noindex: z.boolean().nullish(),
})

// The full editable field set; create requires only `title`, update is partial.
const projectFields = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().regex(SLUG_RE, 'slug must be lowercase, hyphenated'),
  summary: z.string().max(280).nullish(),
  category_id: z.string().uuid().nullish(),
  location_id: z.string().uuid().nullish(),
  location_detail: z.string().nullish(),
  client_type: clientTypeEnum.nullish(),
  delivery_status: deliveryStatusEnum,
  start_date: z.coerce.date().nullish(),
  end_date: z.coerce.date().nullish(),
  cover_image_id: z.string().uuid().nullish(),
  badge_text: z.string().nullish(),
  badge_style: badgeStyleEnum,
  featured: z.boolean(),
  client: z.string().nullish(),
  overview_title: z.string().nullish(),
  overview_body: z.string().nullish(),
  pull_quote: z.string().nullish(),
  services_delivered: z.array(z.string()),
  scope_description: z.string().nullish(),
  gallery_heading: z.string().nullish(),
  gallery_description: z.string().nullish(),
  highlights_description: z.string().nullish(),
  case_study_challenge: z.string().nullish(),
  case_study_approach: z.string().nullish(),
  case_study_result: z.string().nullish(),
  cta_heading: z.string().nullish(),
  scopes: z.array(scopeInput),
  highlights: z.array(highlightInput),
  gallery: z.array(galleryInput).max(30),
  related_project_ids: z.array(z.string().uuid()).max(3),
  seo: seoMetaInput,
})

/** end_date ≥ start_date when both present (§12). Shared refinement. */
function refineDates<T extends { start_date?: Date | null; end_date?: Date | null }>(
  data: T,
  ctx: z.RefinementCtx,
): void {
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['end_date'], message: 'end_date must be on or after start_date' })
  }
}

export const createProjectSchema = projectFields
  .partial()
  .required({ title: true })
  .superRefine(refineDates)
export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = projectFields.partial().superRefine((data, ctx) => {
  refineDates(data, ctx)
  if (data.related_project_ids) {
    const set = new Set(data.related_project_ids)
    if (set.size !== data.related_project_ids.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['related_project_ids'], message: 'related_project_ids must be distinct' })
    }
  }
})
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

export const listProjectsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  sort: sortEnum.optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  clientType: clientTypeEnum.optional(),
  deliveryStatus: deliveryStatusEnum.optional(),
  contentStatus: contentStatusEnum.optional(),
  featured: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional(),
})
export type ListProjectsInput = z.infer<typeof listProjectsSchema>

export const publicListProjectsSchema = listProjectsSchema.pick({
  page: true,
  pageSize: true,
  q: true,
  sort: true,
  category: true,
  location: true,
  clientType: true,
  deliveryStatus: true,
})
export type PublicListProjectsInput = z.infer<typeof publicListProjectsSchema>

export const featuredSchema = z.object({ ordered_ids: z.array(z.string().uuid()) })
export type FeaturedInput = z.infer<typeof featuredSchema>

export const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
})
export type BulkInput = z.infer<typeof bulkSchema>
