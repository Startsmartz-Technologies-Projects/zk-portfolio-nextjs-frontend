import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { ProjectEditor } from "@/src/components/admin/projects/project-editor";
import { loadSeoDefaults } from "@/src/components/admin/projects/load-seo-defaults";

export const metadata: Metadata = {
  title: "New project · Zakir Enterprise Admin",
};

// Create screen — the same editor with an empty draft (projects-admin-editor template).
export default async function NewProjectPage() {
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;
  const { defaults, metadataBase } = await loadSeoDefaults();

  return (
    <ProjectEditor
      initial={null}
      isAdmin={isAdmin}
      canViewAuditLog={canViewAuditLog}
      seoDefaults={defaults}
      metadataBase={metadataBase}
    />
  );
}
