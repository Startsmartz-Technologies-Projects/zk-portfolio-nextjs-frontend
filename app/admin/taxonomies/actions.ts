'use server'

import { revalidatePublicSite } from '@/lib/revalidate'
import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError, ConflictError } from '@/lib/errors'
import { listTaxonomies, listTerms, listTermUsage, addTerm, updateTerm, reorderTerms, deleteTerm, mergeTerm, getPublicTermList, type TermRef } from '@/lib/data/site'
import { termCreateSchema, termUpdateSchema, termOrderSchema } from '@/lib/validation/site'

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

// Taxonomy management is Admin-only (capability `site_settings`, BR-6).

export async function listTaxonomiesAction() {
  await requireCapability('site_settings')
  return listTaxonomies()
}

export async function listTermsAction(slug: string, includeInactive = false) {
  await requireCapability('site_settings')
  return listTerms(slug, { includeInactive })
}

// Per-term published-record usage for the manager's usage indicator + the safe
// delete-vs-merge decision (FR-SITE-013). Admin-only.
export async function termUsageAction(slug: string): Promise<Record<string, number>> {
  await requireCapability('site_settings')
  return listTermUsage(slug)
}

// Read for the editor-field taxonomy selector — available to editors AND admins
// (capability `content`), unlike the Admin-only management reads above. Returns the
// active term list as denormalized TermRefs (FR-SITE-014/015/023).
export async function listTermRefsAction(slug: string): Promise<TermRef[]> {
  await requireCapability('content')
  return getPublicTermList(slug)
}

// Result-returning inline create for the editor-field selector (FR-SITE-012/019/021, BR-6).
// Admin-only (server-enforced); returns a discriminated result so the client can show the
// duplicate-slug / denied messages reliably (server-action throws are redacted in prod).
export type CreateTermResult =
  | { ok: true; term: TermRef }
  | { ok: false; reason: 'duplicate' | 'invalid' | 'forbidden' | 'error'; message?: string }

export async function createTermForFieldAction(slug: string, input: unknown): Promise<CreateTermResult> {
  let principal: Awaited<ReturnType<typeof requireCapability>>
  try {
    principal = await requireCapability('site_settings')
  } catch {
    return { ok: false, reason: 'forbidden' }
  }

  const parsed = termCreateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, reason: 'invalid', message: parsed.error.issues[0]?.message }
  }

  try {
    const term = await addTerm(principal.user_id, slug, parsed.data)
    await audit({ actorId: principal.user_id, action: 'create', entityType: 'taxonomy_term', entityId: term.id, summary: `Added term '${term.label}' to '${slug}'` })
    revalidatePublicSite()
    return { ok: true, term: { id: term.id, slug: term.slug, label: term.label } }
  } catch (e) {
    if (e instanceof ConflictError) {
      return { ok: false, reason: 'duplicate', message: 'A term with this slug already exists in this vocabulary.' }
    }
    if (e instanceof ValidationError) return { ok: false, reason: 'invalid', message: e.message }
    return { ok: false, reason: 'error' }
  }
}

export async function addTermAction(slug: string, input: unknown) {
  const principal = await requireCapability('site_settings')
  const data = parse(termCreateSchema, input)
  const term = await addTerm(principal.user_id, slug, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'taxonomy_term', entityId: term.id, summary: `Added term '${term.label}' to '${slug}'` })
  revalidatePublicSite()
  return term
}

export async function updateTermAction(slug: string, termId: string, input: unknown) {
  const principal = await requireCapability('site_settings')
  const data = parse(termUpdateSchema, input)
  const term = await updateTerm(principal.user_id, slug, termId, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'taxonomy_term', entityId: termId, summary: `Updated term in '${slug}'`, metadata: { fields: Object.keys(data) } })
  revalidatePublicSite()
  return term
}

export async function reorderTermsAction(slug: string, input: unknown) {
  const principal = await requireCapability('site_settings')
  const { orderedIds } = parse(termOrderSchema, input)
  const terms = await reorderTerms(principal.user_id, slug, orderedIds)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'taxonomy_term', summary: `Reordered terms in '${slug}'` })
  revalidatePublicSite()
  return terms
}

export async function deleteTermAction(slug: string, termId: string) {
  const principal = await requireCapability('site_settings')
  await deleteTerm(principal.user_id, slug, termId)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'taxonomy_term', entityId: termId, summary: `Deleted term from '${slug}'` })
  revalidatePublicSite()
  return { ok: true as const }
}

export async function mergeTermAction(slug: string, termId: string, intoTermId: string) {
  const principal = await requireCapability('site_settings')
  const result = await mergeTerm(principal.user_id, slug, termId, intoTermId)
  await audit({ actorId: principal.user_id, action: 'merge', entityType: 'taxonomy_term', entityId: termId, summary: `Merged term into '${result.into.label}' in '${slug}'`, metadata: { intoTermId, repointed: result.repointed } })
  revalidatePublicSite()
  return result
}
