import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'
import { parseCloudinaryUrl, seedMedia } from '../media.seed'

const hasDb = !!process.env.DATABASE_URL

// ── Pure URL parsing (no DB) ──────────────────────────────────────────────

describe('parseCloudinaryUrl', () => {
  it('parses a plain upload URL (version, no transforms)', () => {
    expect(parseCloudinaryUrl('https://res.cloudinary.com/dk4csiouq/image/upload/v1776939227/bridge_hero_zox21k.jpg')).toEqual(
      { publicId: 'bridge_hero_zox21k', format: 'jpg' },
    )
  })

  it('strips transform segments before the version', () => {
    expect(
      parseCloudinaryUrl('https://res.cloudinary.com/dk4csiouq/image/upload/q_auto/f_auto/v1776763509/Heading_16_nybblx.png'),
    ).toEqual({ publicId: 'Heading_16_nybblx', format: 'png' })
  })

  it('keeps folder paths and dots inside the public_id', () => {
    expect(
      parseCloudinaryUrl('https://res.cloudinary.com/dk4csiouq/image/upload/v1777271735/Central_Mosque-cumilla_cant.-hero_section_mx6wco.jpg'),
    ).toEqual({ publicId: 'Central_Mosque-cumilla_cant.-hero_section_mx6wco', format: 'jpg' })
  })

  it('returns null for a non-Cloudinary / non-image URL', () => {
    expect(parseCloudinaryUrl('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600')).toBeNull()
  })
})

// ── Seed integration ──────────────────────────────────────────────────────

describe.skipIf(!hasDb)('seedMedia (integration)', () => {
  it('imports Cloudinary images idempotently with the expected shape', async () => {
    await seedMedia(db)
    const countAfterFirst = await db.mediaAsset.count()

    // Re-running adds nothing (keyed on public_id).
    await seedMedia(db)
    expect(await db.mediaAsset.count()).toBe(countAfterFirst)
    expect(countAfterFirst).toBeGreaterThanOrEqual(74)

    // Every seeded row is a Cloudinary image with alt text left null for backfill.
    const nonImage = await db.mediaAsset.count({ where: { resourceType: { not: 'image' } } })
    expect(nonImage).toBe(0)
    const missingPublicId = await db.mediaAsset.count({ where: { publicId: '' } })
    expect(missingPublicId).toBe(0)
  })

  it('parses public_id/format and tags by source module (plain URL)', async () => {
    const asset = await db.mediaAsset.findFirst({ where: { publicId: 'bridge_hero_zox21k' } })
    expect(asset).not.toBeNull()
    expect(asset!.format).toBe('jpg')
    expect(asset!.provider).toBe('cloudinary')
    expect(asset!.resourceType).toBe('image')
    expect(asset!.altText).toBeNull()
    expect(asset!.tags).toContain('projects')
  })

  it('strips transforms when importing a brand asset', async () => {
    const asset = await db.mediaAsset.findFirst({ where: { publicId: 'Heading_16_nybblx' } })
    expect(asset).not.toBeNull()
    expect(asset!.format).toBe('png')
    expect(asset!.tags).toContain('brand')
  })

  it('does not import non-Cloudinary stock (Unsplash) placeholders', async () => {
    const unsplash = await db.mediaAsset.count({ where: { url: { contains: 'images.unsplash.com' } } })
    expect(unsplash).toBe(0)
  })
})
