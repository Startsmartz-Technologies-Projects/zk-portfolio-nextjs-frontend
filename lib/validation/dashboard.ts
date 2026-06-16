import { z } from 'zod'

// Validation for the Dashboard reads (dash-be-1). The composite takes no input;
// the activity feed accepts a bounded page/pageSize (≤50, SRS §12 / FR-DASH-003).

export const activityFeedSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
})
export type ActivityFeedInput = z.infer<typeof activityFeedSchema>
