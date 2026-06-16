import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { ConcernEditor } from "@/src/components/admin/concerns/concern-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";

export const metadata: Metadata = { title: "New concern · Zakir Enterprise Admin" };

export default async function NewConcernPage() {
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;
  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <ConcernEditor initial={null} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
