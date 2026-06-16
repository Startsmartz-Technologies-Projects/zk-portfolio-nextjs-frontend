import { db } from '@/lib/db'
import type { ContentStatus, Prisma } from '@prisma/client'
import type { Role } from '@/lib/auth/jwt'
import { listAuditLog } from '@/lib/users/audit-read'
import { getProjectStats } from '@/lib/data/projects'
import { getPublicCompanyStats } from '@/lib/data/site'

// Dashboard aggregation (dash-be-1). A read-only, role-aware composite over every
// module's data (SRS dashboard §5, contract §2/§3). Owns NO entities and performs NO
// writes (BR-1/BR-5); every figure is read from its owning module at request time
// (BR-4: soft-deleted excluded; published/draft semantics respected) with short-TTL
// caching (BR-2). A slow/absent source degrades its OWN section to
// `{ status: 'unavailable' }` rather than failing the whole composite (edge 2). The
// widget set is role-filtered server-side: an editor never receives `users`, the
// admin-only `health.redirects`, or admin/global-config activity (BR-3, FR-DASH-011).

const CACHE_TTL_MS = 30_000 // BR-2: brief staleness is acceptable for an informational view.

/** Audit entity types an editor's activity feed excludes — user-admin + global-config (FR-DASH-004). */
export const ADMIN_ONLY_ENTITY_TYPES = [
  'user',
  'authorization',
  'auth',
  'seo_settings',
  'seo_redirect',
  'seo_jsonld',
  'company_profile',
  'brand_assets',
  'company_stats',
  'setting_value',
  'taxonomy_term',
]

export type Unavailable = { status: 'unavailable' }
const UNAVAILABLE: Unavailable = { status: 'unavailable' }
const isUnavailable = (v: unknown): v is Unavailable => !!v && typeof v === 'object' && (v as Unavailable).status === 'unavailable'

