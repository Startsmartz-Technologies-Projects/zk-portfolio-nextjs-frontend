import { createHash } from 'node:crypto'

// Cloudinary signing + server-side upload (media-be-2). The API holds the signing
// secret; the client never sees it (BR-1). Credentials come from env. Signing is a
// pure HMAC — no SDK needed; the live upload path uses fetch and is guarded on
// missing credentials (integration-tested later, once CLOUDINARY_* is provisioned).

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
}

export function isCloudinaryConfigured(): boolean {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
}

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET')
  }
  return { cloudName, apiKey, apiSecret }
}

/**
 * Cloudinary signed-upload signature (FR-MEDIA-001): SHA-1 of the params to sign,
 * sorted by key and joined `k=v&…`, with the api secret appended. Pure +
 * deterministic — unit-tested with a fixed secret (no live Cloudinary needed).
 */
export function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex')
}

export interface SignedUpload {
  cloud_name: string
  api_key: string
  timestamp: number
  signature: string
  folder: string
  resource_type: 'image' | 'document'
  allowed_formats: string[]
  max_bytes: number
}

/**
 * Build a signed Cloudinary upload payload the admin client posts directly to
 * Cloudinary (FR-MEDIA-001/004). Throws if Cloudinary isn't configured. `now`
 * (epoch seconds) is injectable for deterministic tests.
 */
export function buildSignedUpload(
  resourceType: 'image' | 'document',
  opts: { allowedFormats: string[]; maxBytes: number; folder?: string; now?: number },
): SignedUpload {
  const cfg = getCloudinaryConfig()
  const folder = opts.folder ?? 'uploads'
  const timestamp = opts.now ?? Math.floor(Date.now() / 1000)
  // Cloudinary signs the upload params except file / cloud_name / api_key / resource_type.
  const signature = signCloudinaryParams({ folder, timestamp }, cfg.apiSecret)
  return {
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    timestamp,
    signature,
    folder,
    resource_type: resourceType,
    allowed_formats: opts.allowedFormats,
    max_bytes: opts.maxBytes,
  }
}

export interface CloudinaryUploadResult {
  public_id: string
  url: string
  format: string
  bytes: number
  width?: number | null
  height?: number | null
  original_filename?: string | null
}

/**
 * Server-side small-file upload (FR-MEDIA-003): POST the file to Cloudinary with a
 * signature and return the result. Guarded on missing credentials — the live path is
 * integration-tested later (deferred until CLOUDINARY_* is provisioned).
 */
export async function serverSideUpload(
  file: Blob,
  resourceType: 'image' | 'document',
  opts: { folder?: string; now?: number } = {},
): Promise<CloudinaryUploadResult> {
  const cfg = getCloudinaryConfig()
  const folder = opts.folder ?? 'uploads'
  const timestamp = opts.now ?? Math.floor(Date.now() / 1000)
  const signature = signCloudinaryParams({ folder, timestamp }, cfg.apiSecret)

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', cfg.apiKey)
  form.append('timestamp', String(timestamp))
  form.append('folder', folder)
  form.append('signature', signature)

  const endpoint = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/${resourceType === 'image' ? 'image' : 'raw'}/upload`
  const res = await fetch(endpoint, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status})`)
  const json = (await res.json()) as Record<string, unknown>
  return {
    public_id: String(json.public_id),
    url: String(json.secure_url ?? json.url),
    format: String(json.format),
    bytes: Number(json.bytes),
    width: (json.width as number) ?? null,
    height: (json.height as number) ?? null,
    original_filename: (json.original_filename as string) ?? null,
  }
}

/**
 * A Cloudinary transformation (delivery) URL derived from a base secure URL
 * (FR-MEDIA-013): inserts a transform segment after `/upload/`. Documented
 * convention for the front-end loader (responsive widths + `f_auto`/`q_auto`).
 */
export function transformationUrl(baseUrl: string, transform = 'f_auto,q_auto'): string {
  return baseUrl.replace('/upload/', `/upload/${transform}/`)
}
