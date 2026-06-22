import { z } from 'zod'

export const TERM_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// Company-stat keys are referenced by the page stat resolver and seed using underscores
// (years_experience, team_size, client_confidence_pct, …) — a separate, looser rule from the
// hyphen-only term/URL slug above. Lowercase letters/numbers separated by hyphens OR underscores.
export const STAT_KEY_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/

const socialPlatform = z.enum(['facebook', 'linkedin', 'instagram', 'youtube', 'twitter', 'other'])

export const socialLinkSchema = z.object({
  platform: socialPlatform,
  url: z.string().url(), // absolute http(s); rejects the `#` placeholder (edge 8)
  position: z.number().int().min(0).optional(),
})

export const profileUpdateSchema = z
  .object({
    name: z.string().min(1),
    legalName: z.string().nullable(),
    tagline: z.string().nullable(),
    brandDescription: z.string().nullable(),
    establishmentYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear()), // future year rejected (edge 4)
    email: z.string().email(),
    phone: z.string().min(1),
    whatsapp: z.string().url().nullable(),
    officeAddress: z.string().min(1),
    businessHours: z.string().nullable(),
    coverageSummary: z.string().nullable(),
    copyrightText: z.string().min(1),
    socials: z.array(socialLinkSchema),
    expectedUpdatedAt: z.coerce.date().optional(),
  })
  .partial()

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

export const brandUpdateSchema = z.object({
  logoPrimaryId: z.string().uuid(),
  logoFooterId: z.string().uuid(),
  faviconId: z.string().uuid(),
  ogDefaultId: z.string().uuid().nullable(),
})

export type BrandUpdateInput = z.infer<typeof brandUpdateSchema>

export const companyStatsSchema = z.object({
  stats: z
    .array(
      z.object({
        key: z.string().regex(STAT_KEY_RE, 'key must be slug-like (lowercase, numbers, - or _)'),
        label: z.string().min(1),
        value: z.string().min(1),
        unit: z.string().nullable().optional(),
      }),
    )
    .superRefine((stats, ctx) => {
      const keys = new Set<string>()
      for (const s of stats) {
        if (keys.has(s.key)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate stat key '${s.key}'` })
        keys.add(s.key)
      }
    }),
})

export type CompanyStatsInput = z.infer<typeof companyStatsSchema>

export const termCreateSchema = z.object({
  label: z.string().min(1),
  slug: z.string().regex(TERM_SLUG_RE).optional(),
  position: z.number().int().min(0).optional(),
})

export const termUpdateSchema = z
  .object({
    label: z.string().min(1),
    slug: z.string().regex(TERM_SLUG_RE),
    isActive: z.boolean(),
  })
  .partial()

export const termOrderSchema = z.object({ orderedIds: z.array(z.string().uuid()).min(1) })
