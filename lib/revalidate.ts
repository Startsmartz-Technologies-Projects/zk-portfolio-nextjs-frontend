import { revalidatePath } from 'next/cache'

/**
 * Revalidate a content collection's public surfaces after a publish/unpublish or
 * featured change (FR-PROJ-031 and the equivalents on the other collections).
 * Refreshes the section's list page, its dynamic detail segment, and the home
 * layout (featured strips). The `tag` identifies the collection for callers/logging
 * and lines up with the `unstable_cache` tags the deferred public-site rework will
 * add. `detailBasePath` defaults to `basePath` (Projects: list+detail share `/projects`);
 * pass it when the detail lives elsewhere (Services: list `/services`, detail
 * `/service-details`). Best-effort — never fails the underlying admin action (edge:
 * a revalidation failure does not roll back the publish).
 */
export function revalidateContent(tag: string, basePath: string, detailBasePath: string = basePath): void {
  try {
    revalidatePath(basePath, 'page')
    revalidatePath(`${detailBasePath}/[slug]`, 'page')
    revalidatePath('/', 'layout')
  } catch {
    // Outside a request scope (e.g. a script or test) revalidation is a no-op.
  }
}

/**
 * Revalidate the public site after a global change (FR-SITE-020). The company
 * profile, brand, socials, copyright, stats, public settings, and taxonomy terms
 * all surface in the site-wide chrome / filters, so we revalidate the root layout.
 * Best-effort — never fail the underlying admin action because of revalidation.
 */
export function revalidatePublicSite(): void {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Outside a request scope (e.g. a script) revalidation is a no-op.
  }
}
