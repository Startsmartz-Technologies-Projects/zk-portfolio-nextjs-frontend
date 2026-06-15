import type { Role } from '@/lib/auth/jwt'

/**
 * The fixed two-role capability policy (SRS users-roles §8.2, FR-USERS-010, BR-1/BR-2).
 *
 * The platform has exactly two roles (`admin`, `editor`) and NO dynamic roles,
 * permissions, or per-module grant tables — capability is this constant matrix,
 * enforced in code by the role guard (users-be-3). Each `Capability` is one row of
 * §8.2: a coarse-grained area an `/admin/*` server action / route authorizes against.
 *
 * Reconciliation (BR-2): global config is Admin-only (user admin, global Site
 * Settings, SEO global config, lead delete/export); content work is any-editor
 * (content modules, inline per-record SeoMeta, Media, Leads triage, Dashboard).
 */
export const CAPABILITIES = [
  'user_admin',    // User administration (this module)
  'site_settings', // Global Site Settings — taxonomy/profile/brand/settings (SITE)
  'seo_config',    // SEO global config — defaults/redirects/JSON-LD (SEO)
  'seo_meta',      // Per-record SeoMeta (inline in content editors)
  'content',       // Content modules — Projects/Services/Blog/News/Certifications/Concerns/Pages
  'media',         // Media library (upload/manage assets)
  'leads_triage',  // Leads — view/triage (status/notes/assign)
  'leads_manage',  // Leads — delete/export
  'dashboard',     // Dashboard (read)
  'audit_log',     // Audit log (read/export)
] as const

export type Capability = (typeof CAPABILITIES)[number]

/**
 * Role → the capabilities it is allowed. `admin` has every capability; `editor`
 * is scoped to content work and is denied user admin, global Site Settings, SEO
 * global config, lead delete/export, and the audit log (§8.2).
 */
export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  admin: CAPABILITIES,
  editor: ['seo_meta', 'content', 'media', 'leads_triage', 'dashboard'],
}

/** Whether `role` is permitted the given capability per the §8.2 policy. */
export function can(role: Role, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability)
}
