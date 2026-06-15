import { describe, it, expect } from 'vitest'
import { formatReferenceNo, allocateReferenceNo, REFERENCE_NO_RE } from '@/lib/leads/reference-no'

describe('reference-no format', () => {
  it('zero-pads to six digits and matches ZE-NNNNNN', () => {
    expect(formatReferenceNo(7)).toBe('ZE-000007')
    expect(formatReferenceNo(482193)).toBe('ZE-482193')
    expect(formatReferenceNo(0)).toBe('ZE-000000')
    expect(REFERENCE_NO_RE.test(formatReferenceNo(7))).toBe(true)
    expect(REFERENCE_NO_RE.test(formatReferenceNo(999999))).toBe(true)
  })

  it('wraps a draw at or beyond the modulus back into 6 digits', () => {
    expect(formatReferenceNo(1_000_000)).toBe('ZE-000000')
    expect(formatReferenceNo(1_000_007)).toBe('ZE-000007')
    expect(REFERENCE_NO_RE.test(formatReferenceNo(1_234_567))).toBe(true)
  })
})

describe('allocateReferenceNo (collision retry)', () => {
  it('re-draws past taken references until it finds a free one', async () => {
    const taken = new Set(['ZE-000001', 'ZE-000002'])
    const draws = [1, 2, 3] // first two collide, third is free
    let i = 0
    const ref = await allocateReferenceNo(
      async (r) => taken.has(r),
      () => draws[i++],
    )
    expect(ref).toBe('ZE-000003')
    expect(i).toBe(3)
  })

  it('returns the first draw when nothing is taken', async () => {
    const ref = await allocateReferenceNo(async () => false, () => 482193)
    expect(ref).toBe('ZE-482193')
  })

  it('throws when it cannot find a free reference', async () => {
    await expect(allocateReferenceNo(async () => true, () => 5)).rejects.toThrow(/unique reference number/i)
  })
})
