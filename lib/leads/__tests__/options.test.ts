import { describe, it, expect } from 'vitest'
import {
  INQUIRY_TYPES,
  INTERESTED_SERVICES,
  BUDGET_RANGES,
  TIMELINE_RANGES,
  getOptionSets,
  inquiryTypeLabel,
  isInquiryType,
  isInterestedService,
  isBudgetRange,
  isTimelineRange,
} from '@/lib/leads/options'

describe('lead option sets (FR-LEADS-020, SRS §8.4)', () => {
  it('has the exact cardinalities seeded from the form (9 / 11 / 6 / 6)', () => {
    expect(INQUIRY_TYPES).toHaveLength(9)
    expect(INTERESTED_SERVICES).toHaveLength(11)
    expect(BUDGET_RANGES).toHaveLength(6)
    expect(TIMELINE_RANGES).toHaveLength(6)
  })

  it('maps inquiry values to their display labels (shared with PAGES intent_cards)', () => {
    expect(inquiryTypeLabel('quote')).toBe("Let's Collaborate")
    expect(inquiryTypeLabel('tender')).toBe('Bid / Tender Inquiry')
    expect(INQUIRY_TYPES.map((t) => t.value)).toEqual(['quote', 'new', 'collab', 'gov', 'tender', 'vendor', 'sub', 'partner', 'general'])
  })

  it('membership guards accept seeded values and reject others', () => {
    expect(isInquiryType('quote')).toBe(true)
    expect(isInquiryType('bogus')).toBe(false)
    expect(isInterestedService('Building Construction')).toBe(true)
    expect(isInterestedService('Plumbing')).toBe(false)
    expect(isBudgetRange('BDT 20 - 50 Cr')).toBe(true)
    expect(isBudgetRange('BDT 100 Cr')).toBe(false)
    expect(isTimelineRange('Immediate (< 1 month)')).toBe(true)
    expect(isTimelineRange('next week')).toBe(false)
  })

  it('getOptionSets returns the public payload shape (contract §2.3)', () => {
    const o = getOptionSets()
    expect(o.inquiry_types[0]).toEqual({ value: 'quote', label: "Let's Collaborate" })
    expect(o.services).toContain('Equipment Systems')
    expect(o.budgets).toContain('To be discussed')
    expect(o.timelines).toContain('Flexible / planning stage')
  })
})
