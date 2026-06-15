'use server'

import { z } from 'zod'
import type { RedirectSource } from '@prisma/client'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidatePublicSite } from '@/lib/revalidate'
import {
  getSeoSettings,
  updateSeoSettings,
  listRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  getJsonldConfig,
  updateJsonldTypes,
  getSitemapPreview,
} from '@/lib/data/seo'
import { seoSettingsUpdateSchema, redirectCreateSchema, redirectUpdateSchema, jsonldTypesSchema } from '@/lib/validation/seo'

// SEO global config (defaults / redirects / JSON-LD) is Admin-only (capability
// `seo_config`). System redirects recorded on slug change call lib/data/seo
// `recordRedirect` directly — not this guarded surface (the editing module already
// authorized the content change).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

export async function getSeoSettingsAction() {
  await requireCapability('seo_config')
  return getSeoSettings()
}

export async function updateSeoSettingsAction(input: unknown) {
  const principal = await requireCapability('seo_config')
  const data = parse(seoSettingsUpdateSchema, input)
  const settings = await updateSeoSettings(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'settings_change', entityType: 'seo_settings', entityId: settings.id, summary: 'Updated SEO defaults', metadata: { fields: Object.keys(data) } })
  revalidatePublicSite()
  return settings
}

export async function listRedirectsAction(filters: { source?: RedirectSource; active?: boolean; q?: string } = {}) {
  await requireCapability('seo_config')
  return listRedirects(filters)
}

export async function createRedirectAction(input: unknown) {
  const principal = await requireCapability('seo_config')
  const data = parse(redirectCreateSchema, input)
  const redirect = await createRedirect(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'redirect_change', entityType: 'seo_redirect', entityId: redirect.id, summary: `Created ${redirect.source} redirect ${redirect.fromPath} → ${redirect.toPath}` })
  return redirect
}

export async function updateRedirectAction(id: string, input: unknown) {
  const principal = await requireCapability('seo_config')
  const data = parse(redirectUpdateSchema, input)
  const redirect = await updateRedirect(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'redirect_change', entityType: 'seo_redirect', entityId: id, summary: `Updated redirect ${redirect.fromPath}`, metadata: { fields: Object.keys(data) } })
  return redirect
}

export async function deleteRedirectAction(id: string) {
  const principal = await requireCapability('seo_config')
  await deleteRedirect(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'redirect_change', entityType: 'seo_redirect', entityId: id, summary: 'Deleted redirect' })
  return { ok: true as const }
}

export async function getJsonldAction() {
  await requireCapability('seo_config')
  return getJsonldConfig()
}

export async function updateJsonldAction(input: unknown) {
  const principal = await requireCapability('seo_config')
  const { enabledTypes } = parse(jsonldTypesSchema, input)
  const settings = await updateJsonldTypes(principal.user_id, enabledTypes)
  await audit({ actorId: principal.user_id, action: 'settings_change', entityType: 'seo_jsonld', entityId: settings.id, summary: 'Updated enabled JSON-LD types', metadata: { enabledTypes } })
  revalidatePublicSite()
  return getJsonldConfig()
}

export async function sitemapPreviewAction(opts: { page?: number; pageSize?: number } = {}) {
  await requireCapability('seo_config')
  return getSitemapPreview(opts)
}
