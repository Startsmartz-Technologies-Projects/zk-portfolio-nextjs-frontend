import { describe, it, expect } from 'vitest'
import { buildCloudinaryUrl, isCloudinaryUrl } from '@/src/lib/media/cloudinary-url'
import cloudinaryLoader from '@/src/lib/cloudinary-loader'

const CLD = 'https://res.cloudinary.com/dk4csiouq/image/upload/v1777186435/Heading_25_tzjq9d.png'

describe('isCloudinaryUrl', () => {
  it('recognizes a Cloudinary delivery URL', () => {
    expect(isCloudinaryUrl(CLD)).toBe(true)
  })
  it('rejects non-Cloudinary URLs and local paths', () => {
    expect(isCloudinaryUrl('https://images.unsplash.com/photo-1.jpg')).toBe(false)
    expect(isCloudinaryUrl('/og-default.png')).toBe(false)
  })
})

describe('buildCloudinaryUrl', () => {
  it('injects f_auto,q_auto,w_<width> after /upload/', () => {
    const out = buildCloudinaryUrl({ src: CLD, width: 640 })
    expect(out).toContain('/upload/f_auto,q_auto,w_640/')
    // version + public id preserved
    expect(out).toContain('/v1777186435/Heading_25_tzjq9d.png')
  })

  it('honors an explicit quality', () => {
    const out = buildCloudinaryUrl({ src: CLD, width: 320, quality: 75 })
    expect(out).toContain('/upload/f_auto,q_75,w_320/')
  })

  it('preserves pre-existing chained transforms', () => {
    const withTransform = 'https://res.cloudinary.com/dk4csiouq/image/upload/q_auto/f_auto/v1/x.png'
    const out = buildCloudinaryUrl({ src: withTransform, width: 800 })
    expect(out).toBe('https://res.cloudinary.com/dk4csiouq/image/upload/f_auto,q_auto,w_800/q_auto/f_auto/v1/x.png')
  })

  it('passes non-Cloudinary URLs through untouched', () => {
    const unsplash = 'https://images.unsplash.com/photo-1?ixlib=rb-4.0'
    expect(buildCloudinaryUrl({ src: unsplash, width: 1200 })).toBe(unsplash)
    expect(buildCloudinaryUrl({ src: '/local.png', width: 100 })).toBe('/local.png')
  })
})

describe('cloudinaryLoader (next/image default export)', () => {
  it('delegates to buildCloudinaryUrl', () => {
    expect(cloudinaryLoader({ src: CLD, width: 256 })).toBe(buildCloudinaryUrl({ src: CLD, width: 256 }))
  })
})
