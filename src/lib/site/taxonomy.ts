import { getPublicTermList, type TermRef } from '@/lib/data/site'

// Shared SITE web helpers (web-fe-site-chrome).

/**
 * ISR/revalidate convention for the public site (FR-SITE-020). Routes opt in with
 * `export const revalidate = REVALIDATE`; a SITE/content change is reflected within this
 * window (~60s) without a redeploy. The root layout uses it so chrome edits propagate.
 */
export const REVALIDATE = 60

export type { TermRef }

/**
 * The active term list for a vocabulary (FR-SITE-014/023) — the single helper Wave-B index
 * pages consume for their filter dropdowns, replacing hard-coded option arrays. Thin server
 * wrapper over getPublicTermList that returns [] for an unknown vocabulary instead of
 * throwing, so a filter UI degrades to empty rather than erroring the whole page.
 */
export async function getTermList(slug: string): Promise<TermRef[]> {
  try {
    return await getPublicTermList(slug)
  } catch {
    return []
  }
}
