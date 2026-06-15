import { z } from 'zod'

// Server-side validation for the Blog admin API (blog-be-2, SRS §12).
// Snake_case input keys per the operations contract (docs/api-contracts/blog.md §2).

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const contentStatusEnum = z.enum(['draft', 'published', 'archived'])
export const sortEnum = z.enum(['latest', 'popular', 'featured'])

// ── Body block document (§2.3) ──────────────────────────────────────────────

const blockSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('p'), text: z.string() }),
  z.object({ kind: z.literal('h3'), heading: z.string() }),
  z.object({ kind: z.literal('ul'), items: z.array(z.string()) }),
  z.object({ kind: z.literal('quote'), text: z.string(), cite: z.string().nullish() }),
  z.object({ kind: z.literal('stats'), items: z.array(z.object({ big: z.string(), label: z.string() })) }),
  z.object({ kind: z.literal('img'), media_id: z.string().uuid(), caption: z.string().nullish() }),
])
const sectionSchema = z.object({
  id: z.string().regex(SLUG_RE, 'section id must be an anchor slug'),
  heading: z.string(),
  level: z.number().int().min(2).max(4),
  blocks: z.array(blockSchema),
})
export const bodyDocSchema = z.object({ sections: z.array(sectionSchema) }).superRefine((doc, ctx) => {
  const ids = new Set<string>()
  doc.sections.forEach((s, i) => {
    if (ids.has(s.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sections', i, 'id'], message: `Duplicate section id '${s.id}'` })
    ids.add(s.id)
  })
})
export type BodyDoc = z.infer<typeof bodyDocSchema>

export const seoMetaInput = z.object({
  meta_title: z.string().max(60).nullish(),
  meta_description: z.string().max(160).nullish(),
  canonical_url: z.string().url().nullish(),
  og_image_id: z.string().uuid().nullish(),
  og_title: z.string().nullish(),
  og_description: z.string().nullish(),
  noindex: z.boolean().nullish(),
})

const tagsInput = z
  .array(z.string().trim().max(40))
  .transform((tags) => [...new Set(tags.map((t) => t.trim()).filter(Boolean))])

const articleFields = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(SLUG_RE, 'slug must be lowercase, hyphenated'),
  excerpt: z.string().max(320).nullish(),
  cover_image_id: z.string().uuid().nullish(),
  category_id: z.string().uuid().nullish(),
  tags: tagsInput,
  author_name: z.string().nullish(),
  author_role: z.string().nullish(),
  author_bio: z.string().nullish(),
  article_date: z.coerce.date().nullish(),
  read_time_minutes: z.number().int().min(1).max(120).nullish(),
  featured: z.boolean(),
  popularity: z.number().int().min(0).max(100),
  body_lead: z.string().nullish(),
  body: bodyDocSchema,
  seo: seoMetaInput,
})

export const createArticleSchema = articleFields.partial().required({ title: true })
export type CreateArticleInput = z.infer<typeof createArticleSchema>

export const updateArticleSchema = articleFields.partial()
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>

export const listArticlesSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  sort: sortEnum.optional(),
  category: z.string().optional(),
  contentStatus: contentStatusEnum.optional(),
  featured: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional(),
})
export type ListArticlesInput = z.infer<typeof listArticlesSchema>

export const publicListArticlesSchema = listArticlesSchema.pick({ page: true, pageSize: true, q: true, sort: true, category: true })
export type PublicListArticlesInput = z.infer<typeof publicListArticlesSchema>

export const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
})
export type BulkInput = z.infer<typeof bulkSchema>
