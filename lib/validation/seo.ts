import { z } from 'zod'

export const JSONLD_TYPES = ['Organization', 'Article', 'NewsArticle', 'Service', 'FAQPage', 'BreadcrumbList'] as const

const rootRelative = z.string().regex(/^\/[^\s]*$/, 'must be a root-relative path (e.g. /projects/x)')

export const seoSettingsUpdateSchema = z
  .object({
    siteTitleTemplate: z.string().refine((t) => t.includes('%s'), { message: 'Template must contain %s' }),
    defaultMetaDescription: z.string().min(1),
    metadataBase: z.string().url(),
    defaultOgImageId: z.string().uuid().nullable(),
    twitterHandle: z.string().nullable(),
    defaultRobots: z.enum(['index_follow', 'noindex_nofollow', 'custom']),
    googleSiteVerification: z.string().nullable(),
    bingSiteVerification: z.string().nullable(),
  })
  .partial()

export type SeoSettingsUpdateInput = z.infer<typeof seoSettingsUpdateSchema>

export const redirectCreateSchema = z.object({
  fromPath: rootRelative,
  toPath: rootRelative,
  status: z.enum(['permanent', 'temporary']).default('permanent'),
  source: z.enum(['system', 'manual']).default('manual'),
  note: z.string().nullable().optional(),
})

export type RedirectCreateInput = z.infer<typeof redirectCreateSchema>

export const redirectUpdateSchema = z
  .object({
    toPath: rootRelative,
    status: z.enum(['permanent', 'temporary']),
    isActive: z.boolean(),
    note: z.string().nullable(),
  })
  .partial()

export const jsonldTypesSchema = z.object({
  enabledTypes: z.array(z.enum(JSONLD_TYPES)),
})
