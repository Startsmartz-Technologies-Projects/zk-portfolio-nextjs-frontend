import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { getStoryAction } from "@/app/admin/news/actions";
import { StoryEditor } from "@/src/components/admin/news/story-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";
import type { StoryDetail } from "@/src/components/admin/news/types";

export const metadata: Metadata = { title: "Edit story · Zakir Enterprise Admin" };

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;

  let record: StoryDetail | null = null;
  try {
    record = (await getStoryAction(id)) as StoryDetail;
  } catch {
    record = null;
  }
  if (!record) notFound();

  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <StoryEditor initial={record} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
