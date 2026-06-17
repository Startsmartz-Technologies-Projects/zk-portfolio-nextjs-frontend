// USERS module — the cross-cutting authorization + audit surface every admin
// module composes. See lib/users/README.md for the adoption pattern.

export { CAPABILITIES, ROLE_CAPABILITIES, can, type Capability } from './capabilities'
export { requireCapability, UnauthorizedError, ForbiddenError } from './rbac'
export { audit, type AuditInput, type AuditAction } from './audit'
export {
  listAuditLog,
  streamAuditLogCsv,
  auditItemToCsvLine,
  AUDIT_CSV_COLUMNS,
  type AuditLogFilters,
  type AuditLogItem,
  type AuditLogPage,
  type AuditLogActor,
} from './audit-read'
