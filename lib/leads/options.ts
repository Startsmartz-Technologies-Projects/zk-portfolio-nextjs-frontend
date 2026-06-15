import type { InquiryType } from '@prisma/client'

// The controlled option sets the public Let's-Collaborate form renders and the
// intake validates against (FR-LEADS-020/021, SRS §8.4). Seeded from the live
// form (`src/components/lets-collaborate-page-content.tsx`): `INTENT_ITEMS`,
// `SERVICE_ITEMS`, and the budget/timeline `<select>` lists. `inquiry_type` is a
// Prisma enum (its 9 values are stable identifiers); `budget`/`timeline`/`services`
// are stored as these RAW string labels (NOT enums — the values contain spaces) and
// validated against these constants. The `inquiry_type` value→label map is shared
// with the PAGES `intent_cards` section, which owns the display copy (BR-5).

export interface InquiryTypeOption {
  value: InquiryType
  label: string
}

/** The 9 inquiry types, value + display label, in form order. */
export const INQUIRY_TYPES: InquiryTypeOption[] = [
  { value: 'quote', label: "Let's Collaborate" },
  { value: 'new', label: 'New Construction Project' },
  { value: 'collab', label: 'Request Collaboration' },
  { value: 'gov', label: 'Government Project' },
  { value: 'tender', label: 'Bid / Tender Inquiry' },
  { value: 'vendor', label: 'Vendor / Supplier' },
  { value: 'sub', label: 'Subcontracting' },
  { value: 'partner', label: 'Partnership Discussion' },
  { value: 'general', label: 'General Inquiry' },
]

/** The 11 interested-service labels (a coarse interest checklist, LEADS-owned). */
export const INTERESTED_SERVICES = [
  'Building Construction',
  'Road Works',
  'Bridge & Culvert Works',
  'Earthwork & Site Development',
  'Drainage Work',
  'Structural Concrete Work',
  'Foundation Work',
  'Renovation & Maintenance',
  'Finishing Work',
  'Special Work',
  'Equipment Systems',
] as const

/** The 6 budget ranges (stored verbatim; not an enum — values contain spaces). */
export const BUDGET_RANGES = [
  'Under BDT 1 Cr',
  'BDT 1 - 5 Cr',
  'BDT 5 - 20 Cr',
  'BDT 20 - 50 Cr',
  'BDT 50 Cr +',
  'To be discussed',
] as const

/** The 6 timeline ranges (stored verbatim; not an enum — values contain spaces). */
export const TIMELINE_RANGES = [
  'Immediate (< 1 month)',
  '1 - 3 months',
  '3 - 6 months',
  '6 - 12 months',
  '12 months +',
  'Flexible / planning stage',
] as const

export const INQUIRY_TYPE_VALUES: InquiryType[] = INQUIRY_TYPES.map((t) => t.value)

/** The success-message intent label echoed to the submitter (SRS §11.D). */
export function inquiryTypeLabel(value: InquiryType): string {
  return INQUIRY_TYPES.find((t) => t.value === value)?.label ?? value
}

export function isInquiryType(v: string): v is InquiryType {
  return (INQUIRY_TYPE_VALUES as string[]).includes(v)
}
export function isInterestedService(v: string): boolean {
  return (INTERESTED_SERVICES as readonly string[]).includes(v)
}
export function isBudgetRange(v: string): boolean {
  return (BUDGET_RANGES as readonly string[]).includes(v)
}
export function isTimelineRange(v: string): boolean {
  return (TIMELINE_RANGES as readonly string[]).includes(v)
}

export interface OptionSets {
  inquiry_types: InquiryTypeOption[]
  services: string[]
  budgets: string[]
  timelines: string[]
}

/** The full option-set payload the public form reads (contract §2.3). */
export function getOptionSets(): OptionSets {
  return {
    inquiry_types: INQUIRY_TYPES,
    services: [...INTERESTED_SERVICES],
    budgets: [...BUDGET_RANGES],
    timelines: [...TIMELINE_RANGES],
  }
}
