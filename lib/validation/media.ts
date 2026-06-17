import { z } from 'zod'
import { ValidationError } from '@/lib/errors'

// Allowed upload types/sizes (SRS media §12).
export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'] as const
export const ALLOWED_DOCUMENT_FORMATS = ['pdf', 'dwg', 'xls', 'xlsx', 'doc', 'docx', 'csv'] as const
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024 // 25 MB
export const MAX_ALT_LENGTH = 300
export const MAX_TAGS = 25
export const MAX_TAG_LENGTH = 40

export function allowedFormatsFor(resourceType: 'image' | 'document'): string[] {
  return resourceType === 'image' ? [...ALLOWED_IMAGE_FORMATS] : [...ALLOWED_DOCUMENT_FORMATS]
}
export function maxBytesFor(resourceType: 'image' | 'document'): number {
  return resourceType === 'image' ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES
}

/** Throw a 422 if the format/size is outside the allowed list for the resource type (FR-MEDIA-004). */
export function validateUploadType(resourceType: 'image' | 'document', format: string, bytes?: number): void {
  const fmt = format.toLowerCase()
  if (!allowedFormatsFor(resourceType).includes(fmt)) {
    throw new ValidationError(`Format '${fmt}' is not allowed for a ${resourceType}`, [{ field: 'format', resourceType, format: fmt }])
  }
  if (bytes !== undefined && bytes > maxBytesFor(resourceType)) {
    throw new ValidationError(`File exceeds the ${resourceType} size limit`, [{ field: 'bytes', max: maxBytesFor(resourceType) }])
  }
}

/** Lowercase, trim, de-duplicate tags; enforce the count/length caps (FR-MEDIA-011). */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>()
  for (const raw of tags) {
    const t = raw.trim().toLowerCase()
    if (!t) continue
    if (t.length > MAX_TAG_LENGTH) throw new ValidationError(`Tag '${t}' exceeds ${MAX_TAG_LENGTH} chars`, [{ field: 'tags' }])
    seen.add(t)
  }
  if (seen.size > MAX_TAGS) throw new ValidationError(`At most ${MAX_TAGS} tags allowed`, [{ field: 'tags' }])
  return [...seen]
}

const resourceType = z.enum(['image', 'document'])

export const signRequestSchema = z.object({
  resource_type: resourceType,
  format: z.string().optional(),
  bytes: z.number().int().positive().optional(),
})

export const registerSchema = z.object({
  public_id: z.string().min(1),
  url: z.string().url(),
  format: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  resource_type: resourceType,
  original_filename: z.string().nullable().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const metadataPatchSchema = z
  .object({
    altText: z.string().max(MAX_ALT_LENGTH).nullable(),
    title: z.string().nullable(),
    tags: z.array(z.string()),
  })
  .partial()

export const listFiltersSchema = z.object({
  q: z.string().optional(),
  resourceType: resourceType.optional(),
  format: z.string().optional(),
  tag: z.string().optional(),
  inUse: z.boolean().optional(),
  includeDeleted: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
})

export type ListFiltersInput = z.infer<typeof listFiltersSchema>
