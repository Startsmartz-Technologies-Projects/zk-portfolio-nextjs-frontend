import { NextRequest, NextResponse } from 'next/server'
import { AuditAction } from '@prisma/client'
import { requireCapability, UnauthorizedError, ForbiddenError } from '@/lib/users/rbac'
import { streamAuditLogCsv, type AuditLogFilters } from '@/lib/users/audit-read'

export const runtime = 'nodejs'

const AUDIT_ACTIONS = new Set<string>(Object.values(AuditAction))

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function parseFilters(params: URLSearchParams): AuditLogFilters {
  const action = params.get('action')
  return {
    actorId: params.get('actor') ?? undefined,
    action: action && AUDIT_ACTIONS.has(action) ? (action as AuditAction) : undefined,
    entityType: params.get('entity_type') ?? undefined,
    entityId: params.get('entity_id') ?? undefined,
    from: parseDate(params.get('from')),
    to: parseDate(params.get('to')),
    q: params.get('q') ?? undefined,
  }
}

/**
 * GET /api/admin/audit/export — streamed CSV of the filtered audit range
 * (FR-USERS-016). Admin-only via the `audit_log` capability; an editor gets a
 * 403 (and a recorded `access_denied` entry, per requireCapability).
 */
export async function GET(request: NextRequest) {
  try {
    await requireCapability('audit_log')
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ statusCode: 401, error: e.code, message: e.message, details: [] }, { status: 401 })
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ statusCode: 403, error: e.code, message: e.message, details: [] }, { status: 403 })
    }
    throw e
  }

  const filters = parseFilters(request.nextUrl.searchParams)
  const stream = streamAuditLogCsv(filters)

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="audit-log.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
