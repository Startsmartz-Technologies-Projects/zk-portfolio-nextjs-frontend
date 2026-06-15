import { describe, it, expect } from 'vitest'
import { signCloudinaryParams, buildSignedUpload, transformationUrl, isCloudinaryConfigured } from '@/lib/media/cloudinary'

describe('signCloudinaryParams', () => {
  it('is deterministic and independent of key insertion order', () => {
    const a = signCloudinaryParams({ folder: 'uploads', timestamp: 1700000000 }, 'secret')
    const b = signCloudinaryParams({ timestamp: 1700000000, folder: 'uploads' }, 'secret')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{40}$/) // sha1 hex
  })
  it('changes with the secret and the params', () => {
    const base = signCloudinaryParams({ folder: 'uploads', timestamp: 1 }, 's1')
    expect(signCloudinaryParams({ folder: 'uploads', timestamp: 1 }, 's2')).not.toBe(base)
    expect(signCloudinaryParams({ folder: 'uploads', timestamp: 2 }, 's1')).not.toBe(base)
  })
})

describe('transformationUrl', () => {
  it('inserts the transform after /upload/', () => {
    expect(transformationUrl('https://res.cloudinary.com/x/image/upload/v1/a.jpg')).toBe(
      'https://res.cloudinary.com/x/image/upload/f_auto,q_auto/v1/a.jpg',
    )
    expect(transformationUrl('https://res.cloudinary.com/x/image/upload/v1/a.jpg', 'w_400')).toContain('/upload/w_400/')
  })
})

describe('buildSignedUpload', () => {
  it('throws when Cloudinary is not configured (deferred live integration)', () => {
    if (isCloudinaryConfigured()) return // skip if real creds are present in this env
    expect(() => buildSignedUpload('image', { allowedFormats: ['jpg'], maxBytes: 1000 })).toThrow(/not configured/)
  })

  it('produces a signed payload when configured (env injected for the test)', () => {
    const saved = { c: process.env.CLOUDINARY_CLOUD_NAME, k: process.env.CLOUDINARY_API_KEY, s: process.env.CLOUDINARY_API_SECRET }
    process.env.CLOUDINARY_CLOUD_NAME = 'testcloud'
    process.env.CLOUDINARY_API_KEY = 'testkey'
    process.env.CLOUDINARY_API_SECRET = 'testsecret'
    try {
      const payload = buildSignedUpload('image', { allowedFormats: ['jpg', 'png'], maxBytes: 1000, now: 1700000000 })
      expect(payload.cloud_name).toBe('testcloud')
      expect(payload.api_key).toBe('testkey')
      expect(payload.timestamp).toBe(1700000000)
      expect(payload.signature).toBe(signCloudinaryParams({ folder: 'uploads', timestamp: 1700000000 }, 'testsecret'))
      expect(payload.allowed_formats).toEqual(['jpg', 'png'])
    } finally {
      process.env.CLOUDINARY_CLOUD_NAME = saved.c
      process.env.CLOUDINARY_API_KEY = saved.k
      process.env.CLOUDINARY_API_SECRET = saved.s
    }
  })
})
