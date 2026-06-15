import type { PrismaClient, BadgeStyle, ClientType, DeliveryStatus } from '@prisma/client'
import { PROJECTS, FEATURED_PROJECT_IDS } from '../../src/data/projects-data'
import { parseCloudinaryUrl } from './media.seed'
import { termSlug } from './site.seed'

// One-time import of the hard-coded portfolio (`src/data/projects-data.ts`) into the
// Projects collection (projects-be-1). `P0xx` → `legacy_id`; the legacy `cat`/`type`/
// `location`/`year`/`duration` free-text fields are mapped onto the new taxonomy FKs,
// enums, and structured dates per SRS §15/§16. Ambiguous legacy values follow §16
// Q1/Q2 and unresolved cases are **logged, not guessed silently**. Idempotent: keyed
// on `legacy_id`, a re-run skips projects already imported (never clobbers edits).

// ── Pure legacy-value mappers (exported for unit tests) ───────────────────

/**
 * Legacy `type` → the `ClientType` enum (§16 Q1). The legacy field overloads client
 * segment (Government/Commercial/Private) with construction type (Infrastructure /
 * Industrial / Religious-Institutional), so the non-segment values collapse to
 * `Commercial` (their `defaultDetail` client label is "Commercial Client"). Unknown
 * values resolve to null (logged) rather than being force-fit.
 */
const CLIENT_TYPE_MAP: Record<string, ClientType> = {
  government: 'Government',
  commercial: 'Commercial',
  private: 'Private',
  infrastructure: 'Commercial',
  industrial: 'Commercial',
  'religious / institutional construction': 'Commercial',
}
export function mapClientType(legacyType: string): ClientType | null {
  return CLIENT_TYPE_MAP[legacyType.trim().toLowerCase()] ?? null
}

/**
 * Legacy `cat` → a `projects-category` term slug (§16 Q1). A small alias table fixes
 * the singular/plural drift in the source ("Bridge work" → `bridge-works`); anything
 * else falls through to the standard term-slugifier and is validated against the live
 * vocabulary at seed time (unknown → logged, category left null).
 */
const CATEGORY_ALIAS: Record<string, string> = {
  'bridge work': 'bridge-works',
  'government project': 'government-projects',
  'building construction': 'building-construction',
}
export function categoryTermSlug(cat: string): string {
  return CATEGORY_ALIAS[cat.trim().toLowerCase()] ?? termSlug(cat)
}

/**
 * Derive a `location` district term slug from free-text legacy location (§16 Q2):
 * the term is district/area level (for filtering), the granular address stays in
 * `location_detail`. Scans for a known district keyword (incl. the Comilla→Cumilla /
 * Chittagong→Chattogram spelling drift). No match → null (logged); the granular
 * string is still preserved in `location_detail`.
 */
const LOCATION_KEYWORDS: { keyword: string; slug: string }[] = [
  { keyword: 'dhaka', slug: 'dhaka' },
  { keyword: 'chattogram', slug: 'chattogram' },
  { keyword: 'chittagong', slug: 'chattogram' },
  { keyword: 'sylhet', slug: 'sylhet' },
  { keyword: 'cumilla', slug: 'cumilla' },
  { keyword: 'comilla', slug: 'cumilla' },
  { keyword: 'barishal', slug: 'barishal' },
  { keyword: 'barisal', slug: 'barishal' },
  { keyword: 'mymensingh', slug: 'mymensingh' },
  { keyword: 'gazipur', slug: 'gazipur' },
  { keyword: 'khulna', slug: 'khulna' },
  { keyword: 'rajshahi', slug: 'rajshahi' },
]
export function locationTermSlug(freeText: string): string | null {
  const haystack = freeText.toLowerCase()
  for (const { keyword, slug } of LOCATION_KEYWORDS) {
    if (haystack.includes(keyword)) return slug
  }
  return null
}

/** A 4-digit legacy `year` string → integer, or null when not a clean year. */
export function parseYear(year: string): number | null {
  const m = year.trim().match(/\b(\d{4})\b/)
  return m ? Number(m[1]) : null
}

