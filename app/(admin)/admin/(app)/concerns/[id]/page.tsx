import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { getConcernAction } from "@/app/admin/concerns/actions";
import { ConcernEditor } from "@/src/components/admin/concerns/concern-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";
import type { ConcernDetail } from "@/src/components/admin/concerns/types";

export const metadata: Metadata = { title: "Edit concern · Zakir Enterprise Admin" };

export default async function EditConcernPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;

  let record: ConcernDetail | null = null;
  try {
    record = (await getConcernAction(id)) as ConcernDetail;
  } catch {
    record = null;
  }
  if (!record) notFound();

  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <ConcernEditor initial={record} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
