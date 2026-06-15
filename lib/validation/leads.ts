import { z } from 'zod'

// Server-side validation for the Leads admin inbox (leads-be-2, SRS §12, contract §4).
// The public submit/upload/options schemas live alongside the intake (leads-be-3).
// `inquiry_type`/`status` mirror the Prisma enums; `budget`/`timeline`/`service` are
// free strings (option-set membership is enforced on the public write, not on a filter).

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
