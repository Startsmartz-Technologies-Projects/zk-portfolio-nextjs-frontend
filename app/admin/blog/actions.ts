'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidateContent } from '@/lib/revalidate'
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  softDeleteArticle,
  restoreArticle,
  duplicateArticle,
  publishArticle,
  unpublishArticle,
  archiveArticle,
  setFeatured,
  bulkArticles,
  getPreviewUrl,
  collectPublishIssues,
  BLOG_REVALIDATE_TAG,
  BLOG_BASE_PATH,
} from '@/lib/data/blog'
import { createArticleSchema, updateArticleSchema, listArticlesSchema, bulkSchema } from '@/lib/validation/blog'

// Blog admin server actions (blog-be-2) — requireCapability('content') + zod +
// lib/data + write-after-commit audit + revalidation. Restore is Admin-only.

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}
function revalidate() {
  revalidateContent(BLOG_REVALIDATE_TAG, BLOG_BASE_PATH)
}

export async function listArticlesAction(input: unknown) {
  await requireCapability('content')
  return listArticles(parse(listArticlesSchema, input ?? {}))
}

export async function getArticleAction(id: string) {
  await requireCapability('content')
  return getArticle(id)
}

export async function createArticleAction(input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(createArticleSchema, input)
  const article = await createArticle(principal.user_id, data)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'article', entityId: article.id, summary: `Created article '${article.title}'` })
  revalidate()
  return article
}

export async function updateArticleAction(id: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updateArticleSchema, input)
  const article = await updateArticle(principal.user_id, id, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'article', entityId: id, summary: `Updated article '${article.title}'`, metadata: { fields: Object.keys(data) } })
  revalidate()
  return article
}

export async function deleteArticleAction(id: string) {
  const principal = await requireCapability('content')
  await softDeleteArticle(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'delete', entityType: 'article', entityId: id, summary: `Soft-deleted article ${id}` })
  revalidate()
  return { ok: true }
}

export async function restoreArticleAction(id: string) {
  const principal = await requireCapability('content')
  if (principal.role !== 'admin') throw new ValidationError('Only an admin can restore an article', [{ rule: 'admin_only' }])
  const article = await restoreArticle(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'restore', entityType: 'article', entityId: id, summary: `Restored article '${article.title}'` })
  revalidate()
  return article
}

export async function duplicateArticleAction(id: string) {
  const principal = await requireCapability('content')
  const article = await duplicateArticle(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'create', entityType: 'article', entityId: article.id, summary: `Duplicated article '${article.title}'`, metadata: { source: id } })
  revalidate()
  return article
}

export async function publishArticleAction(id: string) {
  const principal = await requireCapability('content')
  const article = await publishArticle(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'publish', entityType: 'article', entityId: id, summary: `Published article '${article.title}'` })
  revalidate()
  return article
}

export async function unpublishArticleAction(id: string) {
  const principal = await requireCapability('content')
  const article = await unpublishArticle(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'unpublish', entityType: 'article', entityId: id, summary: `Unpublished article '${article.title}'` })
  revalidate()
  return article
}

export async function archiveArticleAction(id: string) {
  const principal = await requireCapability('content')
  const article = await archiveArticle(principal.user_id, id)
  await audit({ actorId: principal.user_id, action: 'archive', entityType: 'article', entityId: id, summary: `Archived article '${article.title}'` })
  revalidate()
  return article
}

export async function setFeaturedArticleAction(id: string, featured: boolean) {
  const principal = await requireCapability('content')
  const article = await setFeatured(principal.user_id, id, featured)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'article', entityId: id, summary: `${featured ? 'Featured' : 'Unfeatured'} article '${article.title}'`, metadata: { featured } })
  revalidate()
  return article
}

export async function bulkArticlesAction(input: unknown) {
  const principal = await requireCapability('content')
  const { ids, action } = parse(bulkSchema, input)
  const result = await bulkArticles(principal.user_id, ids, action)
  await audit({ actorId: principal.user_id, action: action === 'delete' ? 'delete' : action === 'publish' ? 'publish' : action === 'archive' ? 'archive' : 'unpublish', entityType: 'article', summary: `Bulk ${action} on ${ids.length} article(s)`, metadata: { ids } })
  revalidate()
  return result
}

export async function previewArticleAction(id: string) {
  await requireCapability('content')
  return getPreviewUrl(id)
}

/** Read-only publish-gate issues for a saved article, surfaced in the editor publish panel. */
export async function publishIssuesArticleAction(id: string) {
  await requireCapability('content')
  return collectPublishIssues(id)
}
