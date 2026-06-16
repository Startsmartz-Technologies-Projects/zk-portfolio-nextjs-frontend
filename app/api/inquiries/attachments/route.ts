import { NextRequest, NextResponse } from 'next/server'
import { brokerLeadAttachment } from '@/lib/leads/broker'
import { ValidationError } from '@/lib/errors'
import { rateLimit, UPLOAD_RATE_LIMIT } from '@/lib/leads/rate-limit'
import { clientIp } from '@/lib/leads/request'

export const runtime = 'nodejs'

/**
 * POST /api/inquiries/attachments — public, rate-limited attachment upload
 * (FR-LEADS-006/022, BR-4). `multipart/form-data` with one `file`; LEADS brokers it
 * server-side into MEDIA as a private `document` tagged `lead` and returns the
 * `media_id` (the public client never receives Cloudinary signing credentials).
 * `422` on a disallowed type/size; `429` when rate-limited.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const rl = rateLimit(`inq-upload:${ip}`, UPLOAD_RATE_LIMIT)
  if (!rl.allowed) {
    return NextResponse.json(
      { statusCode: 429, error: 'TooManyRequests', message: 'Too many uploads, please try again shortly.', details: [] },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ statusCode: 400, error: 'BadRequest', message: 'Expected multipart/form-data', details: [] }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ statusCode: 422, error: 'ValidationError', message: 'A file is required', details: [{ field: 'file' }] }, { status: 422 })
  }
  const filename = (file instanceof File && file.name) || String(form.get('filename') ?? 'upload')

  try {
    const result = await brokerLeadAttachment(file, filename)
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(e.toEnvelope(), { status: 422 })
    }
    throw e
  }
}
