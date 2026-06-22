import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { getPageAction } from "@/app/admin/pages/actions";
import { listCompanyStats } from "@/lib/data/site";
import { PageEditor } from "@/src/components/admin/pages/page-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";
import { statKeyOptions, type PageAdmin } from "@/src/components/admin/pages/types";

export const metadata: Metadata = { title: "Edit page · Zakir Enterprise Admin" };

// The Pages section builder for one page (fixed set, keyed by hyphenated key).
export default async function EditPagePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const principal = await auth();
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;

  let record: PageAdmin | null = null;
  try {
    record = (await getPageAction(key)) as PageAdmin;
  } catch {
    record = null;
  }
  if (!record) notFound();

  const { defaults, metadataBase } = await loadSeoDefaults();
  // Live stat-picker options: computed metrics + the actual CompanyStat keys from Site Settings,
  // so a stat added there is immediately selectable in the page section editors.
  const companyStats = await listCompanyStats();
  const statKeys = statKeyOptions(companyStats.map((s) => s.key));
  return (
    <PageEditor
      initial={record}
      canViewAuditLog={canViewAuditLog}
      seoDefaults={defaults}
      metadataBase={metadataBase}
      statKeys={statKeys}
    />
  );
}
