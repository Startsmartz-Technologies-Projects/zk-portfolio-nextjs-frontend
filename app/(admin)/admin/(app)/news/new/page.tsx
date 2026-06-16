import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { StoryEditor } from "@/src/components/admin/news/story-editor";
import { loadSeoDefaults } from "@/src/components/admin/shared/seo-form";

export const metadata: Metadata = { title: "New story · Zakir Enterprise Admin" };

export default async function NewStoryPage() {
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;
  const { defaults, metadataBase } = await loadSeoDefaults();
  return (
    <StoryEditor initial={null} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} seoDefaults={defaults} metadataBase={metadataBase} />
  );
}
