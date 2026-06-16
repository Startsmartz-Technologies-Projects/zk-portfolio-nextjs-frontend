import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import {
  getDashboardSummary,
  getDashboardActivity,
  section,
  isUnavailable,
  resetDashboardCache,
  ADMIN_ONLY_ENTITY_TYPES,
  type ContentSummary,
  type LeadsSummary,
  type HealthSignals,
  type Kpis,
  type UsersSummary,
} from '@/lib/data/dashboard'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-dash-${RID}`

describe('section degradation (edge 2)', () => {
  it('passes a value through, and degrades a throwing provider to unavailable', async () => {
    await expect(section('ok', async () => 42)).resolves.toBe(42)
    await expect(section('boom', async () => { throw new Error('down') })).resolves.toEqual({ status: 'unavailable' })
    expect(isUnavailable({ status: 'unavailable' })).toBe(true)
    expect(isUnavailable({ draft: 0 })).toBe(false)
  })
})

describe.skipIf(!hasDb)('dashboard aggregation (integration)', () => {
  const projectIds: string[] = []
  const leadIds: string[] = []
  const auditIds: string[] = []

  beforeAll(() => resetDashboardCache())

  afterAll(async () => {
    await db.project.deleteMany({ where: { id: { in: projectIds } } })
    await db.lead.deleteMany({ where: { id: { in: leadIds } } })
    if (auditIds.length) await db.auditLogEntry.deleteMany({ where: { id: { in: auditIds } } })
    await db.$disconnect()
  })

  function asContent(s: DashboardLike['content']): ContentSummary {
    expect(isUnavailable(s)).toBe(false)
    return s as ContentSummary
  }

  it('counts content by status, excluding soft-deleted (BR-4)', async () => {
    const before = asContent((await getDashboardSummary('admin', { cache: false })).content)

    const del = await db.project.create({ data: { slug: `${PREFIX}-del`, title: 'Deleted draft', status: 'draft', deletedAt: new Date() } })
    projectIds.push(del.id)
    const live = await db.project.create({ data: { slug: `${PREFIX}-live`, title: 'Live draft', status: 'draft' } })
    projectIds.push(live.id)

    const after = asContent((await getDashboardSummary('admin', { cache: false })).content)
    expect(after.projects.draft).toBe(before.projects.draft + 1) // only the non-deleted draft is counted
    expect(after.totals.drafts).toBe(before.totals.drafts + 1)
  })

  it('summarizes leads (new, non-spam, recent) and excludes spam', async () => {
    const fresh = await db.lead.create({ data: { referenceNo: `ZE-${String(RID % 1_000_000).padStart(6, '0')}`, name: `${PREFIX} New`, phone: '+880', email: `${PREFIX}@x.com`, subject: 's', inquiryType: 'quote', message: 'm', sourcePage: '/lets-collaborate', status: 'new' } })
    leadIds.push(fresh.id)
    const spam = await db.lead.create({ data: { referenceNo: `ZE-${String((RID + 1) % 1_000_000).padStart(6, '0')}`, name: `${PREFIX} Spam`, phone: '+880', email: `${PREFIX}@y.com`, subject: 's', inquiryType: 'quote', message: 'm', sourcePage: '/lets-collaborate', status: 'spam', isSpam: true } })
    leadIds.push(spam.id)

    const leads = (await getDashboardSummary('admin', { cache: false })).leads as LeadsSummary
    expect(isUnavailable(leads)).toBe(false)
    expect(leads.new).toBeGreaterThanOrEqual(1)
    expect(leads.recent.some((l) => l.reference_no === fresh.referenceNo)).toBe(true)
    expect(leads.recent.some((l) => l.reference_no === spam.referenceNo)).toBe(false)
  })

  it('returns KPIs reusing module aggregates', async () => {
    const kpis = (await getDashboardSummary('admin', { cache: false })).kpis as Kpis
    expect(isUnavailable(kpis)).toBe(false)
    expect(typeof kpis.published_projects).toBe('number')
    expect(kpis.media_assets).toBeGreaterThanOrEqual(1)
    expect(kpis.years_experience).toBeGreaterThan(0)
    expect(kpis.company_stats.some((s) => s.key === 'team_size')).toBe(true)
  })

  it('role-filters: editor omits users + health.redirects; admin includes both', async () => {
    const admin = await getDashboardSummary('admin', { cache: false })
    const editor = await getDashboardSummary('editor', { cache: false })

    const adminHealth = admin.health as HealthSignals
    const editorHealth = editor.health as HealthSignals
    expect(adminHealth.redirects).toBeDefined()
    expect(editorHealth.redirects).toBeUndefined()
    expect(typeof editorHealth.images_missing_alt).toBe('number')

    const adminUsers = admin.users as UsersSummary
    expect(isUnavailable(adminUsers)).toBe(false)
    expect(adminUsers.admins).toBeGreaterThanOrEqual(1)
    expect('users' in editor).toBe(false)
  })

  it('scopes the activity feed by role (FR-DASH-004)', async () => {
    const userEntry = await db.auditLogEntry.create({ data: { action: 'role_change', entityType: 'user', summary: `${PREFIX} changed a role`, actorId: null } })
    const leadEntry = await db.auditLogEntry.create({ data: { action: 'update', entityType: 'lead', summary: `${PREFIX} triaged a lead`, actorId: null } })
    auditIds.push(userEntry.id, leadEntry.id)

    const adminFeed = await getDashboardActivity('admin', { pageSize: 50 })
    const editorFeed = await getDashboardActivity('editor', { pageSize: 50 })

    expect(adminFeed.data.some((i) => i.entity_type === 'user' && i.summary.includes(PREFIX))).toBe(true)
    expect(adminFeed.data.some((i) => i.entity_type === 'lead' && i.summary.includes(PREFIX))).toBe(true)
    // The editor feed never contains any admin-only entity type.
    expect(editorFeed.data.every((i) => !ADMIN_ONLY_ENTITY_TYPES.includes(i.entity_type))).toBe(true)
    expect(editorFeed.data.some((i) => i.entity_type === 'lead' && i.summary.includes(PREFIX))).toBe(true)
    expect(editorFeed.meta.pageSize).toBe(50)
  })

  it('caches by role and clears on reset', async () => {
    resetDashboardCache()
    const first = await getDashboardSummary('admin') // cached
    const cached = await getDashboardSummary('admin') // served from cache
    expect(cached).toBe(first) // same object reference → cache hit
    resetDashboardCache()
    const fresh = await getDashboardSummary('admin')
    expect(fresh).not.toBe(first)
  })
})

// Minimal structural alias for narrowing in the test.
type DashboardLike = Awaited<ReturnType<typeof getDashboardSummary>>
