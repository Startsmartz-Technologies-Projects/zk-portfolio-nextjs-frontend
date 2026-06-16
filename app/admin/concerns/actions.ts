'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidateContent } from '@/lib/revalidate'
import {
  listConcerns,
  getConcern,
  createConcern,
  updateConcern,
  softDeleteConcern,
  restoreConcern,
  duplicateConcern,
  publishConcern,
  unpublishConcern,
  archiveConcern,
  setDefaultConcern,
  reorderConcerns,
  getPreviewUrl,
  collectPublishIssues,
  CONCERNS_REVALIDATE_TAG,
  CONCERNS_BASE_PATH,
} from '@/lib/data/concerns'
import { createConcernSchema, updateConcernSchema, listConcernsSchema, orderSchema } from '@/lib/validation/concerns'

// Concerns admin server actions (concerns-be-2) — requireCapability('content') + zod
// + lib/data + write-after-commit audit + revalidation. Restore + set-default are
// Admin-only (FR-CONC-006/019). The default concern is guarded against unpublish/
// archive/delete in the data layer.

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}
function revalidate() {
  revalidateContent(CONCERNS_REVALIDATE_TAG, CONCERNS_BASE_PATH, CONCERNS_BASE_PATH)
}

export async function listConcernsAction(input: unknown) {
  await requireCapability('content')
  return listConcerns(parse(listConcernsSchema, input ?? {}))
}

export async function getConcernAction(id: string) {
  await requireCapability('content')
  return getConcern(id)
}

export async function createConcernAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(createConcernSchema, input)
  const concern = await createConcern(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'concern', entityId: concern.id, summary: `Created concern '${concern.name}'` })
  revalidate()
  return concern
}

export async function updateConcernAction(id: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updateConcernSchema, input)
  const concern = await updateConcern(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'concern', entityId: id, summary: `Updated concern '${concern.name}'`, metadata: { fields: Object.keys(data) } })
  revalidate()
  return concern
}

export async function deleteConcernAction(id: string) {
  const principal = await requireCapability('content')
  await softDeleteConcern(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'concern', entityId: id, summary: `Soft-deleted concern ${id}` })
  revalidate()
  return { ok: true }
}

export async function restoreConcernAction(id: string) {
  const principal = await requireCapability('content')
  if (principal.role !== 'admin') throw new ValidationError('Only an admin can restore a concern', [{ rule: 'admin_only' }])
  const concern = await restoreConcern(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'concern', entityId: id, summary: `Restored concern '${concern.name}'` })
  revalidate()
  return concern
}

export async function duplicateConcernAction(id: string) {
  const principal = await requireCapability('content')
  const concern = await duplicateConcern(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'concern', entityId: concern.id, summary: `Duplicated concern '${concern.name}'`, metadata: { source: id } })
  revalidate()
  return concern
}

export async function publishConcernAction(id: string) {
  const principal = await requireCapability('content')
  const concern = await publishConcern(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'publish', entityType: 'concern', entityId: id, summary: `Published concern '${concern.name}'` })
  revalidate()
  return concern
}

export async function unpublishConcernAction(id: string) {
  const principal = await requireCapability('content')
  const concern = await unpublishConcern(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'unpublish', entityType: 'concern', entityId: id, summary: `Unpublished concern '${concern.name}'` })
  revalidate()
  return concern
}

export async function archiveConcernAction(id: string) {
  const principal = await requireCapability('content')
  const concern = await archiveConcern(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'archive', entityType: 'concern', entityId: id, summary: `Archived concern '${concern.name}'` })
  revalidate()
  return concern
}

export async function setDefaultConcernAction(id: string) {
  const principal = await requireCapability('content')
  if (principal.role !== 'admin') throw new ValidationError('Only an admin can set the default concern', [{ rule: 'admin_only' }])
  const concern = await setDefaultConcern(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'concern', entityId: id, summary: `Set default concern '${concern.name}'`, metadata: { is_default: true } })
  revalidate()
  return concern
}

export async function reorderConcernsAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(orderSchema, input)
  const result = await reorderConcerns(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'concern', summary: `Reordered concerns (${data.ordered_ids.length})`, metadata: { ordered_ids: data.ordered_ids } })
  revalidate()
  return result
}

export async function previewConcernAction(id: string) {
  await requireCapability('content')
  return getPreviewUrl(id)
}

/** Read-only publish-gate issues for a saved concern, surfaced in the editor publish panel. */
export async function publishIssuesConcernAction(id: string) {
  await requireCapability('content')
  return collectPublishIssues(id)
}
