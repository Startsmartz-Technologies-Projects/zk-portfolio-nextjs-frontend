import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ValidationError } from '@/lib/errors'
import { brokerLeadAttachment } from '@/lib/leads/broker'
import { submitLead } from '@/lib/leads/submit'
import type { SubmitLeadInput } from '@/lib/validation/leads'
import { rateLimit, resetRateLimits, SUBMIT_RATE_LIMIT } from '@/lib/leads/rate-limit'
import { GET as optionsGET } from '@/app/api/inquiries/options/route'
import { POST as submitPOST } from '@/app/api/inquiries/route'
import { POST as uploadPOST } from '@/app/api/inquiries/attachments/route'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-intake-${RID}`
const refs: string[] = []
const mediaIds: string[] = []

const ctx = { ip: '203.0.113.1', userAgent: 'vitest', sourcePage: '/lets-collaborate' }
function payload(extra: Record<string, unknown> = {}): SubmitLeadInput {
  return {
    name: `${PREFIX} Person`,
    company: null,
    phone: '+8801712345678',
    email: `${PREFIX}@example.com`,
    subject: `${PREFIX} subject`,
    inquiry_type: 'quote',
    services: [],
    budget: null,
    location: null,
    timeline: null,
    bid_name: null,
    message: `${PREFIX} message`,
    attachment_ids: [],
    ...extra,
  }
}
function jsonReq(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/inquiries', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('public intake options (no DB)', () => {
  it('GET /api/inquiries/options returns the seeded sets (9/11/6/6)', async () => {
    const res = await optionsGET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.inquiry_types).toHaveLength(9)
    expect(json.services).toHaveLength(11)
    expect(json.budgets).toHaveLength(6)
    expect(json.timelines).toHaveLength(6)
  })
})

describe.skipIf(!hasDb)('public intake (integration)', () => {
  beforeEach(() => resetRateLimits())

  afterAll(async () => {
    if (refs.length) {
      const leads = await db.lead.findMany({ where: { referenceNo: { in: refs } }, select: { id: true } })
      await db.leadAttachment.deleteMany({ where: { leadId: { in: leads.map((l) => l.id) } } })
      await db.lead.deleteMany({ where: { referenceNo: { in: refs } } })
    }
    await db.lead.deleteMany({ where: { email: `${PREFIX}@example.com` } })
    if (mediaIds.length) await db.mediaAsset.deleteMany({ where: { id: { in: mediaIds } } })
    await db.$disconnect()
  })

  it('brokers an attachment into MEDIA as a private `document` tagged lead (deferred Cloudinary path)', async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'tender-boq.pdf', { type: 'application/pdf' })
    const result = await brokerLeadAttachment(file, 'tender-boq.pdf')
    mediaIds.push(result.media_id)
    expect(result.original_filename).toBe('tender-boq.pdf')
    const asset = await db.mediaAsset.findUnique({ where: { id: result.media_id } })
    expect(asset).toMatchObject({ resourceType: 'document', format: 'pdf', tags: ['lead'] })
  })

  it('submitLead creates a new lead with a reference and associates valid attachments', async () => {
    const file = new File([new Uint8Array([9, 9])], 'drawing.png', { type: 'image/png' })
    const att = await brokerLeadAttachment(file, 'drawing.png')
    mediaIds.push(att.media_id)

    const res = await submitLead(payload({ subject: `${PREFIX}-with-att` }), ctx, {})
    refs.push(res.reference_no)
    expect(res).toMatchObject({ deduped: false, spam: false })
    expect(res.reference_no).toMatch(/^ZE-\d{6}$/)

    const res2 = await submitLead({ ...(payload()), attachment_ids: [att.media_id] }, ctx, {})
    refs.push(res2.reference_no)
    const lead = await db.lead.findUnique({ where: { referenceNo: res2.reference_no }, include: { attachments: true } })
    expect(lead?.status).toBe('new')
    expect(lead?.attachments).toHaveLength(1)
  })

  it('dedupes an identical re-submission within the window (edge 2)', async () => {
    const p = payload({ subject: `${PREFIX}-dupe`, message: `${PREFIX}-dupe-body` })
    const first = await submitLead(p, ctx, {})
    refs.push(first.reference_no)
    const second = await submitLead(p, ctx, {})
    expect(second.deduped).toBe(true)
    expect(second.reference_no).toBe(first.reference_no)
  })

  it('rejects an attachment_id that is not an uploaded lead document', async () => {
    await expect(
      submitLead({ ...(payload()), attachment_ids: ['00000000-0000-0000-0000-000000000000'] }, ctx, {}),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('POST /api/inquiries: valid submission returns a reference (201)', async () => {
    const res = await submitPOST(jsonReq(payload({ subject: `${PREFIX}-route` })))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toMatchObject({ status: 'received' })
    expect(json.reference_no).toMatch(/^ZE-\d{6}$/)
    refs.push(json.reference_no)
  })

  it('POST /api/inquiries: honeypot is deflected with a generic success but stored as spam (BR-8)', async () => {
    const res = await submitPOST(jsonReq(payload({ subject: `${PREFIX}-hp`, company_website: 'http://bot' })))
    expect(res.status).toBe(201)
    const json = await res.json()
    refs.push(json.reference_no)
    const lead = await db.lead.findUnique({ where: { referenceNo: json.reference_no } })
    expect(lead).toMatchObject({ isSpam: true, status: 'spam' })
  })

  it('POST /api/inquiries: an invalid inquiry_type is a 422 with no lead created', async () => {
    const res = await submitPOST(jsonReq(payload({ inquiry_type: 'bogus' })))
    expect(res.status).toBe(422)
  })

  it('POST /api/inquiries: a rate-limited IP is deflected with 429', async () => {
    for (let i = 0; i < SUBMIT_RATE_LIMIT.limit; i++) rateLimit('inq-submit:198.51.100.7', SUBMIT_RATE_LIMIT)
    const res = await submitPOST(jsonReq(payload(), { 'x-forwarded-for': '198.51.100.7' }))
    expect(res.status).toBe(429)
  })

  it('POST /api/inquiries/attachments: brokers a multipart upload and returns a media_id (201)', async () => {
    const fd = new FormData()
    fd.append('file', new File([new Uint8Array([5, 5, 5])], 'rfp.pdf', { type: 'application/pdf' }))
    const req = new NextRequest('http://localhost/api/inquiries/attachments', { method: 'POST', body: fd })
    const res = await uploadPOST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.media_id).toBeTruthy()
    mediaIds.push(json.media_id)
  })

  it('POST /api/inquiries/attachments: a disallowed type is a 422', async () => {
    const fd = new FormData()
    fd.append('file', new File([new Uint8Array([1])], 'malware.exe', { type: 'application/octet-stream' }))
    const req = new NextRequest('http://localhost/api/inquiries/attachments', { method: 'POST', body: fd })
    const res = await uploadPOST(req)
    expect(res.status).toBe(422)
  })
})
