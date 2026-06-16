import { createHash } from 'node:crypto'
import { db } from '@/lib/db'
import type { InquiryType } from '@prisma/client'
import { ValidationError } from '@/lib/errors'
import { generateReferenceNo } from './reference-no'
import { notifyNewLead } from './notify'
import { LEAD_TAG } from './broker'
import type { SubmitLeadInput } from '@/lib/validation/leads'

// Public submission orchestration (FR-LEADS-001…005, BR-2/BR-7/BR-8, edge 2/5).
// Validates attachment references, dedupes accidental double-submits, generates the
// reference, persists the Lead (+ attachment links), and fires the v2 notification
// hook. Spam-flagged submissions are stored `is_spam=true` / `status=spam` so the
// client can't probe the spam logic (BR-8) — the caller decides via `markSpam`.

/** Dedupe window for accidental double-submits, keyed by (email, subject, message) — edge 2. */
export const DEDUPE_WINDOW_MS = 5 * 60 * 1000

export interface SubmitContext {
  ip: string | null
  userAgent: string | null
  sourcePage: string
}

export interface SubmitResult {
  reference_no: string
  /** True when an identical recent submission was found and its reference returned (no new row). */
  deduped: boolean
  /** True when the lead was stored flagged as spam. */
  spam: boolean
}

/** A non-empty honeypot value means a bot filled the hidden field (BR-8). Pure. */
export function isHoneypotTripped(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** Stable dedupe key over the identifying fields. Pure. */
export function dedupeHash(email: string, subject: string, message: string): string {
  return createHash('sha256').update(`${email.trim().toLowerCase()}|${subject.trim()}|${message.trim()}`).digest('hex')
}

/** Reject attachment ids that don't resolve to an uploaded, non-deleted `lead` document (security: no attaching arbitrary assets). */
async function validateAttachmentIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const assets = await db.mediaAsset.findMany({
    where: { id: { in: ids }, tags: { has: LEAD_TAG }, deletedAt: null },
    select: { id: true },
  })
  const valid = new Set(assets.map((a) => a.id))
  const missing = ids.filter((id) => !valid.has(id))
  if (missing.length) {
    throw new ValidationError('attachment_ids must reference uploaded lead attachments', [{ field: 'attachment_ids', missing }])
  }
}

export async function submitLead(input: SubmitLeadInput, ctx: SubmitContext, opts: { markSpam?: boolean } = {}): Promise<SubmitResult> {
  const markSpam = opts.markSpam ?? false
  const attachmentIds = input.attachment_ids ?? []
  const services = input.services ?? []
  await validateAttachmentIds(attachmentIds)

  // Dedupe genuine double-submits within the window (skip for spam — never collapse onto a real lead).
  if (!markSpam) {
    const since = new Date(Date.now() - DEDUPE_WINDOW_MS)
    const recent = await db.lead.findFirst({
      where: { email: input.email, subject: input.subject, message: input.message, createdAt: { gte: since }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { referenceNo: true },
    })
    if (recent) return { reference_no: recent.referenceNo, deduped: true, spam: false }
  }

  const referenceNo = await generateReferenceNo()
  await db.lead.create({
    data: {
      referenceNo,
      name: input.name,
      company: input.company ?? null,
      phone: input.phone,
      email: input.email,
      subject: input.subject,
      inquiryType: input.inquiry_type as InquiryType,
      services,
      budget: input.budget ?? null,
      location: input.location ?? null,
      timeline: input.timeline ?? null,
      bidName: input.bid_name ?? null,
      message: input.message,
      status: markSpam ? 'spam' : 'new',
      isSpam: markSpam,
      sourcePage: ctx.sourcePage,
      submittedIp: ctx.ip,
      userAgent: ctx.userAgent,
      attachments: attachmentIds.length
        ? { create: attachmentIds.map((mediaId, i) => ({ mediaId, position: i })) }
        : undefined,
    },
  })

  // v2 notification hook — no-op in v1 (§17 Q1). Never let it fail a stored submission.
  try {
    await notifyNewLead({ referenceNo, name: input.name, email: input.email, inquiryType: input.inquiry_type })
  } catch (err) {
    console.error('[leads] notification hook failed (non-fatal)', err)
  }

  return { reference_no: referenceNo, deduped: false, spam: markSpam }
}
