'use server'

import { requireCapability } from '@/lib/users/rbac'
import { listAuditLog, type AuditLogItem } from '@/lib/users/audit-read'

// Per-record recent activity for the editor publish/audit panel. Editor-visible by
// ADR 0003 (an editor sees a record's OWN recent activity; the full cross-entity log is
// Admin-only, in users-admin) — so this is `content`-gated, scoped to one entity.
export async function recentEntityAuditAction(
  entityType: string,
  entityId: string,
  limit = 8,
): Promise<AuditLogItem[]> {
  await requireCapability('content')
  const page = await listAuditLog({ entityType, entityId, page: 1, pageSize: limit })
  return page.data
}
