import { NextRequest, NextResponse } from 'next/server'
import { requireCapability, UnauthorizedError, ForbiddenError } from '@/lib/users/rbac'
import { getLeadAttachmentTarget } from '@/lib/data/leads'
import { NotFoundError } from '@/lib/errors'

export const runtime = 'nodejs'

/**
 * GET /api/admin/inquiries/:id/attachments/:attId/download — access-controlled
 * download for a private lead attachment (FR-LEADS-007, BR-4). Requires a staff
 * session with `leads_triage`; without one the request is rejected (401/403). The
 * staff session IS the access control; the Cloudinary signed/time-limited delivery
 * is the deferred MEDIA path (MEDIA §17 Q3), so for now we redirect to the stored
 * secure URL behind the auth gate.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string; attId: string }> }) {
  try {
    await requireCapability('leads_triage')
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ statusCode: 401, error: e.code, message: e.message, details: [] }, { status: 401 })
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ statusCode: 403, error: e.code, message: e.message, details: [] }, { status: 403 })
    }
    throw e
  }

  const { id, attId } = await params
  try {
    const target = await getLeadAttachmentTarget(id, attId)
    return NextResponse.redirect(target.url, 302)
  } catch (e) {
    if (e instanceof NotFoundError) {
      return NextResponse.json({ statusCode: 404, error: 'NotFound', message: e.message, details: [] }, { status: 404 })
    }
    throw e
  }
}
