import { describe, it, expect, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ValidationError } from '@/lib/errors'
import {
  registerAsset,
  listAssets,
  getAsset,
  updateAssetMetadata,
  replaceAsset,
  softDeleteAsset,
  restoreAsset,
  hardDeleteAsset,
} from '@/lib/data/media'

const hasDb = !!process.env.DATABASE_URL
const TAG = `test-media-${Math.floor(Math.random() * 1e9)}`
const pid = (s: string) => `${TAG}/${s}`

function imagePayload(s: string, extra: Partial<{ format: string; bytes: number }> = {}) {
  return {
    public_id: pid(s),
    url: `https://res.cloudinary.com/x/image/upload/v1/${s}.jpg`,
    format: extra.format ?? 'jpg',
    bytes: extra.bytes ?? 12345,
    width: 1600,
    height: 900,
    resource_type: 'image' as const,
    original_filename: `${s}.jpg`,
  }
}

describe.skipIf(!hasDb)('media admin data layer (integration)', () => {
  afterAll(async () => {
    await db.mediaAsset.deleteMany({ where: { publicId: { startsWith: TAG } } })
    await db.$disconnect()
  })

  it('registers an asset (alt_present false until alt added) and rejects bad type/size', async () => {
    const a = await registerAsset(null, imagePayload('a'))
    expect(a.alt_present).toBe(false)
    expect(a.in_use).toBe(false)

    await expect(registerAsset(null, { ...imagePayload('bad'), format: 'exe' })).rejects.toBeInstanceOf(ValidationError)
    await expect(registerAsset(null, { ...imagePayload('big'), bytes: 999_999_999 })).rejects.toBeInstanceOf(ValidationError)
  })

  it('edits metadata: alt sets alt_present, tags are normalized', async () => {
    const a = await registerAsset(null, imagePayload('meta'))
    await updateAssetMetadata(null, a.id, { altText: 'A bridge at dusk', tags: ['Bridge', 'bridge', 'HERO'] })
    const fetched = await getAsset(a.id)
    expect(fetched.alt_present).toBe(true)
    expect(fetched.tags).toEqual(['bridge', 'hero']) // lowercased + de-duped
  })

  it('searches and filters the library, excluding soft-deleted by default', async () => {
    const a = await registerAsset(null, imagePayload('searchme'))
    await updateAssetMetadata(null, a.id, { tags: ['uniquetag'] })

    expect((await listAssets({ tag: 'uniquetag' })).data.some((x) => x.id === a.id)).toBe(true)
    expect((await listAssets({ resourceType: 'image', format: 'jpg', q: 'searchme' })).data.some((x) => x.id === a.id)).toBe(true)

    await softDeleteAsset(null, a.id)
    expect((await listAssets({ q: 'searchme' })).data.some((x) => x.id === a.id)).toBe(false)
    expect((await listAssets({ q: 'searchme', includeDeleted: true })).data.some((x) => x.id === a.id)).toBe(true)
    await restoreAsset(null, a.id)
    expect((await listAssets({ q: 'searchme' })).data.some((x) => x.id === a.id)).toBe(true)
  })

  it('replace keeps the id and swaps the file metadata', async () => {
    const a = await registerAsset(null, imagePayload('orig'))
    const replaced = await replaceAsset(null, a.id, imagePayload('replacement', { bytes: 6789 }))
    expect(replaced.id).toBe(a.id)
    expect(replaced.public_id).toBe(pid('replacement'))
    expect(replaced.bytes).toBe(6789)
  })

  it('hard-deletes an unreferenced asset (no consumers yet)', async () => {
    const a = await registerAsset(null, imagePayload('todelete'))
    await hardDeleteAsset(null, a.id)
    expect(await db.mediaAsset.findUnique({ where: { id: a.id } })).toBeNull()
  })
})
