import { NextRequest, NextResponse } from 'next/server'
import { runMediaCleanup } from '@/lib/data/media'

// POST /api/admin/media/cleanup — cron-triggered reap of abandoned/replaced Cloudinary
// objects (media-be-3, edge 1/5). Cron carries no session, so it's guarded by a shared
// secret (`CRON_SECRET`) rather than the role guard.
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { statusCode: 503, error: 'NotConfigured', message: 'CRON_SECRET is not set', details: [] },
      { status: 503 },
    )
  }
  if (request.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Invalid cron secret', details: [] },
      { status: 401 },
    )
  }
  const result = await runMediaCleanup()
  return NextResponse.json(result)
}
