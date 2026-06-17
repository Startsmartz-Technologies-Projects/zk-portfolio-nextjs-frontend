'use server'

import { z } from 'zod'
import { requireCapability } from '@/lib/users/rbac'
import { audit } from '@/lib/users/audit'
import { ValidationError } from '@/lib/errors'
import { revalidateContent } from '@/lib/revalidate'
import {
  listPages,
  getPage,
  updatePage,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  replaceItems,
  publishPage,
  unpublishPage,
  getPreviewUrl,
  PAGES_REVALIDATE_TAG,
} from '@/lib/data/pages'
import { updatePageSchema, addSectionSchema, updateSectionSchema, reorderSectionsSchema, replaceItemsSchema } from '@/lib/validation/pages'

// Pages admin server actions (pages-be-2) — requireCapability('content') + zod +
// lib/data + write-after-commit audit + revalidation of the page's own path. There is
// no create/delete page action (fixed set, BR-1).

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input)
  if (!r.success) throw new ValidationError('Invalid input', r.error.issues)
  return r.data
}
function revalidate(path: string) {
  revalidateContent(PAGES_REVALIDATE_TAG, path)
}

export async function listPagesAction() {
  await requireCapability('content')
  return listPages()
}

export async function getPageAction(key: string) {
  await requireCapability('content')
  return getPage(key)
}

export async function updatePageAction(key: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updatePageSchema, input)
  const page = await updatePage(principal.user_id, key, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'page', entityId: page.id, summary: `Updated page '${page.admin_title}'`, metadata: { fields: Object.keys(data) } })
  revalidate(page.path)
  return page
}

export async function addSectionAction(key: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(addSectionSchema, input)
  const page = await addSection(principal.user_id, key, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'page', entityId: page.id, summary: `Added '${data.type}' section to '${page.admin_title}'` })
  revalidate(page.path)
  return page
}

export async function updateSectionAction(key: string, sectionId: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(updateSectionSchema, input)
  const page = await updateSection(principal.user_id, key, sectionId, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'page_section', entityId: sectionId, summary: `Edited a section on '${page.admin_title}'`, metadata: { fields: Object.keys(data) } })
  revalidate(page.path)
  return page
}

export async function deleteSectionAction(key: string, sectionId: string) {
  const principal = await requireCapability('content')
  const page = await deleteSection(principal.user_id, key, sectionId)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'page_section', entityId: sectionId, summary: `Removed a section from '${page.admin_title}'` })
  revalidate(page.path)
  return page
}

export async function reorderSectionsAction(key: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(reorderSectionsSchema, input)
  const page = await reorderSections(principal.user_id, key, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'page', entityId: page.id, summary: `Reordered sections on '${page.admin_title}'` })
  revalidate(page.path)
  return page
}

export async function replaceItemsAction(key: string, sectionId: string, input: unknown) {
  const principal = await requireCapability('content')
  const data = parse(replaceItemsSchema, input)
  const page = await replaceItems(principal.user_id, key, sectionId, data)
  await audit({ actorId: principal.user_id, action: 'update', entityType: 'page_section', entityId: sectionId, summary: `Replaced items on a section of '${page.admin_title}' (${data.items.length})` })
  revalidate(page.path)
  return page
}

export async function publishPageAction(key: string) {
  const principal = await requireCapability('content')
  const page = await publishPage(principal.user_id, key)
  await audit({ actorId: principal.user_id, action: 'publish', entityType: 'page', entityId: page.id, summary: `Published page '${page.admin_title}'` })
  revalidate(page.path)
  return page
}

export async function unpublishPageAction(key: string) {
  const principal = await requireCapability('content')
  const page = await unpublishPage(principal.user_id, key)
  await audit({ actorId: principal.user_id, action: 'unpublish', entityType: 'page', entityId: page.id, summary: `Unpublished page '${page.admin_title}'` })
  revalidate(page.path)
  return page
}

export async function previewPageAction(key: string) {
  await requireCapability('content')
  return getPreviewUrl(key)
}
