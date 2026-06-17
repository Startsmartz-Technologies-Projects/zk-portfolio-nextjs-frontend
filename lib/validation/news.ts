import { z } from 'zod'

// Server-side validation for the News admin API (news-be-2, SRS §12).
// Snake_case input keys per the operations contract (docs/api-contracts/news.md §2).

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const contentStatusEnum = z.enum(['draft', 'published', 'archived'])
export const sortEnum = z.enum(['latest', 'oldest', 'featured'])

// ── Flat body block document (§2.3) ─────────────────────────────────────────

const blockSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('h2'), text: z.string() }),
  z.object({ kind: z.literal('h3'), text: z.string() }),
  z.object({ kind: z.literal('p'), text: z.string() }),
  z.object({ kind: z.literal('ul'), items: z.array(z.string()) }),
  z.object({ kind: z.literal('quote'), text: z.string(), cite: z.string().nullish() }),
  z.object({ kind: z.literal('callout'), items: z.array(z.object({ big: z.string(), label: z.string() })) }),
  z.object({ kind: z.literal('img'), media_id: z.string().uuid(), caption: z.string().nullish() }),
])
export const bodyDocSchema = z.object({ blocks: z.array(blockSchema) })
export type BodyDoc = z.infer<typeof bodyDocSchema>

const galleryItemInput = z.object({ media_id: z.string().uuid(), caption: z.string().nullish() })

export const seoMetaInput = z.object({
  meta_title: z.string().max(60).nullish(),
  meta_description: z.string().max(160).nullish(),
  canonical_url: z.string().url().nullish(),
  og_image_id: z.string().uuid().nullish(),
  og_title: z.string().nullish(),
  og_description: z.string().nullish(),
  noindex: z.boolean().nullish(),
})

const tagsInput = z.array(z.string().trim().max(40)).transform((tags) => [...new Set(tags.map((t) => t.trim()).filter(Boolean))])

const storyFields = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(SLUG_RE, 'slug must be lowercase, hyphenated'),
  excerpt: z.string().max(320).nullish(),
  cover_image_id: z.string().uuid().nullish(),
  category_id: z.string().uuid().nullish(),
  tags: tagsInput,
  article_date: z.coerce.date().nullish(),
  read_time_minutes: z.number().int().min(1).max(120).nullish(),
  featured: z.boolean(),
  body_lead: z.string().nullish(),
  body: bodyDocSchema,
  gallery: z.array(galleryItemInput).max(20),
  seo: seoMetaInput,
})

export const createStorySchema = storyFields.partial().required({ title: true })
export type CreateStoryInput = z.infer<typeof createStorySchema>

export const updateStorySchema = storyFields.partial()
export type UpdateStoryInput = z.infer<typeof updateStorySchema>

export const listStoriesSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  sort: sortEnum.optional(),
  category: z.string().optional(),
  contentStatus: contentStatusEnum.optional(),
  featured: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional(),
})
export type ListStoriesInput = z.infer<typeof listStoriesSchema>

export const publicListStoriesSchema = listStoriesSchema.pick({ page: true, pageSize: true, q: true, sort: true, category: true })
export type PublicListStoriesInput = z.infer<typeof publicListStoriesSchema>

export const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
})
export type BulkInput = z.infer<typeof bulkSchema>
