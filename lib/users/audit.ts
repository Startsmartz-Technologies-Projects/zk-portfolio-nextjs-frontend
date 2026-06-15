import { db } from '@/lib/db'
import type { AuditAction, Prisma } from '@prisma/client'

export type { AuditAction }

export interface AuditInput {
  /**
   * The authenticated principal's user id, or null for System/anonymous events
   * (e.g. a public lead submission). Always taken from the session principal —
   * never client-supplied (BR-5).
   */
  actorId: string | null
  action: AuditAction
  /** The affected entity/module, e.g. `project`, `user`, `media_asset`, `authorization`. */
  entityType: string
  /** The affected record id; null for some auth/global events. */
  entityId?: string | null
  /** Human-readable description, e.g. "Published project '49m Steel Arch Bridge'". */
  summary: string
  /** Optional structured detail (changed fields, ip/user-agent for auth events). */
  metadata?: Prisma.InputJsonValue | null
}

/**
 * Write an append-only `AuditLogEntry` (FR-USERS-014/017, BR-5).
 *
 * **Call this only AFTER the underlying action has committed** — never inside its
 * transaction — so a rolled-back action leaves no phantom entry (edge 7/12). Because
 * the insert is its own statement issued after the caller's mutation returns, there
 * is no shared transaction to roll back.
 *
 * It is **best-effort**: a failed audit write is logged and swallowed so it never
 * fails the (already-committed) action it records (NFR §15). Entries are immutable —
 * this module exposes no update or delete path (FR-USERS-017).
 */
export async function audit(input: AuditInput): Promise<void> {
  try {
    await db.auditLogEntry.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata ?? undefined,
      },
    })
  } catch (err) {
    // Never fail the underlying action because of an audit write.
    console.error('[audit] failed to write entry', { action: input.action, entityType: input.entityType }, err)
  }
}
