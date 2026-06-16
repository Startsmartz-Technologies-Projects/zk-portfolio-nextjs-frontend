import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { getServiceAction } from "@/app/admin/services/actions";
import { ServiceEditor } from "@/src/components/admin/services/service-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";
import type { ServiceDetail } from "@/src/components/admin/services/types";

export const metadata: Metadata = {
  title: "Edit service · Zakir Enterprise Admin",
};

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await auth();
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;

  let record: ServiceDetail | null = null;
  try {
    record = (await getServiceAction(id)) as ServiceDetail;
  } catch {
    record = null;
  }
  if (!record) notFound();

  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <ServiceEditor initial={record} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
