import { NextRequest, NextResponse } from 'next/server'
import { requireCapability, UnauthorizedError, ForbiddenError } from '@/lib/users/rbac'
import { streamLeadsCsv } from '@/lib/data/leads'
import { listLeadsSchema, type ListLeadsInput } from '@/lib/validation/leads'

export const runtime = 'nodejs'

/**
 * GET /api/admin/inquiries/export — streamed CSV of the filtered, non-deleted lead
 * set (FR-LEADS-019). Admin-only via the `leads_manage` capability; an editor gets a
 * 403 (and a recorded `access_denied` entry, per requireCapability). Query params
 * mirror the inbox list (contract §4); booleans are parsed explicitly.
 */
function parseFilters(p: URLSearchParams): ListLeadsInput {
  const raw = {
    q: p.get('q') ?? undefined,
    status: p.get('status') ?? undefined,
    inquiryType: p.get('inquiry_type') ?? undefined,
    budget: p.get('budget') ?? undefined,
    timeline: p.get('timeline') ?? undefined,
    service: p.get('service') ?? undefined,
    assigneeId: p.get('assignee') ?? undefined,
    from: p.get('from') ?? undefined,
    to: p.get('to') ?? undefined,
    sort: p.get('sort') ?? undefined,
    spam: p.get('spam') === 'true' ? true : undefined,
  }
  const r = listLeadsSchema.safeParse(raw)
  return r.success ? r.data : {}
}

export async function GET(request: NextRequest) {
  try {
    await requireCapability('leads_manage')
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ statusCode: 401, error: e.code, message: e.message, details: [] }, { status: 401 })
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ statusCode: 403, error: e.code, message: e.message, details: [] }, { status: 403 })
    }
    throw e
  }

  const stream = streamLeadsCsv(parseFilters(request.nextUrl.searchParams))
  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="leads.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
