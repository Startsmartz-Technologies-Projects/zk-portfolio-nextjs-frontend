'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidatePublicSite } from '@/lib/revalidate'
import {
  getCompanyProfile,
  updateCompanyProfile,
  getBrandAssets,
  updateBrandAssets,
  listCompanyStats,
  replaceCompanyStats,
  listSettings,
  updateSetting,
} from '@/lib/data/site'
import { profileUpdateSchema, brandUpdateSchema, companyStatsSchema } from '@/lib/validation/site'

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

// All SITE management is Admin-only (capability `site_settings`, BR-6). The guard
// returns the principal so we can stamp the actor and write the audit entry.

export async function getProfileAction() {
  await requireCapability('site_settings')
  return getCompanyProfile()
}

export async function updateProfileAction(input: unknown) {
  const principal = await requireCapability('site_settings')
  const data = parse(profileUpdateSchema, input)
  const profile = await updateCompanyProfile(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'settings_change', entityType: 'company_profile', entityId: profile.id, summary: 'Updated company profile', metadata: { fields: Object.keys(data) } })
  revalidatePublicSite()
  return profile
}

export async function getBrandAction() {
  await requireCapability('site_settings')
  return getBrandAssets()
}

export async function updateBrandAction(input: unknown) {
  const principal = await requireCapability('site_settings')
  const data = parse(brandUpdateSchema, input)
  const brand = await updateBrandAssets(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'settings_change', entityType: 'brand_assets', summary: 'Updated brand assets' })
  revalidatePublicSite()
  return brand
}

export async function listCompanyStatsAction() {
  await requireCapability('site_settings')
  return listCompanyStats()
}

export async function replaceCompanyStatsAction(input: unknown) {
  const principal = await requireCapability('site_settings')
  const data = parse(companyStatsSchema, input)
  const stats = await replaceCompanyStats(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'settings_change', entityType: 'company_stats', summary: `Replaced company stats (${stats.length})` })
  revalidatePublicSite()
  return stats
}

export async function listSettingsAction() {
  await requireCapability('site_settings')
  return listSettings()
}

export async function updateSettingAction(key: string, value: unknown) {
  const principal = await requireCapability('site_settings')
  const setting = await updateSetting(principal.user_id, key, value)
  await audit({ actorId: principal.user_id, action: 'settings_change', entityType: 'setting_value', entityId: setting.id, summary: `Updated setting '${key}'`, metadata: { key, value: setting.value } })
  if (setting.isPublic) revalidatePublicSite()
  return setting
}
