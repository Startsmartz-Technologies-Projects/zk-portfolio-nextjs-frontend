'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidateContent } from '@/lib/revalidate'
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  softDeleteProject,
  restoreProject,
  duplicateProject,
  publishProject,
  unpublishProject,
  archiveProject,
  setFeatured,
  bulkProjects,
  getPreviewUrl,
  collectPublishIssues,
  PROJECTS_REVALIDATE_TAG,
  PROJECTS_BASE_PATH,
} from '@/lib/data/projects'
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  featuredSchema,
  bulkSchema,
} from '@/lib/validation/projects'

// Projects admin server actions (projects-be-2). Each composes the USERS guard
// (`content` capability — editor + admin, §8.2), server-side zod validation, the
// `lib/data/projects` mutation, an append-only audit entry written after commit,
// and a best-effort public revalidation. `restore` is Admin-only (FR-PROJ-009).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}

function revalidate() {
  revalidateContent(PROJECTS_REVALIDATE_TAG, PROJECTS_BASE_PATH)
}

export async function listProjectsAction(input: unknown) {
  await requireCapability('content')
  return listProjects(parse(listProjectsSchema, input ?? {}))
}

export async function getProjectAction(id: string) {
  await requireCapability('content')
  return getProject(id)
}

export async function createProjectAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(createProjectSchema, input)
  const project = await createProject(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'project', entityId: project.id, summary: `Created project '${project.title}'` })
  revalidate()
  return project
}

export async function updateProjectAction(id: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updateProjectSchema, input)
  const project = await updateProject(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'project', entityId: id, summary: `Updated project '${project.title}'`, metadata: { fields: Object.keys(data) } })
  revalidate()
  return project
}

export async function deleteProjectAction(id: string) {
  const principal = await requireCapability('content')
  await softDeleteProject(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'project', entityId: id, summary: `Soft-deleted project ${id}` })
  revalidate()
  return { ok: true }
}

export async function restoreProjectAction(id: string) {
  // Restore is Admin-only (FR-PROJ-009) — gate on the admin-only `site_settings`
  // is wrong here; use the content guard plus an explicit admin-role check.
  const principal = await requireCapability('content')
  if (principal.role !== 'admin') throw new ValidationError('Only an admin can restore a project', [{ rule: 'admin_only' }])
  const project = await restoreProject(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'project', entityId: id, summary: `Restored project '${project.title}'` })
  revalidate()
  return project
}

export async function duplicateProjectAction(id: string) {
  const principal = await requireCapability('content')
  const project = await duplicateProject(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'project', entityId: project.id, summary: `Duplicated project '${project.title}'`, metadata: { source: id } })
  revalidate()
  return project
}

export async function publishProjectAction(id: string) {
  const principal = await requireCapability('content')
  const project = await publishProject(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'publish', entityType: 'project', entityId: id, summary: `Published project '${project.title}'` })
  revalidate()
  return project
}

export async function unpublishProjectAction(id: string) {
  const principal = await requireCapability('content')
  const project = await unpublishProject(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'unpublish', entityType: 'project', entityId: id, summary: `Unpublished project '${project.title}'` })
  revalidate()
  return project
}

export async function archiveProjectAction(id: string) {
  const principal = await requireCapability('content')
  const project = await archiveProject(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'archive', entityType: 'project', entityId: id, summary: `Archived project '${project.title}'` })
  revalidate()
  return project
}

export async function setFeaturedAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(featuredSchema, input)
  const result = await setFeatured(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'project', summary: `Set featured projects (${data.ordered_ids.length})`, metadata: { ordered_ids: data.ordered_ids } })
  revalidate()
  return result
}

export async function bulkProjectsAction(input: unknown) {
  const principal = await requireCapability('content')
  const { ids, action } = parse(bulkSchema, input)
  const result = await bulkProjects(principal.user_id, ids, action)
  await audit({ actorId: principal.user_id, action: action === 'delete' ? 'delete' : action === 'publish' ? 'publish' : action === 'archive' ? 'archive' : 'unpublish', entityType: 'project', summary: `Bulk ${action} on ${ids.length} project(s)`, metadata: { ids } })
  revalidate()
  return result
}

export async function previewProjectAction(id: string) {
  await requireCapability('content')
  return getPreviewUrl(id)
}

/** Read-only: the publish-gate issues for a saved project, so the editor can surface
 *  them proactively in the publish panel (FR-PROJ-029). The server still re-checks on
 *  publishProjectAction (the authoritative gate). */
export async function publishIssuesAction(id: string) {
  await requireCapability('content')
  return collectPublishIssues(id)
}