/** Run a section provider, degrading to an `unavailable` marker on failure (edge 2). */
export async function section<T>(label: string, fn: () => Promise<T>): Promise<T | Unavailable> {
  try {
    return await fn()
  } catch (err) {
    console.error(`[dashboard] section '${label}' unavailable`, err)
    return UNAVAILABLE
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface StatusCounts {
  draft: number
  published: number
  archived: number
}

export interface ContentSummary {
  projects: StatusCounts
  services: StatusCounts
  blog: StatusCounts
  news: StatusCounts
  certifications: StatusCounts
  concerns: StatusCounts
  pages: StatusCounts
  totals: { published: number; drafts: number }
}

export interface LeadsSummary {
  new: number
  recent: { reference_no: string; name: string; inquiry_type: string; created_at: string }[]
}

export interface HealthSignals {
  drafts_pending: number
  images_missing_alt: number
  published_missing_meta: number
  redirects?: { legacy: number; inactive: number } // admin only
}

export interface Kpis {
  published_projects: number
  districts_covered: number
  media_assets: number
  years_experience: number | null
  company_stats: { key: string; label: string; value: string; unit: string | null }[]
}

export interface ActivityItem {
  actor: string
  action: string
  entity_type: string
  summary: string
  created_at: string
}

export interface UsersSummary {
  total: number
  admins: number
}

export interface DashboardSummary {
  content: ContentSummary | Unavailable
  leads: LeadsSummary | Unavailable
  health: HealthSignals | Unavailable
  kpis: Kpis | Unavailable
  activity: ActivityItem[] | Unavailable
  users?: UsersSummary | Unavailable // admin only
}

// ── Section providers ────────────────────────────────────────────────────────

function tally(rows: { status: ContentStatus; _count: { _all: number } }[]): StatusCounts {
  const out: StatusCounts = { draft: 0, published: 0, archived: 0 }
  for (const r of rows) out[r.status] = r._count._all
  return out
}

const NOT_DELETED = { deletedAt: null }

async function getContentSummary(): Promise<ContentSummary> {
  const [projects, services, blog, news, certifications, concerns, pages] = await Promise.all([
    db.project.groupBy({ by: ['status'], where: NOT_DELETED, _count: { _all: true } }),
    db.service.groupBy({ by: ['status'], where: NOT_DELETED, _count: { _all: true } }),
    db.article.groupBy({ by: ['status'], where: NOT_DELETED, _count: { _all: true } }),
    db.newsStory.groupBy({ by: ['status'], where: NOT_DELETED, _count: { _all: true } }),
    db.certification.groupBy({ by: ['status'], where: NOT_DELETED, _count: { _all: true } }),
    db.concern.groupBy({ by: ['status'], where: NOT_DELETED, _count: { _all: true } }),
    db.page.groupBy({ by: ['status'], where: NOT_DELETED, _count: { _all: true } }),
  ])
  const counts = {
    projects: tally(projects),
    services: tally(services),
    blog: tally(blog),
    news: tally(news),
    certifications: tally(certifications),
    concerns: tally(concerns),
    pages: tally(pages),
  }
  const all = Object.values(counts)
  return {
    ...counts,
    totals: {
      published: all.reduce((s, c) => s + c.published, 0),
      drafts: all.reduce((s, c) => s + c.draft, 0),
    },
  }
}

async function getLeadsSummary(): Promise<LeadsSummary> {
  const [newCount, recent] = await Promise.all([
    db.lead.count({ where: { status: 'new', isSpam: false, deletedAt: null } }),
    db.lead.findMany({
      where: { isSpam: false, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { referenceNo: true, name: true, inquiryType: true, createdAt: true },
    }),
  ])
  return {
    new: newCount,
    recent: recent.map((l) => ({ reference_no: l.referenceNo, name: l.name, inquiry_type: l.inquiryType, created_at: l.createdAt.toISOString() })),
  }
}

/** Published records missing a SeoMeta title or description (FR-DASH-008). Certifications have no SeoMeta (BR-8). */
async function countPublishedMissingMeta(): Promise<number> {
  const missing = (extra?: Prisma.ProjectWhereInput): Prisma.ProjectWhereInput => ({
    status: 'published',
    deletedAt: null,
    OR: [{ seoMetaTitle: null }, { seoMetaTitle: '' }, { seoMetaDescription: null }, { seoMetaDescription: '' }],
    ...extra,
  })
  const counts = await Promise.all([
    db.project.count({ where: missing() }),
    db.service.count({ where: missing() as Prisma.ServiceWhereInput }),
    db.article.count({ where: missing() as Prisma.ArticleWhereInput }),
    db.newsStory.count({ where: missing() as Prisma.NewsStoryWhereInput }),
    db.concern.count({ where: missing() as Prisma.ConcernWhereInput }),
    db.page.count({ where: missing() as Prisma.PageWhereInput }),
  ])
  return counts.reduce((s, n) => s + n, 0)
}

async function getHealthSignals(isAdmin: boolean): Promise<HealthSignals> {
  const draftWhere = { status: 'draft' as const, deletedAt: null }
  const [draftCounts, imagesMissingAlt, publishedMissingMeta, redirectTotals] = await Promise.all([
    Promise.all([
      db.project.count({ where: draftWhere }),
      db.service.count({ where: draftWhere }),
      db.article.count({ where: draftWhere }),
      db.newsStory.count({ where: draftWhere }),
      db.certification.count({ where: draftWhere }),
      db.concern.count({ where: draftWhere }),
      db.page.count({ where: draftWhere }),
    ]),
    db.mediaAsset.count({ where: { resourceType: 'image', deletedAt: null, OR: [{ altText: null }, { altText: '' }] } }),
    countPublishedMissingMeta(),
    isAdmin
      ? Promise.all([db.redirect.count(), db.redirect.count({ where: { isActive: false } })])
      : Promise.resolve(null),
  ])
  const health: HealthSignals = {
    drafts_pending: draftCounts.reduce((s, n) => s + n, 0),
    images_missing_alt: imagesMissingAlt,
    published_missing_meta: publishedMissingMeta,
  }
  if (redirectTotals) health.redirects = { legacy: redirectTotals[0], inactive: redirectTotals[1] }
  return health
}

async function getKpis(): Promise<Kpis> {
  const [projectStats, mediaAssets, profile, companyStats] = await Promise.all([
    getProjectStats(),
    db.mediaAsset.count({ where: { deletedAt: null } }),
    db.companyProfile.findFirst({ select: { establishmentYear: true } }),
    getPublicCompanyStats(),
  ])
  const years = profile ? new Date().getFullYear() - profile.establishmentYear : null
  return {
    published_projects: projectStats.total_projects,
    districts_covered: projectStats.districts_covered,
    media_assets: mediaAssets,
    years_experience: years,
    company_stats: companyStats.map((s) => ({ key: s.key, label: s.label, value: s.value, unit: s.unit })),
  }
}

async function getUsersSummary(): Promise<UsersSummary> {
  const [total, admins] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { role: 'admin', status: 'active', deletedAt: null } }),
  ])
  return { total, admins }
}

