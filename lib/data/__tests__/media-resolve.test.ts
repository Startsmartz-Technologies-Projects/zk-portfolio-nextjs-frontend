import { describe, it, expect, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { ValidationError } from '@/lib/errors'
import {
  registerAsset,
  softDeleteAsset,
  resolveMediaRefs,
  getAssetUsage,
  computeAssetUsage,
  runMediaCleanup,
  type MediaRef,
} from '@/lib/data/media'

const hasDb = !!process.env.DATABASE_URL
const TAG = `test-mref-${Math.floor(Math.random() * 1e9)}`

const hasWithdrawn = (r: MediaRef): r is { id: string; withdrawn: true } => 'withdrawn' in r

describe('runMediaCleanup', () => {
  it('is a no-op until Cloudinary is wired (deferred)', async () => {
    expect(await runMediaCleanup()).toMatchObject({ reaped: 0 })
  })
})

describe.skipIf(!hasDb)('media resolve & integrity (integration)', () => {
  afterAll(async () => {
    await db.mediaAsset.deleteMany({ where: { publicId: { startsWith: TAG } } })
    await db.$disconnect()
  })

  it('resolves image and document refs in their respective shapes', async () => {
    const img = await registerAsset(null, {
      public_id: `${TAG}/img`, url: 'https://res.cloudinary.com/x/image/upload/v1/i.jpg', format: 'jpg', bytes: 100, width: 800, height: 600, resource_type: 'image', original_filename: 'i.jpg',
    })
    const doc = await registerAsset(null, {
      public_id: `${TAG}/doc`, url: 'https://res.cloudinary.com/x/raw/upload/v1/d.pdf', format: 'pdf', bytes: 2048, resource_type: 'document', original_filename: 'spec.pdf',
    })

    const [imgRef, docRef] = await resolveMediaRefs([img.id, doc.id])
    expect(imgRef).toMatchObject({ id: img.id, url: expect.stringContaining('i.jpg'), width: 800, height: 600 })
    expect(docRef).toMatchObject({ id: doc.id, format: 'pdf', original_filename: 'spec.pdf', bytes: 2048 })
  })

  it('marks unknown and soft-deleted ids as withdrawn, order-preserving', async () => {
    const a = await registerAsset(null, {
      public_id: `${TAG}/wd`, url: 'https://res.cloudinary.com/x/image/upload/v1/w.jpg', format: 'jpg', bytes: 100, width: 10, height: 10, resource_type: 'image',
    })
    await softDeleteAsset(null, a.id)
    const missingId = '00000000-0000-0000-0000-000000000000'

    const refs = await resolveMediaRefs([a.id, missingId])
    expect(refs).toHaveLength(2)
    expect(hasWithdrawn(refs[0]) && refs[0].id === a.id).toBe(true)
    expect(hasWithdrawn(refs[1]) && refs[1].id === missingId).toBe(true)
  })

  it('rejects more than 100 ids', async () => {
    await expect(resolveMediaRefs(Array.from({ length: 101 }, (_, i) => `id-${i}`))).rejects.toBeInstanceOf(ValidationError)
  })

  it('reports empty usage until consumer modules land (delete-guard allows hard-delete)', async () => {
    const a = await registerAsset(null, {
      public_id: `${TAG}/use`, url: 'https://res.cloudinary.com/x/image/upload/v1/u.jpg', format: 'jpg', bytes: 100, width: 10, height: 10, resource_type: 'image',
    })
    expect(await computeAssetUsage(a.id)).toEqual([])
    expect(await getAssetUsage(a.id)).toEqual({ asset_id: a.id, references: [] })
  })
})
