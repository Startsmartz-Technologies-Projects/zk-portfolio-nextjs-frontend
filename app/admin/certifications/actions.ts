'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidateContent } from '@/lib/revalidate'
import {
  listCertifications,
  getCertification,
  createCertification,
  updateCertification,
  softDeleteCertification,
  restoreCertification,
  duplicateCertification,
  publishCertification,
  unpublishCertification,
  archiveCertification,
  setHomeSeals,
  bulkCertifications,
  CERTS_REVALIDATE_TAG,
  CERTS_BASE_PATH,
} from '@/lib/data/certifications'
import { createCertSchema, updateCertSchema, listCertsSchema, homeSealsSchema, bulkSchema } from '@/lib/validation/certifications'

// Certifications admin server actions (certifications-be-2) — requireCapability(
// 'content') + zod + lib/data + write-after-commit audit + revalidation. Restore is
// Admin-only. No detail route: revalidate the directory base path + home only.

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}
function revalidate() {
  revalidateContent(CERTS_REVALIDATE_TAG, CERTS_BASE_PATH, CERTS_BASE_PATH)
}

export async function listCertificationsAction(input: unknown) {
  await requireCapability('content')
  return listCertifications(parse(listCertsSchema, input ?? {}))
}

export async function getCertificationAction(id: string) {
  await requireCapability('content')
  return getCertification(id)
}

export async function createCertificationAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(createCertSchema, input)
  const cert = await createCertification(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'certification', entityId: cert.id, summary: `Created certification '${cert.title}'` })
  revalidate()
  return cert
}

export async function updateCertificationAction(id: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updateCertSchema, input)
  const cert = await updateCertification(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'certification', entityId: id, summary: `Updated certification '${cert.title}'`, metadata: { fields: Object.keys(data) } })
  revalidate()
  return cert
}

export async function deleteCertificationAction(id: string) {
  const principal = await requireCapability('content')
  await softDeleteCertification(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'certification', entityId: id, summary: `Soft-deleted certification ${id}` })
  revalidate()
  return { ok: true }
}

export async function restoreCertificationAction(id: string) {
  const principal = await requireCapability('content')
  if (principal.role !== 'admin') throw new ValidationError('Only an admin can restore a certification', [{ rule: 'admin_only' }])
  const cert = await restoreCertification(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'certification', entityId: id, summary: `Restored certification '${cert.title}'` })
  revalidate()
  return cert
}

export async function duplicateCertificationAction(id: string) {
  const principal = await requireCapability('content')
  const cert = await duplicateCertification(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'certification', entityId: cert.id, summary: `Duplicated certification '${cert.title}'`, metadata: { source: id } })
  revalidate()
  return cert
}

export async function publishCertificationAction(id: string) {
  const principal = await requireCapability('content')
  const cert = await publishCertification(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'publish', entityType: 'certification', entityId: id, summary: `Published certification '${cert.title}'` })
  revalidate()
  return cert
}

export async function unpublishCertificationAction(id: string) {
  const principal = await requireCapability('content')
  const cert = await unpublishCertification(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'unpublish', entityType: 'certification', entityId: id, summary: `Unpublished certification '${cert.title}'` })
  revalidate()
  return cert
}

export async function archiveCertificationAction(id: string) {
  const principal = await requireCapability('content')
  const cert = await archiveCertification(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'archive', entityType: 'certification', entityId: id, summary: `Archived certification '${cert.title}'` })
  revalidate()
  return cert
}

export async function setHomeSealsAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(homeSealsSchema, input)
  const result = await setHomeSeals(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'certification', summary: `Set home seals (${data.ordered_ids.length})`, metadata: { ordered_ids: data.ordered_ids } })
  revalidate()
  return result
}

export async function bulkCertificationsAction(input: unknown) {
  const principal = await requireCapability('content')
  const { ids, action } = parse(bulkSchema, input)
  const result = await bulkCertifications(principal.user_id, ids, action)
  await audit({ actorId: principal.user_id, action: action === 'delete' ? 'delete' : action === 'publish' ? 'publish' : action === 'archive' ? 'archive' : 'unpublish', entityType: 'certification', summary: `Bulk ${action} on ${ids.length} certification(s)`, metadata: { ids } })
  revalidate()
  return result
}
