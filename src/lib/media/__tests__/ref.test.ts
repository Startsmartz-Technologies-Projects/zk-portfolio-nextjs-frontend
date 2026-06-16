import { describe, it, expect } from 'vitest'
import { isImageRef, isDocRef, isWithdrawnRef, formatBytes } from '@/src/lib/media/ref'
import type { MediaRef } from '@/lib/data/media'

const imageRef: MediaRef = { id: 'a', url: 'https://res.cloudinary.com/x/image/upload/v1/p.png', alt: 'A wall', width: 800, height: 600 }
const docRef: MediaRef = { id: 'b', url: 'https://res.cloudinary.com/x/raw/upload/v1/cert.pdf', format: 'pdf', original_filename: 'cert.pdf', bytes: 2_500_000 }
const withdrawn: MediaRef = { id: 'c', withdrawn: true }

describe('MediaRef guards', () => {
  it('isImageRef only matches the image variant', () => {
    expect(isImageRef(imageRef)).toBe(true)
    expect(isImageRef(docRef)).toBe(false)
    expect(isImageRef(withdrawn)).toBe(false)
    expect(isImageRef(null)).toBe(false)
    expect(isImageRef(undefined)).toBe(false)
  })

  it('isDocRef only matches the document variant', () => {
    expect(isDocRef(docRef)).toBe(true)
    expect(isDocRef(imageRef)).toBe(false)
    expect(isDocRef(withdrawn)).toBe(false)
  })

  it('isWithdrawnRef only matches the withdrawn marker', () => {
    expect(isWithdrawnRef(withdrawn)).toBe(true)
    expect(isWithdrawnRef(imageRef)).toBe(false)
    expect(isWithdrawnRef(docRef)).toBe(false)
  })
})

describe('formatBytes', () => {
  it('formats common sizes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2_500_000)).toBe('2.4 MB')
    expect(formatBytes(1024)).toBe('1 KB')
  })
  it('returns empty string for missing/invalid sizes', () => {
    expect(formatBytes(null)).toBe('')
    expect(formatBytes(0)).toBe('')
    expect(formatBytes(undefined)).toBe('')
  })
})
