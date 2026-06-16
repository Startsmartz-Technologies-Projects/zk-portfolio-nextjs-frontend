'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidateContent } from '@/lib/revalidate'
import {
  listStories,
  getStory,
  createStory,
  updateStory,
  softDeleteStory,
  restoreStory,
  duplicateStory,
  publishStory,
  unpublishStory,
  archiveStory,
  setFeatured,
  bulkStories,
  getPreviewUrl,
  collectPublishIssues,
  NEWS_REVALIDATE_TAG,
  NEWS_BASE_PATH,
} from '@/lib/data/news'
import { createStorySchema, updateStorySchema, listStoriesSchema, bulkSchema } from '@/lib/validation/news'

// News admin server actions (news-be-2) — requireCapability('content') + zod +
// lib/data + write-after-commit audit + revalidation. Restore is Admin-only.

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}
function revalidate() {
  revalidateContent(NEWS_REVALIDATE_TAG, NEWS_BASE_PATH)
}

export async function listStoriesAction(input: unknown) {
  await requireCapability('content')
  return listStories(parse(listStoriesSchema, input ?? {}))
}

export async function getStoryAction(id: string) {
  await requireCapability('content')
  return getStory(id)
}

export async function createStoryAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(createStorySchema, input)
  const story = await createStory(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'news_story', entityId: story.id, summary: `Created news story '${story.title}'` })
  revalidate()
  return story
}

export async function updateStoryAction(id: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updateStorySchema, input)
  const story = await updateStory(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'news_story', entityId: id, summary: `Updated news story '${story.title}'`, metadata: { fields: Object.keys(data) } })
  revalidate()
  return story
}

export async function deleteStoryAction(id: string) {
  const principal = await requireCapability('content')
  await softDeleteStory(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'news_story', entityId: id, summary: `Soft-deleted news story ${id}` })
  revalidate()
  return { ok: true }
}

export async function restoreStoryAction(id: string) {
  const principal = await requireCapability('content')
  if (principal.role !== 'admin') throw new ValidationError('Only an admin can restore a news story', [{ rule: 'admin_only' }])
  const story = await restoreStory(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'news_story', entityId: id, summary: `Restored news story '${story.title}'` })
  revalidate()
  return story
}

export async function duplicateStoryAction(id: string) {
  const principal = await requireCapability('content')
  const story = await duplicateStory(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'news_story', entityId: story.id, summary: `Duplicated news story '${story.title}'`, metadata: { source: id } })
  revalidate()
  return story
}

export async function publishStoryAction(id: string) {
  const principal = await requireCapability('content')
  const story = await publishStory(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'publish', entityType: 'news_story', entityId: id, summary: `Published news story '${story.title}'` })
  revalidate()
  return story
}

export async function unpublishStoryAction(id: string) {
  const principal = await requireCapability('content')
  const story = await unpublishStory(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'unpublish', entityType: 'news_story', entityId: id, summary: `Unpublished news story '${story.title}'` })
  revalidate()
  return story
}

export async function archiveStoryAction(id: string) {
  const principal = await requireCapability('content')
  const story = await archiveStory(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'archive', entityType: 'news_story', entityId: id, summary: `Archived news story '${story.title}'` })
  revalidate()
  return story
}

export async function setFeaturedStoryAction(id: string, featured: boolean) {
  const principal = await requireCapability('content')
  const story = await setFeatured(principal.user_id, id, featured)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'news_story', entityId: id, summary: `${featured ? 'Featured' : 'Unfeatured'} news story '${story.title}'`, metadata: { featured } })
  revalidate()
  return story
}

export async function bulkStoriesAction(input: unknown) {
  const principal = await requireCapability('content')
  const { ids, action } = parse(bulkSchema, input)
  const result = await bulkStories(principal.user_id, ids, action)
  await audit({ actorId: principal.user_id, action: action === 'delete' ? 'delete' : action === 'publish' ? 'publish' : action === 'archive' ? 'archive' : 'unpublish', entityType: 'news_story', summary: `Bulk ${action} on ${ids.length} news story(ies)`, metadata: { ids } })
  revalidate()
  return result
}

export async function previewStoryAction(id: string) {
  await requireCapability('content')
  return getPreviewUrl(id)
}

/** Read-only publish-gate issues for a saved story, surfaced in the editor publish panel. */
export async function publishIssuesStoryAction(id: string) {
  await requireCapability('content')
  return collectPublishIssues(id)
}
