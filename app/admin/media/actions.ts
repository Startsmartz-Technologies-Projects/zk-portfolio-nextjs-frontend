'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import {
  registerAsset,
  listAssets,
  getAsset,
  updateAssetMetadata,
  replaceAsset,
  softDeleteAsset,
  restoreAsset,
  hardDeleteAsset,
  resolveMediaRefs,
  getAssetUsage,
} from '@/lib/data/media'
import { buildSignedUpload, serverSideUpload } from '@/lib/media/cloudinary'
import {
  signRequestSchema,
  registerSchema,
  metadataPatchSchema,
  listFiltersSchema,
  validateUploadType,
  allowedFormatsFor,
  maxBytesFor,
} from '@/lib/validation/media'

// Media management is admin + editor (capability `media`, §8.2). The signing secret
// stays server-side (BR-1).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

/** Issue a signed Cloudinary upload payload (FR-MEDIA-001/004). Throws if Cloudinary is unconfigured. */
export async function signUploadAction(input: unknown) {
  await requireCapability('media')
  const { resource_type, format, bytes } = parse(signRequestSchema, input)
  if (format) validateUploadType(resource_type, format, bytes) // 422 on disallowed type/size
  return buildSignedUpload(resource_type, {
    allowedFormats: allowedFormatsFor(resource_type),
    maxBytes: maxBytesFor(resource_type),
  })
}

export async function registerAction(input: unknown) {
  const principal = await requireCapability('media')
  const asset = await registerAsset(principal.user_id, parse(registerSchema, input))
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'media_asset', entityId: asset.id, summary: `Registered ${asset.resource_type} '${asset.public_id}'` })
  return asset
}

/** Server-side small-file upload (FR-MEDIA-003). Uploads to Cloudinary, then registers. */
export async function uploadAction(formData: FormData) {
  const principal = await requireCapability('media')
  const file = formData.get('file')
  const resourceType = formData.get('resource_type') === 'document' ? 'document' : 'image'
  if (!(file instanceof Blob)) throw new ValidationError('A file is required', [{ field: 'file' }])
  const result = await serverSideUpload(file, resourceType)
  const asset = await registerAsset(principal.user_id, { ...result, resource_type: resourceType })
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'media_asset', entityId: asset.id, summary: `Uploaded ${resourceType} '${asset.public_id}'` })
  return asset
}

export async function listMediaAction(input: unknown = {}) {
  await requireCapability('media')
  return listAssets(parse(listFiltersSchema, input))
}

export async function getMediaAction(id: string) {
  await requireCapability('media')
  return getAsset(id)
}

export async function updateMetadataAction(id: string, input: unknown) {
  const principal = await requireCapability('media')
  const data = parse(metadataPatchSchema, input)
  const asset = await updateAssetMetadata(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'media_asset', entityId: id, summary: 'Edited asset metadata', metadata: { fields: Object.keys(data) } })
  return asset
}

export async function replaceAction(id: string, input: unknown) {
  const principal = await requireCapability('media')
  const asset = await replaceAsset(principal.user_id, id, parse(registerSchema, input))
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'media_asset', entityId: id, summary: 'Replaced asset file' })
  return asset
}

export async function deleteMediaAction(id: string, opts: { hard?: boolean } = {}) {
  const principal = await requireCapability('media')
  if (opts.hard) {
    await hardDeleteAsset(principal.user_id, id) // 409 AssetInUse if referenced
    await audit({ actorId: principal.user_id, action: 'delete', entityType: 'media_asset', entityId: id, summary: 'Hard-deleted asset' })
  } else {
    await softDeleteAsset(principal.user_id, id)
    await audit({ actorId: principal.user_id, action: 'delete', entityType: 'media_asset', entityId: id, summary: 'Soft-deleted asset' })
  }
  return { ok: true as const }
}

export async function restoreMediaAction(id: string) {
  const principal = await requireCapability('media')
  const asset = await restoreAsset(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'media_asset', entityId: id, summary: 'Restored asset' })
  return asset
}

// media-be-3: resolve (admin picker / hydration) + usage panel. The bare
// `resolveMediaRefs` serializer in lib/data/media is what consumer modules import
// server-side; this guarded action backs the admin picker.
export async function resolveMediaAction(ids: string[]) {
  await requireCapability('media')
  return resolveMediaRefs(ids)
}

export async function getMediaUsageAction(id: string) {
  await requireCapability('media')
  return getAssetUsage(id)
}
