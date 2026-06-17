'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { ValidationError } from '@/lib/errors'
import { getDashboardSummary, getDashboardActivity } from '@/lib/data/dashboard'
import { activityFeedSchema } from '@/lib/validation/dashboard'

// Dashboard admin reads (dash-be-1). Capability `dashboard` (admin + editor, §8.2);
// the composite + feed are role-filtered server-side from the principal's role, so an
// editor never receives admin-only figures (FR-DASH-011, BR-3). Read-only — no audit,
// no writes (FR-DASH-012).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

/** GET /admin/dashboard — the composite, role-filtered summary (FR-DASH-001…012). */
export async function getDashboardAction() {
  const principal = await requireCapability('dashboard')
  return getDashboardSummary(principal.role)
}

/** GET /admin/dashboard/activity — paginated, role-scoped recent-activity feed (FR-DASH-003/004). */
export async function getDashboardActivityAction(input: unknown = {}) {
  const principal = await requireCapability('dashboard')
  return getDashboardActivity(principal.role, parse(activityFeedSchema, input ?? {}))
}
