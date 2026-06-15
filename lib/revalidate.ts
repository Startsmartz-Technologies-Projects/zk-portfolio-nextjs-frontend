import { revalidatePath } from 'next/cache'

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
