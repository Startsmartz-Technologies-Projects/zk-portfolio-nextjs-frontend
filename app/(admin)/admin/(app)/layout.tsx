import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { AppShell } from "@/src/components/admin/app-shell";

// The authenticated app frame. The Edge proxy (proxy.ts) does the cheap JWT gate; this
// server layout performs the authoritative per-request re-check (FR-AUTH-015 via auth()):
//  - no valid session (revoked / suspended / expired mid-session) → back to login.
//  - must_change_password → the forced change-password screen blocks all nav (FR-AUTH-012).
export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const principal = await auth();
  if (!principal) redirect("/admin/login");
  if (principal.must_change_password) redirect("/admin/change-password");

  // Env badge: STAGING when the SEO staging noindex switch is on (app-shell §5). Non-fatal.
  let envBadge = false;
  try {
    const seo = await getPublicSeoDefaults();
    envBadge = seo?.default_robots === "noindex_nofollow";
  } catch {
    /* SEO settings unavailable — hide the badge rather than fail the shell */
  }

  return (
    <AppShell
      principal={{
        full_name: principal.full_name,
        email: principal.email,
        role: principal.role,
      }}
      envBadge={envBadge}
    >
      {children}
    </AppShell>
  );
}
