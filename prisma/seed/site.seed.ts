import type { PrismaClient, SocialPlatform, SettingType } from '@prisma/client'
import { parseCloudinaryUrl } from './media.seed'

// Live global values extracted from the built site (nav/footer/layout) and the
// SRS §8.8 seed lists. See docs/srs/site-settings.md §11.A.

const PROFILE = {
  name: 'Zakir Enterprise',
  legalName: 'Zakir Enterprise Ltd.',
  tagline: 'Building Bangladesh Since 2010',
  brandDescription:
    'A Bangladesh-based construction firm delivering government, commercial and private works with disciplined execution and dependable project management.',
  establishmentYear: 2010,
  email: 'zakirenterprise307@gmail.com',
  phone: '+8801791026074',
  whatsapp: 'https://wa.me/8801791026074',
  officeAddress: 'House 42, Road 11, Banani, Dhaka 1213, Bangladesh',
  businessHours: 'Sun – Thu, 9:00 – 18:00 (GMT+6)',
  coverageSummary: 'All 64 districts',
  copyrightText: '© 2026 Zakir Enterprise Ltd. · All rights reserved · Trade License · Dhaka',
}

// Footer social set — URLs are `#` placeholders in the live site, to be filled by the Admin.
const SOCIALS: { platform: SocialPlatform; url: string; position: number }[] = [
  { platform: 'facebook', url: '#', position: 0 },
  { platform: 'linkedin', url: '#', position: 1 },
  { platform: 'instagram', url: '#', position: 2 },
  { platform: 'youtube', url: '#', position: 3 },
]

const STATS = [
  { key: 'team_size', label: 'Skilled Team', value: '250', unit: '+', position: 0 },
  { key: 'client_confidence_pct', label: 'Client Confidence', value: '98', unit: '%', position: 1 },
  { key: 'on_schedule_pct', label: 'On-Schedule Delivery', value: '98', unit: '%', position: 2 },
]

// Brand logos referenced by the chrome (nav/footer/layout) — created as MediaAsset
// rows here (Heading_28/34 aren't in src/data, so media.seed didn't import them).
const LOGO_PRIMARY = 'https://res.cloudinary.com/dk4csiouq/image/upload/v1777193277/Heading_28_nm42pj.png'
const LOGO_FOOTER = 'https://res.cloudinary.com/dk4csiouq/image/upload/v1777196761/Heading_34_lflrda.png'
const FAVICON = 'https://res.cloudinary.com/dk4csiouq/image/upload/v1777180913/Heading_24_t5zzbn.png'

const VOCABULARIES: { slug: string; label: string; isShared: boolean; terms: string[] }[] = [
  {
    slug: 'projects-category',
    label: 'Project Category',
    isShared: false,
    terms: ['Building Construction', 'Road Works', 'Bridge Works', 'Private Residential', 'Government Projects', 'Commercial Works'],
  },
  { slug: 'blog-category', label: 'Blog Category', isShared: false, terms: ['Construction', 'Roads', 'Bridge Works', 'Engineering'] },
  {
    slug: 'news-category',
    label: 'News Category',
    isShared: false,
    terms: ['Announcement', 'Achievement', 'Awarded Project', 'Tender Notice', 'CSR Activity', 'Milestone', 'Event Participation'],
  },
  {
    slug: 'certifications-category',
    label: 'Certification Category',
    isShared: false,
    terms: ['Compliance', 'Safety', 'Engineering', 'Trade & Licensing', 'Industry Body'],
  },
  {
    slug: 'location',
    label: 'Location',
    isShared: true,
    terms: ['Dhaka', 'Chattogram', 'Sylhet', 'Cumilla', 'Barishal', 'Mymensingh', 'Gazipur', 'Khulna', 'Rajshahi'],
  },
]

const SETTINGS: { key: string; type: SettingType; value: string; isPublic: boolean; description: string }[] = [
  { key: 'max_featured_projects', type: 'int', value: '3', isPublic: true, description: 'Maximum number of featured projects on the home page.' },
  { key: 'max_featured_services', type: 'int', value: '6', isPublic: true, description: 'Maximum number of featured services on the home page.' },
  { key: 'max_home_certifications', type: 'int', value: '4', isPublic: true, description: 'Maximum number of certifications shown on the home page.' },
]