function toActivityItem(i: Awaited<ReturnType<typeof listAuditLog>>['data'][number]): ActivityItem {
  return { actor: i.actor?.full_name ?? 'System', action: i.action, entity_type: i.entity_type, summary: i.summary, created_at: i.created_at }
}

/** Role-scoped recent activity for the composite — an editor's feed excludes admin/global-config events (FR-DASH-004). */
async function getRecentActivity(role: Role, limit: number): Promise<ActivityItem[]> {
  const page = await listAuditLog({
    page: 1,
    pageSize: limit,
    ...(role === 'editor' ? { entityTypeNotIn: ADMIN_ONLY_ENTITY_TYPES } : {}),
  })
  return page.data.map(toActivityItem)
}

// ── Short-TTL cache (BR-2) ───────────────────────────────────────────────────

const cache = new Map<Role, { value: DashboardSummary; expiresAt: number }>()

/** Clear the dashboard cache (test helper / manual refresh). */
export function resetDashboardCache(): void {
  cache.clear()
}

// ── Composite (FR-DASH-001…012) ──────────────────────────────────────────────

export interface DashboardOptions {
  /** Use the short-TTL cache (default true). Tests pass `false` to read live figures. */
  cache?: boolean
}

export async function getDashboardSummary(role: Role, opts: DashboardOptions = {}): Promise<DashboardSummary> {
  const useCache = opts.cache !== false
  if (useCache) {
    const hit = cache.get(role)
    if (hit && hit.expiresAt > Date.now()) return hit.value
  }

  const isAdmin = role === 'admin'
  const [content, leads, health, kpis, activity, users] = await Promise.all([
    section('content', getContentSummary),
    section('leads', getLeadsSummary),
    section('health', () => getHealthSignals(isAdmin)),
    section('kpis', getKpis),
    section('activity', () => getRecentActivity(role, 20)),
    isAdmin ? section('users', getUsersSummary) : Promise.resolve(undefined),
  ])

  const summary: DashboardSummary = { content, leads, health, kpis, activity }
  if (isAdmin) summary.users = users

  if (useCache) cache.set(role, { value: summary, expiresAt: Date.now() + CACHE_TTL_MS })
  return summary
}

export interface ActivityFeedInput {
  page?: number
  pageSize?: number
}

/** Paginated, role-scoped recent-activity feed (FR-DASH-003/004) — delegates to the USERS audit read. */
export async function getDashboardActivity(role: Role, input: ActivityFeedInput = {}) {
  const pageSize = Math.min(50, Math.max(1, Math.trunc(input.pageSize ?? 20)))
  const page = await listAuditLog({
    page: input.page,
    pageSize,
    ...(role === 'editor' ? { entityTypeNotIn: ADMIN_ONLY_ENTITY_TYPES } : {}),
  })
  return { data: page.data.map(toActivityItem), meta: page.meta }
}

export { isUnavailable }
