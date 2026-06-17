import type { PrismaClient } from '@prisma/client'
import { getOptionSets } from '../../lib/leads/options'

/**
 * LEADS seed (leads-be-1). There are **no legacy leads** to import, so this seeds
 * no `Lead` rows — a fresh inbox is the correct initial state. The module's only
 * "seed" is its controlled option sets (FR-LEADS-020), which are CODE constants in
 * `lib/leads/options.ts` (inquiry types + labels, interested services, budgets,
 * timelines), not table rows — so there is nothing to persist and this is
 * idempotent by construction. It returns the option-set sizes so the runner / a
 * smoke check can confirm the form vocabularies are intact (9 / 11 / 6 / 6).
 */
export async function seedLeads(_db: PrismaClient) {
  const o = getOptionSets()
  return {
    inquiryTypes: o.inquiry_types.length,
    services: o.services.length,
    budgets: o.budgets.length,
    timelines: o.timelines.length,
  }
}
