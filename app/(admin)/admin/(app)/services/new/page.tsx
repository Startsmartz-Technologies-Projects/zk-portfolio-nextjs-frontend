import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { ServiceEditor } from "@/src/components/admin/services/service-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";

export const metadata: Metadata = {
  title: "New service · Zakir Enterprise Admin",
};

export default async function NewServicePage() {
  const principal = await auth();
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;
  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <ServiceEditor initial={null} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
