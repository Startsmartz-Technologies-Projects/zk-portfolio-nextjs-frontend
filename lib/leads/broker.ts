import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'
import { ValidationError } from '@/lib/errors'
import { isCloudinaryConfigured, serverSideUpload } from '@/lib/media/cloudinary'

// Public attachment brokering (FR-LEADS-006/008, BR-4). The public client NEVER
// receives Cloudinary signing credentials — LEADS uploads server-side and registers
// the resulting asset as a **private `document`** tagged `lead`, then hands back only
// the `media_id`. All lead attachments are stored as `document` (even images) so they
// stay out of the public image library and are downloaded only via the access-
// controlled admin route (leads-be-2).

/** Allowed attachment extensions (SRS §12): documents + site images. */
export const LEAD_ATTACHMENT_FORMATS = ['pdf', 'dwg', 'xls', 'xlsx', 'doc', 'docx', 'jpg', 'jpeg', 'png'] as const
export const MAX_LEAD_ATTACHMENT_BYTES = 25 * 1024 * 1024 // 25 MB
export const LEAD_TAG = 'lead'

/** Lowercased file extension (no dot); '' when the name has none. Pure. */
export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot < 0 || dot === filename.length - 1) return ''
  return filename.slice(dot + 1).toLowerCase()
}

/** Validate a lead attachment's type + size (FR-LEADS-006/008, edge 4). Throws 422. Pure. */
export function validateLeadAttachment(filename: string, bytes: number): { format: string } {
  const format = extensionOf(filename)
  if (!(LEAD_ATTACHMENT_FORMATS as readonly string[]).includes(format)) {
    throw new ValidationError(`Attachment type '${format || 'unknown'}' is not allowed`, [
      { field: 'file', allowed: LEAD_ATTACHMENT_FORMATS },
    ])
  }
  if (bytes > MAX_LEAD_ATTACHMENT_BYTES) {
    throw new ValidationError('Attachment exceeds the 25 MB limit', [{ field: 'file', max: MAX_LEAD_ATTACHMENT_BYTES }])
  }
  return { format }
}

export interface BrokeredAttachment {
  media_id: string
  original_filename: string
  bytes: number
}

/**
 * Validate, upload (server-side), and register one attachment as a private MEDIA
 * `document` tagged `lead`. The Cloudinary upload is the same **guarded/deferred**
 * path as media-be-3: when `CLOUDINARY_*` is unset we still register the asset row
 * (with a `pending-upload://` placeholder URL) so the lead can reference it, and the
 * live object upload is verified once credentials are provisioned. Returns the
 * `media_id` for inclusion in the submission.
 */
export async function brokerLeadAttachment(file: Blob, filename: string): Promise<BrokeredAttachment> {
  const bytes = file.size
  const { format } = validateLeadAttachment(filename, bytes)

  let publicId: string
  let url: string
  if (isCloudinaryConfigured()) {
    const res = await serverSideUpload(file, 'document', { folder: 'leads' })
    publicId = res.public_id
    url = res.url
  } else {
    // Deferred path — register the row; the live upload is verified later (media-be-3).
    publicId = `leads/pending/${randomUUID()}`
    url = `pending-upload://${publicId}`
  }

  const asset = await db.mediaAsset.create({
    data: {
      resourceType: 'document',
      provider: 'cloudinary',
      publicId,
      url,
      format,
      bytes,
      originalFilename: filename,
      tags: [LEAD_TAG],
    },
  })
  return { media_id: asset.id, original_filename: filename, bytes }
}
