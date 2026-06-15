import { auth, type Principal } from '@/lib/auth'
import { can, type Capability } from './capabilities'
import { audit } from './audit'

/** Thrown when there is no valid authenticated session (maps to HTTP 401). */
export class UnauthorizedError extends Error {
  readonly statusCode = 401
  readonly code = 'Unauthorized'
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/** Thrown when the principal lacks the required capability (maps to HTTP 403). */
export class ForbiddenError extends Error {
  readonly statusCode = 403
  readonly code = 'Forbidden'
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Enforce the §8.2 capability policy on an admin route / server action
 * (FR-USERS-010/011). Layered on the AUTH session guard (`auth()`):
 *
 * - no / invalid session → {@link UnauthorizedError} (401).
 * - role lacks the capability → an `access_denied` audit entry + {@link ForbiddenError} (403).
 * - otherwise → returns the authenticated {@link Principal} so callers can stamp
 *   `created_by`/`updated_by` and pass the actor to {@link audit}.
 *
 * The area+action splits of §8.2 (e.g. Leads triage vs. delete/export) are encoded
 * as distinct {@link Capability} keys in `capabilities.ts`, so a single capability
 * argument covers the whole matrix.
 */
export async function requireCapability(capability: Capability): Promise<Principal> {
  const principal = await auth()
  if (!principal) throw new UnauthorizedError()

  if (!can(principal.role, capability)) {
    await audit({
      actorId: principal.user_id,
      action: 'access_denied',
      entityType: 'authorization',
      entityId: null,
      summary: `Denied ${principal.role} access to '${capability}'`,
      metadata: { role: principal.role, capability },
    })
    throw new ForbiddenError()
  }

  return principal
}
