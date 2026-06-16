import { describe, it, expect } from 'vitest'
import { isHoneypotTripped, dedupeHash } from '@/lib/leads/submit'
import { extensionOf, validateLeadAttachment, MAX_LEAD_ATTACHMENT_BYTES } from '@/lib/leads/broker'
import { submitLeadSchema } from '@/lib/validation/leads'
import { ValidationError } from '@/lib/errors'

const base = {
  name: 'Engr. Rafiqul Islam',
  phone: '+8801712345678',
  email: 'rafiq@example.com',
  subject: 'Banani tower',
  inquiry_type: 'quote',
  message: 'We need a priced scope',
}

describe('honeypot + dedupe helpers', () => {
  it('trips the honeypot only on a non-empty value', () => {
    expect(isHoneypotTripped(undefined)).toBe(false)
    expect(isHoneypotTripped('')).toBe(false)
    expect(isHoneypotTripped('   ')).toBe(false)
    expect(isHoneypotTripped('http://spam')).toBe(true)
  })

  it('dedupe hash is stable and case/space-insensitive on email', () => {
    const a = dedupeHash('Rafiq@Example.com', 'Subj', 'Body')
    const b = dedupeHash('rafiq@example.com', 'Subj', 'Body')
    expect(a).toBe(b)
    expect(dedupeHash('x@y.com', 'A', 'B')).not.toBe(dedupeHash('x@y.com', 'A', 'C'))
  })
})

describe('attachment validation', () => {
  it('extracts a lowercased extension', () => {
    expect(extensionOf('tender-BoQ.PDF')).toBe('pdf')
    expect(extensionOf('photo.jpeg')).toBe('jpeg')
    expect(extensionOf('noext')).toBe('')
  })

  it('accepts allowed types within the size cap', () => {
    expect(validateLeadAttachment('boq.pdf', 1024)).toEqual({ format: 'pdf' })
    expect(validateLeadAttachment('site.png', 1024)).toEqual({ format: 'png' })
  })

  it('rejects a disallowed type and an oversized file (422)', () => {
    expect(() => validateLeadAttachment('virus.exe', 10)).toThrow(ValidationError)
    expect(() => validateLeadAttachment('boq.pdf', MAX_LEAD_ATTACHMENT_BYTES + 1)).toThrow(ValidationError)
  })
})

describe('submitLeadSchema (server-side validation, SRS §12)', () => {
  it('accepts a valid payload and normalizes empty option fields to null', () => {
    const r = submitLeadSchema.safeParse({ ...base, budget: '', timeline: '', services: [] })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.budget).toBeNull()
      expect(r.data.timeline).toBeNull()
      expect(r.data.attachment_ids).toEqual([])
    }
  })

  it('rejects an invalid inquiry_type (edge 5)', () => {
    expect(submitLeadSchema.safeParse({ ...base, inquiry_type: 'bogus' }).success).toBe(false)
  })

  it('rejects a bad budget / service / email', () => {
    expect(submitLeadSchema.safeParse({ ...base, budget: 'BDT 900 Cr' }).success).toBe(false)
    expect(submitLeadSchema.safeParse({ ...base, services: ['Plumbing'] }).success).toBe(false)
    expect(submitLeadSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false)
  })

  it('requires name / phone / email / subject / inquiry_type / message', () => {
    expect(submitLeadSchema.safeParse({ ...base, name: '' }).success).toBe(false)
    expect(submitLeadSchema.safeParse({ ...base, message: '' }).success).toBe(false)
  })

  it('accepts a valid budget/timeline and caps attachment count at 10', () => {
    const ok = submitLeadSchema.safeParse({ ...base, budget: 'BDT 20 - 50 Cr', timeline: '3 - 6 months' })
    expect(ok.success).toBe(true)
    const tooMany = submitLeadSchema.safeParse({ ...base, attachment_ids: Array.from({ length: 11 }, () => '00000000-0000-0000-0000-000000000000') })
    expect(tooMany.success).toBe(false)
  })
})