/**
 * Best-effort parse of the free-text legacy `duration` into months. `N year(s)` →
 * `N*12` (handles "2.5 Years"); `N month(s)` → the last number in a range ("4-5
 * months" → 5, "22 months" → 22). Non-numeric labels ("Ongoing", "In progress",
 * "Kickoff Q2") → null.
 */
export function parseDurationMonths(duration: string): number | null {
  const d = duration.trim().toLowerCase()
  if (/year/.test(d)) {
    const m = d.match(/(\d+(?:\.\d+)?)/)
    return m ? Math.round(Number(m[1]) * 12) : null
  }
  if (/month/.test(d)) {
    const nums = d.match(/\d+/g)
    return nums && nums.length > 0 ? Number(nums[nums.length - 1]) : null
  }
  return null
}

function subMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, date.getUTCDate()))
}

/**
 * Map the legacy `year` + `duration` + real-world status onto structured
 * `start_date`/`end_date` (BR-7). `end_date` is Jan 1 of the completion year for
 * `Completed` projects and null for open-ended ones (`Ongoing`/`Planning`);
 * `start_date` is `end-anchor − duration` when the duration is known (so e.g. P001
 * year 2025 / "22 months" → start 2023-03-01), else the anchor for completed
 * projects. Displayed year/duration are re-derived from these at render time.
 */
export function deriveDates(
  year: string,
  duration: string,
  deliveryStatus: DeliveryStatus,
): { startDate: Date | null; endDate: Date | null } {
  const Y = parseYear(year)
  const M = parseDurationMonths(duration)
  const endDate = deliveryStatus === 'Completed' && Y ? new Date(Date.UTC(Y, 0, 1)) : null
  let startDate: Date | null = null
  if (Y) {
    const anchor = new Date(Date.UTC(Y, 0, 1))
    startDate = M ? subMonths(anchor, M) : deliveryStatus === 'Completed' ? anchor : null
  }
  return { startDate, endDate }
}

const BADGE_STYLES: BadgeStyle[] = ['default', 'lime', 'black', 'gold']
export function mapBadgeStyle(badgeClass?: string): BadgeStyle {
  const v = badgeClass?.trim().toLowerCase() as BadgeStyle | undefined
  return v && BADGE_STYLES.includes(v) ? v : 'default'
}

const DELIVERY_STATUSES: DeliveryStatus[] = ['Completed', 'Ongoing', 'Planning']
function mapDeliveryStatus(status: string): DeliveryStatus {
  const v = status.trim() as DeliveryStatus
  return DELIVERY_STATUSES.includes(v) ? v : 'Planning'
}

// ── Seed ───────────────────────────────────────────────────────────────────

/** Ensure a MediaAsset row for a Cloudinary image URL; returns its id, or null
 *  (logged by the caller) for a non-Cloudinary URL that MEDIA cannot host (v1). */
async function ensureMedia(db: PrismaClient, rawUrl: string, actorId: string | null): Promise<string | null> {
  const url = rawUrl.trim()
  const parsed = parseCloudinaryUrl(url)
  if (!parsed) return null
  const existing = await db.mediaAsset.findFirst({ where: { publicId: parsed.publicId }, select: { id: true } })
  if (existing) return existing.id
  const filename = parsed.publicId.split('/').pop() ?? parsed.publicId
  const created = await db.mediaAsset.create({
    data: {
      resourceType: 'image',
      provider: 'cloudinary',
      publicId: parsed.publicId,
      url,
      format: parsed.format,
      originalFilename: `${filename}.${parsed.format}`,
      tags: ['projects'],
      createdById: actorId,
      updatedById: actorId,
    },
  })
  return created.id
}

