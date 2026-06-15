'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { listLeads, getLead, updateLeadTriage, addLeadNote, softDeleteLead, restoreLead } from '@/lib/data/leads'
import { listLeadsSchema, triagePatchSchema, addNoteSchema } from '@/lib/validation/leads'

// Leads admin inbox server actions (leads-be-2). Two distinct capabilities (§8.2):
// `leads_triage` (admin + editor) for view / status / assign / notes; `leads_manage`
// (admin only) for delete + restore + CSV export (the export + attachment download
// are route handlers). Triage / note / delete write audit entries; there is no
// public revalidation (the inbox has no public surface).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

export async function listLeadsAction(input: unknown = {}) {
  await requireCapability('leads_triage')
  return listLeads(parse(listLeadsSchema, input ?? {}))
}

export async function getLeadAction(id: string) {
  await requireCapability('leads_triage')
  return getLead(id)
}

export async function updateLeadTriageAction(id: string, input: unknown) {
  const principal = await requireCapability('leads_triage')
  const data = parse(triagePatchSchema, input)
  const lead = await updateLeadTriage(id, data)
  await audit({
    actorId: principal.user_id,
    action: 'update',
    entityType: 'lead',
    entityId: id,
    summary: `Triaged lead ${lead.reference_no}`,
    metadata: { fields: Object.keys(data), status: lead.status, is_spam: lead.is_spam },
  })
  return lead
}

export async function addLeadNoteAction(id: string, input: unknown) {
  const principal = await requireCapability('leads_triage')
  const data = parse(addNoteSchema, input)
  const note = await addLeadNote(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'lead', entityId: id, summary: `Added internal note to lead ${id}` })
  return note
}

export async function deleteLeadAction(id: string) {
  const principal = await requireCapability('leads_manage')
  await softDeleteLead(id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'lead', entityId: id, summary: `Soft-deleted lead ${id}` })
  return { ok: true as const }
}

export async function restoreLeadAction(id: string) {
  const principal = await requireCapability('leads_manage')
  const lead = await restoreLead(id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'lead', entityId: id, summary: `Restored lead ${lead.reference_no}` })
  return lead
}
