import type { PrismaClient, CertStatus, CertTone, CertSealShape } from '@prisma/client'
import { CERTIFICATIONS } from '../../src/data/certifications'
import { termSlug } from './site.seed'

// One-time import of the credentials directory (`src/data/certifications.ts`, 14
// records) into the Certifications collection (certifications-be-1). The legacy `id`
// is duplicated/unreliable, so a unique slug is generated from title+authority and
// the original kept as `legacy_ref` (BR-7). Messy legacy dates are parsed best-effort
// and unparseable values are flagged, not guessed (§16 / edge 2). The legacy data has
// no document scans, so `document` is null (upload post-migration). A curated subset
// (first records, up to max_home_certifications) is marked show-on-home. Idempotent
// on slug.

// ── Pure mappers (exported for unit tests) ─────────────────────────────────

const STATUS_MAP: Record<string, CertStatus> = {
  present: 'Active',
  active: 'Active',
  'fully completed': 'Completed',
  completed: 'Completed',
  expired: 'Expired',
  renewed: 'Renewed',
}
export function mapCertStatus(legacy: string): CertStatus {
  return STATUS_MAP[legacy.trim().toLowerCase()] ?? 'Active'
}

export function mapTone(thumbClass: string): CertTone {
  const v = thumbClass.replace(/^tone-/, '').trim() as CertTone
  return (['paper', 'slate', 'cream'] as CertTone[]).includes(v) ? v : 'paper'
}

export function mapSealShape(accent: string): CertSealShape {
  const v = accent.replace(/^seal-/, '').trim() as CertSealShape
  return (['round', 'hex'] as CertSealShape[]).includes(v) ? v : 'round'
}

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Parse a messy legacy date string into a UTC date, or null when blank/unparseable.
 * Handles `M/D/YYYY` (US slash), `D-M-YY[YY]` (dash), and textual forms
 * ("September 13th, 2013", "Nov 2026", "02 November 2020.") with ordinal/trailing
 * punctuation stripped. Ambiguous/unrecognized inputs return null (flagged, not guessed).
 */
export function parseLegacyDate(raw: string): Date | null {
  const s = raw
    .trim()
    .replace(/\.+$/, '')
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1')
    .trim()
  if (!s || s === '-') return null

  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return utcDate(Number(m[3]), Number(m[1]), Number(m[2])) // M/D/Y

  m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/)
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])
    return utcDate(y, Number(m[2]), Number(m[1])) // D-M-Y
  }

  const t = new Date(s)
  if (!Number.isNaN(t.getTime())) return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()))
  return null
}

// ── Seed ───────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Deterministic unique slug per source record (collisions resolved by source order),
 *  so a re-run maps each legacy record to the same slug (idempotency key). */
export function buildDeterministicSlugs(records: { title: string; authority: string; id: string }[]): string[] {
  const seen = new Map<string, number>()
  return records.map((c) => {
    const base = slugify(`${c.title} ${c.authority}`).slice(0, 80) || slugify(c.id) || 'certification'
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count + 1}`
  })
}

export async function seedCertifications(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  const catTax = await db.taxonomy.findUnique({ where: { slug: 'certifications-category' }, include: { terms: { select: { slug: true, id: true } } } })
  const catBySlug = new Map((catTax?.terms ?? []).map((t) => [t.slug, t.id]))

  const maxHomeSetting = await db.settingValue.findUnique({ where: { key: 'max_home_certifications' } })
  const maxHome = maxHomeSetting ? Math.max(0, Number(maxHomeSetting.value) || 0) : 4

  const slugs = buildDeterministicSlugs(CERTIFICATIONS as unknown as { title: string; authority: string; id: string }[])
  const warnings: string[] = []
  let created = 0
  let skipped = 0
  let homeCount = 0

  for (const [index, c] of CERTIFICATIONS.entries()) {
    const slug = slugs[index]
    if (await db.certification.findUnique({ where: { slug }, select: { id: true } })) {
      skipped++
      continue
    }

    const catSlug = termSlug(c.category)
    const categoryId = catBySlug.get(catSlug) ?? null
    if (!categoryId) warnings.push(`${c.id}: category "${c.category}" (→ ${catSlug}) not in certification-category vocab → null`)

    const issuedDate = parseLegacyDate(c.issued)
    if (!issuedDate && c.issued.trim() && c.issued.trim() !== '-') warnings.push(`${c.id}: unparseable issued date "${c.issued}" → null (manual entry)`)
    const expiryDate = parseLegacyDate(c.expiry)

    const showOnHome = homeCount < maxHome
    const sealOrder = showOnHome ? homeCount : null
    if (showOnHome) homeCount++

    await db.certification.create({
      data: {
        status: 'published',
        publishedAt: new Date(),
        legacyRef: c.id,
        slug,
        title: c.title,
        authority: c.authority,
        number: c.number && c.number !== '-' ? c.number : null,
        categoryId,
        certStatus: mapCertStatus(c.status),
        issuedDate,
        expiryDate,
        description: c.description,
        tone: mapTone(c.thumbClass),
        sealShape: mapSealShape(c.accent),
        showOnHome,
        sealLabel: c.homeSeal ? c.homeSeal.replace(/\n/g, ' ').trim() : null,
        sealId: c.homeId || null,
        sealValidity: c.homeValid || null,
        sealOrder,
        createdById: actorId,
        updatedById: actorId,
      },
    })
    created++
  }

  if (warnings.length > 0) {
    console.log(`Certifications seed: ${warnings.length} mapping note(s):`)
    for (const w of warnings) console.log(`  - ${w}`)
  }
  console.log(`Certifications seed: ${created} imported, ${skipped} already present (${CERTIFICATIONS.length} in source; ${homeCount} on home; documents pending upload). Idempotent.`)
}
