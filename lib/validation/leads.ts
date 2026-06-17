import { z } from 'zod'
import { isInquiryType, isBudgetRange, isTimelineRange, isInterestedService } from '@/lib/leads/options'

// Server-side validation for the Leads admin inbox (leads-be-2) + the public intake
// (leads-be-3), SRS §12, contract §3/§4. `inquiry_type`/`status` mirror the Prisma
// enums; `budget`/`timeline`/`service` are free strings on a *filter* but are checked
// against the option sets on the public *write*.

export const leadStatusEnum = z.enum(['new', 'in_review', 'contacted', 'qualified', 'won', 'lost', 'spam', 'archived'])
export const inquiryTypeEnum = z.enum(['quote', 'new', 'collab', 'gov', 'tender', 'vendor', 'sub', 'partner', 'general'])

/** Inbox list/search/filter/sort query (FR-LEADS-009/010/011/012). */
export const listLeadsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  status: leadStatusEnum.optional(),
  inquiryType: inquiryTypeEnum.optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  service: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z.enum(['recent', 'oldest', 'status']).optional(),
  /** Only `true` surfaces spam; default/absent excludes it (contract §4). */
  spam: z.boolean().optional(),
  includeDeleted: z.boolean().optional(),
})
export type ListLeadsInput = z.infer<typeof listLeadsSchema>

/** Triage patch — any of status / assignee / spam flag (FR-LEADS-014/015/018). */
export const triagePatchSchema = z
  .object({
    status: leadStatusEnum.optional(),
    assignee_id: z.string().uuid().nullable().optional(),
    is_spam: z.boolean().optional(),
  })
  .refine((d) => d.status !== undefined || d.assignee_id !== undefined || d.is_spam !== undefined, {
    message: 'Provide at least one of status, assignee_id, or is_spam',
  })
export type TriagePatchInput = z.infer<typeof triagePatchSchema>

/** Internal note body (FR-LEADS-016). */
export const addNoteSchema = z.object({ body: z.string().trim().min(1).max(5000) })
export type AddNoteInput = z.infer<typeof addNoteSchema>

// ── Public intake (leads-be-3, contract §3) ─────────────────────────────────

/** Honeypot field the public form leaves empty; a filled value flags spam (BR-8). */
export const HONEYPOT_FIELD = 'company_website'

/** An optional option-set value: '' / null / absent → null; otherwise must be a member. */
const optionalOptionOf = (check: (v: string) => boolean, field: string) =>
  z.preprocess(
    (v) => (v === '' || v == null ? null : v),
    z
      .string()
      .refine(check, { message: `Invalid ${field}` })
      .nullable(),
  )

/** Public submission payload (FR-LEADS-001/002, contract §3). Server-side validation
 *  is independent of the client form (it can be bypassed). */
export const submitLeadSchema = z.object({
  name: z.string().trim().min(1).max(160),
  company: z.string().trim().max(200).nullish(),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(1).max(200),
  inquiry_type: z.string().refine(isInquiryType, { message: 'Invalid inquiry_type' }),
  services: z
    .array(z.string())
    .default([])
    .refine((arr) => arr.every(isInterestedService), { message: 'Unknown interested service' }),
  budget: optionalOptionOf(isBudgetRange, 'budget'),
  location: z.string().trim().max(200).nullish(),
  timeline: optionalOptionOf(isTimelineRange, 'timeline'),
  bid_name: z.string().trim().max(200).nullish(),
  message: z.string().trim().min(1).max(5000),
  attachment_ids: z.array(z.string().uuid()).max(10).default([]),
  [HONEYPOT_FIELD]: z.string().optional(),
})
export type SubmitLeadInput = z.infer<typeof submitLeadSchema>
