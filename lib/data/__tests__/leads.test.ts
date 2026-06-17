import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { NotFoundError, ValidationError } from '@/lib/errors'
import {
  listLeads,
  getLead,
  updateLeadTriage,
  addLeadNote,
  softDeleteLead,
  restoreLead,
  streamLeadsCsv,
  leadToCsvLine,
  getLeadAttachmentTarget,
  LEADS_CSV_COLUMNS,
} from '@/lib/data/leads'
import { computeAssetUsage } from '@/lib/data/media'

const hasDb = !!process.env.DATABASE_URL
const RID = Math.floor(Math.random() * 1e9)
const PREFIX = `test-lead-${RID}`
const REF_BASE = 100000 + Math.floor(Math.random() * 800000)

async function drain(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const dec = new TextDecoder()
  let out = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out += dec.decode(value, { stream: true })
  }
  return out + dec.decode()
}

describe.skipIf(!hasDb)('leads inbox data layer (integration)', () => {
  const createdIds: string[] = []
  let assigneeId = ''
  let mediaId = ''
  let seq = 0

  async function newLead(extra: Record<string, unknown> = {}) {
    const lead = await db.lead.create({
      data: {
        referenceNo: `ZE-${String((REF_BASE + seq++) % 1_000_000).padStart(6, '0')}`,
        name: `${PREFIX} Person`,
        phone: '+8801711111111',
        email: `${PREFIX}@example.com`,
        subject: 'Banani tower',
        inquiryType: 'quote',
        services: ['Building Construction'],
        message: 'Need a priced scope',
        sourcePage: '/lets-collaborate',
        ...extra,
      },
    })
    createdIds.push(lead.id)
    return lead
  }

  beforeAll(async () => {
    const u = await db.user.create({
      data: { email: `${PREFIX}@staff.test`, fullName: `${PREFIX} Staff`, role: 'editor', passwordHash: 'x', status: 'active' },
    })
    assigneeId = u.id
    const m = await db.mediaAsset.create({
      data: { resourceType: 'document', provider: 'cloudinary', publicId: `${PREFIX}-doc`, url: 'https://res.cloudinary.com/x/raw/upload/v1/boq.pdf', format: 'pdf', originalFilename: 'tender-boq.pdf', tags: ['lead'] },
    })
    mediaId = m.id
  })

  afterAll(async () => {
    await db.leadNote.deleteMany({ where: { lead: { id: { in: createdIds } } } })
    await db.leadAttachment.deleteMany({ where: { leadId: { in: createdIds } } })
    await db.lead.deleteMany({ where: { id: { in: createdIds } } })
    await db.mediaAsset.delete({ where: { id: mediaId } }).catch(() => {})
    await db.user.delete({ where: { id: assigneeId } }).catch(() => {})
    await db.$disconnect()
  })

  it('lists, searches, and excludes spam + soft-deleted by default', async () => {
    const a = await newLead({ subject: `${PREFIX}-find-me` })
    await newLead({ isSpam: true })
    const del = await newLead()
    await softDeleteLead(del.id)

    const list = await listLeads({ q: `${PREFIX}-find-me` })
    expect(list.data.find((l) => l.id === a.id)).toBeDefined()

    const all = await listLeads({ q: PREFIX, pageSize: 100 })
    expect(all.data.every((l) => l.is_spam === false)).toBe(true)
    expect(all.data.find((l) => l.id === del.id)).toBeUndefined()

    const spam = await listLeads({ q: PREFIX, spam: true, pageSize: 100 })
    expect(spam.data.every((l) => l.is_spam === true)).toBe(true)
    expect(spam.data.length).toBeGreaterThanOrEqual(1)
  })

  it('filters by status / inquiry_type / service and sorts oldest-first', async () => {
    const won = await newLead({ status: 'won', inquiryType: 'gov', services: ['Road Works'] })
    const byStatus = await listLeads({ q: PREFIX, status: 'won', pageSize: 100 })
    expect(byStatus.data.every((l) => l.status === 'won')).toBe(true)
    expect(byStatus.data.find((l) => l.id === won.id)).toBeDefined()

    const byService = await listLeads({ q: PREFIX, service: 'Road Works', pageSize: 100 })
    expect(byService.data.find((l) => l.id === won.id)).toBeDefined()

    const oldest = await listLeads({ q: PREFIX, sort: 'oldest', pageSize: 100 })
    const times = oldest.data.map((l) => new Date(l.created_at).getTime())
    expect([...times].sort((x, y) => x - y)).toEqual(times)
  })

  it('returns full detail with attachments + notes; unknown is NotFound', async () => {
    const lead = await newLead()
    await db.leadAttachment.create({ data: { leadId: lead.id, mediaId, position: 0 } })
    const full = await getLead(lead.id)
    expect(full.attachments).toHaveLength(1)
    expect(full.attachments[0].media).toMatchObject({ id: mediaId, format: 'pdf' })
    expect(full.message).toBe('Need a priced scope')
    await expect(getLead('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('updates status / assignee / spam, validating the assignee', async () => {
    const lead = await newLead()
    const updated = await updateLeadTriage(lead.id, { status: 'contacted', assignee_id: assigneeId, is_spam: false })
    expect(updated.status).toBe('contacted')
    expect(updated.assignee).toMatchObject({ id: assigneeId })

    await expect(updateLeadTriage(lead.id, { assignee_id: '00000000-0000-0000-0000-000000000000' })).rejects.toBeInstanceOf(ValidationError)
    const unassigned = await updateLeadTriage(lead.id, { assignee_id: null })
    expect(unassigned.assignee).toBeNull()
  })

  it('adds internal notes (authored) and threads them oldest-first', async () => {
    const lead = await newLead()
    const note = await addLeadNote(assigneeId, lead.id, { body: 'Called, awaiting docs' })
    expect(note.author).toMatchObject({ id: assigneeId })
    const full = await getLead(lead.id)
    expect(full.notes).toHaveLength(1)
    expect(full.notes[0].body).toBe('Called, awaiting docs')
  })

  it('soft-deletes and restores', async () => {
    const lead = await newLead()
    await softDeleteLead(lead.id)
    const afterDelete = await listLeads({ q: PREFIX, pageSize: 100 })
    expect(afterDelete.data.find((l) => l.id === lead.id)).toBeUndefined()
    const restored = await restoreLead(lead.id)
    expect(restored.id).toBe(lead.id)
    await expect(restoreLead(lead.id)).rejects.toBeInstanceOf(NotFoundError) // already restored
  })

  it('formats CSV lines and streams the filtered set excluding soft-deleted', async () => {
    const lead = await newLead({ subject: `${PREFIX}-csv`, services: ['Building Construction', 'Drainage Work'] })
    const row = await db.lead.findUnique({ where: { id: lead.id }, include: { assignee: { select: { fullName: true } } } })
    const line = leadToCsvLine(row!)
    expect(line).toContain(lead.referenceNo)
    expect(line).toContain('Building Construction; Drainage Work')

    const csv = await drain(streamLeadsCsv({ q: `${PREFIX}-csv` }))
    expect(csv.startsWith(LEADS_CSV_COLUMNS.join(',') + '\n')).toBe(true)
    expect(csv).toContain(lead.referenceNo)

    await softDeleteLead(lead.id)
    const after = await drain(streamLeadsCsv({ q: `${PREFIX}-csv` }))
    expect(after).not.toContain(lead.referenceNo)
  })

  it('resolves an attachment download target and reports usage to MEDIA', async () => {
    const lead = await newLead()
    const att = await db.leadAttachment.create({ data: { leadId: lead.id, mediaId, position: 0 } })
    const target = await getLeadAttachmentTarget(lead.id, att.id)
    expect(target.url).toContain('res.cloudinary.com')
    expect(target.original_filename).toBe('tender-boq.pdf')
    await expect(getLeadAttachmentTarget(lead.id, '00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(NotFoundError)

    const usage = await computeAssetUsage(mediaId)
    expect(usage.some((u) => u.module === 'leads' && u.record_id === lead.id && u.role === 'attachment')).toBe(true)
  })
})
