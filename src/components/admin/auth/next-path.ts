const FALLBACK = "/admin/dashboard";

/**
 * Validate a post-login `next` redirect target. Only internal `/admin/*` paths are
 * allowed (no protocol-relative or external URLs — open-redirect guard), and the auth
 * screens themselves are excluded to avoid redirect loops.
 */
export function sanitizeNext(next: string | undefined | null): string {
  if (!next || !next.startsWith("/admin/") || next.startsWith("//")) return FALLBACK;
  if (next.startsWith("/admin/login") || next.startsWith("/admin/change-password")) {
    return FALLBACK;
  }
  return next;
}
