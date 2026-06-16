import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { getArticleAction } from "@/app/admin/blog/actions";
import { ArticleEditor } from "@/src/components/admin/blog/article-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";
import type { ArticleDetail } from "@/src/components/admin/blog/types";

export const metadata: Metadata = { title: "Edit article · Zakir Enterprise Admin" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;

  let record: ArticleDetail | null = null;
  try {
    record = (await getArticleAction(id)) as ArticleDetail;
  } catch {
    record = null;
  }
  if (!record) notFound();

  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <ArticleEditor initial={record} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