export async function seedProjects(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  // Resolve the live SITE vocabularies the imported FKs point at.
  const [catTax, locTax] = await Promise.all([
    db.taxonomy.findUnique({ where: { slug: 'projects-category' }, include: { terms: { select: { slug: true, id: true } } } }),
    db.taxonomy.findUnique({ where: { slug: 'location' }, include: { terms: { select: { slug: true, id: true } } } }),
  ])
  const catBySlug = new Map((catTax?.terms ?? []).map((t) => [t.slug, t.id]))
  const locBySlug = new Map((locTax?.terms ?? []).map((t) => [t.slug, t.id]))

  const featuredOrder = new Map<string, number>(FEATURED_PROJECT_IDS.map((id, i) => [id, i]))
  const warnings: string[] = []
  let created = 0
  let skipped = 0

  for (const p of PROJECTS) {
    const existing = await db.project.findUnique({ where: { legacyId: p.id }, select: { id: true } })
    if (existing) {
      skipped++
      continue
    }

    const deliveryStatus = mapDeliveryStatus(p.status)

    const clientType = mapClientType(p.type)
    if (!clientType) warnings.push(`${p.id}: unmapped client_type for legacy type "${p.type}" → left null`)

    const catSlug = categoryTermSlug(p.cat)
    const categoryId = catBySlug.get(catSlug) ?? null
    if (!categoryId) warnings.push(`${p.id}: category "${p.cat}" (→ ${catSlug}) not in projects-category vocab → left null`)

    const locSlug = locationTermSlug(p.location)
    const locationId = locSlug ? (locBySlug.get(locSlug) ?? null) : null
    if (!locationId) warnings.push(`${p.id}: location "${p.location}" not resolved to a district term → left null (detail kept)`)

    const { startDate, endDate } = deriveDates(p.year, p.duration, deliveryStatus)
    const coverImageId = await ensureMedia(db, p.img, actorId)
    if (!coverImageId) warnings.push(`${p.id}: cover image is not a Cloudinary URL → left null (${p.img.trim()})`)

    // Gallery: dedupe by resolved asset id, preserve order.
    const galleryItems: { mediaId: string; position: number }[] = []
    const seenMedia = new Set<string>()
    for (const rawUrl of p.detail.gallery) {
      const mediaId = await ensureMedia(db, rawUrl, actorId)
      if (!mediaId || seenMedia.has(mediaId)) continue
      seenMedia.add(mediaId)
      galleryItems.push({ mediaId, position: galleryItems.length })
    }

    const order = featuredOrder.get(p.id)
    const featured = order !== undefined

    await db.project.create({
      data: {
        status: 'published',
        publishedAt: new Date(),
        legacyId: p.id,
        slug: termSlug(p.title),
        title: p.title,
        summary: p.summary,
        categoryId,
        clientType,
        deliveryStatus,
        locationId,
        locationDetail: p.location,
        startDate,
        endDate,
        coverImageId,
        badgeText: p.badge,
        badgeStyle: mapBadgeStyle(p.badgeClass),
        featured,
        featuredOrder: order ?? null,
        overviewTitle: p.detail.overviewTitle,
        overviewBody: p.detail.overviewBody,
        pullQuote: p.detail.pullQuote,
        client: p.detail.client,
        servicesDelivered: p.detail.servicesDelivered,
        scopeDescription: p.detail.scopeDescription,
        galleryHeading: p.detail.galleryHeading,
        galleryDescription: p.detail.galleryDescription,
        highlightsDescription: p.detail.highlightsDescription,
        caseStudyChallenge: p.detail.caseStudyChallenge,
        caseStudyApproach: p.detail.caseStudyApproach,
        caseStudyResult: p.detail.caseStudyResult,
        ctaHeading: p.detail.ctaHeading,
        createdById: actorId,
        updatedById: actorId,
        scopes: {
          create: p.detail.scopes.map((s, i) => ({
            icon: s.icon,
            value: s.n,
            title: s.t,
            description: s.d,
            position: i,
          })),
        },
        highlights: {
          create: p.detail.highlights.map((h, i) => ({
            number: h.num,
            unit: h.unit,
            title: h.title,
            body: h.body,
            position: i,
          })),
        },
        gallery: { create: galleryItems },
      },
    })
    created++
  }

  if (warnings.length > 0) {
    console.log(`Projects seed: ${warnings.length} legacy-mapping note(s):`)
    for (const w of warnings) console.log(`  - ${w}`)
  }
  console.log(
    `Projects seed: ${created} imported, ${skipped} already present ` +
      `(${PROJECTS.length} in source; ${FEATURED_PROJECT_IDS.length} featured). Idempotent.`,
  )
}