/** ASCII-safe slug for a taxonomy term label (matches ^[a-z0-9]+(?:-[a-z0-9]+)*$). */
export function termSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Ensure a MediaAsset row exists for a Cloudinary brand logo; backfill alt text if missing. */
async function ensureBrandMedia(
  db: PrismaClient,
  url: string,
  altText: string | null,
  actorId: string | null,
): Promise<string> {
  const parsed = parseCloudinaryUrl(url)
  if (!parsed) throw new Error(`Brand asset is not a Cloudinary image URL: ${url}`)

  const existing = await db.mediaAsset.findFirst({ where: { publicId: parsed.publicId } })
  if (existing) {
    if (altText && !existing.altText) {
      await db.mediaAsset.update({ where: { id: existing.id }, data: { altText } })
    }
    return existing.id
  }

  const filename = parsed.publicId.split('/').pop() ?? parsed.publicId
  const created = await db.mediaAsset.create({
    data: {
      resourceType: 'image',
      provider: 'cloudinary',
      publicId: parsed.publicId,
      url,
      format: parsed.format,
      altText,
      originalFilename: `${filename}.${parsed.format}`,
      tags: ['brand'],
      createdById: actorId,
      updatedById: actorId,
    },
  })
  return created.id
}

/**
 * Idempotent seed of the Site Settings data (site-be-1). Creates the singleton
 * company profile + socials (create-if-absent — never clobbers admin edits),
 * authored KPI stats, the four brand-asset slots (with their MediaAsset rows),
 * the five taxonomy vocabularies + terms, and the public `max_*` settings.
 */
export async function seedSite(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  // Company profile (singleton) + social links.
  const existingProfile = await db.companyProfile.findFirst({ select: { id: true } })
  if (!existingProfile) {
    await db.companyProfile.create({
      data: { ...PROFILE, createdById: actorId, updatedById: actorId, socialLinks: { create: SOCIALS } },
    })
  }

  // Authored KPI stats.
  for (const stat of STATS) {
    await db.companyStat.upsert({ where: { key: stat.key }, create: stat, update: {} })
  }

  // Brand assets — ensure each MediaAsset, then the slot. og_default reuses the primary logo.
  const primaryId = await ensureBrandMedia(db, LOGO_PRIMARY, 'Zakir Enterprise logo', actorId)
  const footerId = await ensureBrandMedia(db, LOGO_FOOTER, 'Zakir Enterprise logo', actorId)
  const faviconId = await ensureBrandMedia(db, FAVICON, null, actorId)
  const brandSlots: { key: 'logo_primary' | 'logo_footer' | 'favicon' | 'og_default'; mediaId: string }[] = [
    { key: 'logo_primary', mediaId: primaryId },
    { key: 'logo_footer', mediaId: footerId },
    { key: 'favicon', mediaId: faviconId },
    { key: 'og_default', mediaId: primaryId },
  ]
  for (const slot of brandSlots) {
    await db.brandAsset.upsert({ where: { key: slot.key }, create: slot, update: {} })
  }

  // Taxonomy vocabularies + ordered terms.
  for (const vocab of VOCABULARIES) {
    const taxonomy = await db.taxonomy.upsert({
      where: { slug: vocab.slug },
      create: { slug: vocab.slug, label: vocab.label, isShared: vocab.isShared },
      update: {},
    })
    for (const [position, label] of vocab.terms.entries()) {
      const slug = termSlug(label)
      await db.taxonomyTerm.upsert({
        where: { taxonomyId_slug: { taxonomyId: taxonomy.id, slug } },
        create: { taxonomyId: taxonomy.id, slug, label, position, isActive: true },
        update: {},
      })
    }
  }

  // Typed global settings.
  for (const setting of SETTINGS) {
    await db.settingValue.upsert({ where: { key: setting.key }, create: setting, update: {} })
  }

  const termCount = VOCABULARIES.reduce((n, v) => n + v.terms.length, 0)
  console.log(
    `Site seed: profile ${existingProfile ? 'present' : 'created'}, ` +
      `${STATS.length} stats, 4 brand slots, ${VOCABULARIES.length} vocabularies / ${termCount} terms, ${SETTINGS.length} settings (idempotent).`,
  )
}
