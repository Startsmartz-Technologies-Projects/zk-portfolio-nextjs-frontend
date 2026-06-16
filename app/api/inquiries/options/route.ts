import { NextResponse } from 'next/server'
import { getOptionSets } from '@/lib/leads/options'

export const runtime = 'nodejs'

/**
 * GET /api/inquiries/options — the public option sets the Let's-Collaborate form
 * renders (FR-LEADS-021/023): inquiry types + labels, interested services, budget +
 * timeline ranges. Read-only and cacheable; sourced from code constants, not the DB.
 */
export async function GET() {
  return NextResponse.json(getOptionSets(), {
    status: 200,
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600' },
  })
}
