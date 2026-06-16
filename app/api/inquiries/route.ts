import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/lib/errors'
import { submitLeadSchema, HONEYPOT_FIELD } from '@/lib/validation/leads'
import { submitLead, isHoneypotTripped } from '@/lib/leads/submit'
import { rateLimit, SUBMIT_RATE_LIMIT } from '@/lib/leads/rate-limit'
import { clientIp, sourcePageFrom } from '@/lib/leads/request'

export const runtime = 'nodejs'

const SUCCESS_MESSAGE = "We'll contact you within two working days."

/**
 * POST /api/inquiries — the public Let's-Collaborate submit (FR-LEADS-001…005/022).
 * The only public **write** in the platform (BR-1): rate-limited + spam-guarded. On
 * success creates a Lead (`status:new`), associates `attachment_ids`, generates the
 * `ZE-NNNNNN` reference, and returns it. A honeypot-positive submission is stored as
 * spam and still returns a **generic success** so the bot can't probe the logic
 * (BR-8); a rate-limited one gets `429`. Only the reference is echoed back — the full
 * lead is admin-only.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const userAgent = request.headers.get('user-agent')

  const rl = rateLimit(`inq-submit:${ip}`, SUBMIT_RATE_LIMIT)
  if (!rl.allowed) {
    return NextResponse.json(
      { statusCode: 429, error: 'TooManyRequests', message: 'Too many submissions, please try again shortly.', details: [] },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusCode: 400, error: 'BadRequest', message: 'Expected a JSON body', details: [] }, { status: 400 })
  }

  const parsed = submitLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ statusCode: 422, error: 'ValidationError', message: 'Invalid submission', details: parsed.error.issues }, { status: 422 })
  }

  const honeypot = isHoneypotTripped(parsed.data[HONEYPOT_FIELD])
  const ctx = { ip, userAgent, sourcePage: sourcePageFrom(request) }

  try {
    const result = await submitLead(parsed.data, ctx, { markSpam: honeypot })
    return NextResponse.json({ reference_no: result.reference_no, status: 'received', message: SUCCESS_MESSAGE }, { status: 201 })
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(e.toEnvelope(), { status: 422 })
    }
    throw e
  }
}
