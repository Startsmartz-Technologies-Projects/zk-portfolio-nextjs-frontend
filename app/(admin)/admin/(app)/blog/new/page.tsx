import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { ArticleEditor } from "@/src/components/admin/blog/article-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";

export const metadata: Metadata = { title: "New article · Zakir Enterprise Admin" };

export default async function NewArticlePage() {
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;
  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <ArticleEditor initial={null} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
