import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { getProjectAction } from "@/app/admin/projects/actions";
import { ProjectEditor } from "@/src/components/admin/projects/project-editor";
import { loadSeoDefaults } from "@/src/components/admin/projects/load-seo-defaults";
import type { ProjectDetail } from "@/src/components/admin/projects/types";

export const metadata: Metadata = {
  title: "Edit project · Zakir Enterprise Admin",
};

// Edit screen — loads the full record (FR-PROJ-005) and mounts the editor template.
export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;

  let record: ProjectDetail | null = null;
  try {
    record = (await getProjectAction(id)) as ProjectDetail;
  } catch {
    record = null;
  }
  if (!record) notFound();

  const { defaults, metadataBase } = await loadSeoDefaults();

  return (
    <ProjectEditor
      initial={record}
      isAdmin={isAdmin}
      canViewAuditLog={canViewAuditLog}
      seoDefaults={defaults}
      metadataBase={metadataBase}
    />
  );
}
