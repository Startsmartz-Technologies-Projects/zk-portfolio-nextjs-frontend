'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidateContent } from '@/lib/revalidate'
import {
  listServices,
  getService,
  createService,
  updateService,
  softDeleteService,
  restoreService,
  duplicateService,
  publishService,
  unpublishService,
  archiveService,
  reorderServices,
  bulkServices,
  getPreviewUrl,
  SERVICES_REVALIDATE_TAG,
  SERVICES_DIR_PATH,
  SERVICES_DETAIL_PATH,
} from '@/lib/data/services'
import { createServiceSchema, updateServiceSchema, listServicesSchema, orderSchema, bulkSchema } from '@/lib/validation/services'

// Services admin server actions (services-be-2) — same composition as Projects:
// requireCapability('content') + zod validation + lib/data + write-after-commit audit
// + best-effort revalidation. Restore is Admin-only (FR-SVC-006).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}
function revalidate() {
  revalidateContent(SERVICES_REVALIDATE_TAG, SERVICES_DIR_PATH, SERVICES_DETAIL_PATH)
}

export async function listServicesAction(input: unknown) {
  await requireCapability('content')
  return listServices(parse(listServicesSchema, input ?? {}))
}

export async function getServiceAction(id: string) {
  await requireCapability('content')
  return getService(id)
}

export async function createServiceAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(createServiceSchema, input)
  const service = await createService(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'service', entityId: service.id, summary: `Created service '${service.title}'` })
  revalidate()
  return service
}

export async function updateServiceAction(id: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updateServiceSchema, input)
  const service = await updateService(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'service', entityId: id, summary: `Updated service '${service.title}'`, metadata: { fields: Object.keys(data) } })
  revalidate()
  return service
}

export async function deleteServiceAction(id: string) {
  const principal = await requireCapability('content')
  await softDeleteService(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'service', entityId: id, summary: `Soft-deleted service ${id}` })
  revalidate()
  return { ok: true }
}

export async function restoreServiceAction(id: string) {
  const principal = await requireCapability('content')
  if (principal.role !== 'admin') throw new ValidationError('Only an admin can restore a service', [{ rule: 'admin_only' }])
  const service = await restoreService(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'service', entityId: id, summary: `Restored service '${service.title}'` })
  revalidate()
  return service
}

export async function duplicateServiceAction(id: string) {
  const principal = await requireCapability('content')
  const service = await duplicateService(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'service', entityId: service.id, summary: `Duplicated service '${service.title}'`, metadata: { source: id } })
  revalidate()
  return service
}

export async function publishServiceAction(id: string) {
  const principal = await requireCapability('content')
  const service = await publishService(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'publish', entityType: 'service', entityId: id, summary: `Published service '${service.title}'` })
  revalidate()
  return service
}

export async function unpublishServiceAction(id: string) {
  const principal = await requireCapability('content')
  const service = await unpublishService(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'unpublish', entityType: 'service', entityId: id, summary: `Unpublished service '${service.title}'` })
  revalidate()
  return service
}

export async function archiveServiceAction(id: string) {
  const principal = await requireCapability('content')
  const service = await archiveService(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'archive', entityType: 'service', entityId: id, summary: `Archived service '${service.title}'` })
  revalidate()
  return service
}

export async function reorderServicesAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(orderSchema, input)
  const result = await reorderServices(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'service', summary: `Reordered the service catalog (${data.ordered_ids.length})`, metadata: { ordered_ids: data.ordered_ids } })
  revalidate()
  return result
}

export async function bulkServicesAction(input: unknown) {
  const principal = await requireCapability('content')
  const { ids, action } = parse(bulkSchema, input)
  const result = await bulkServices(principal.user_id, ids, action)
  await audit({ actorId: principal.user_id, action: action === 'delete' ? 'delete' : action === 'publish' ? 'publish' : action === 'archive' ? 'archive' : 'unpublish', entityType: 'service', summary: `Bulk ${action} on ${ids.length} service(s)`, metadata: { ids } })
  revalidate()
  return result
}

export async function previewServiceAction(id: string) {
  await requireCapability('content')
  return getPreviewUrl(id)
}
