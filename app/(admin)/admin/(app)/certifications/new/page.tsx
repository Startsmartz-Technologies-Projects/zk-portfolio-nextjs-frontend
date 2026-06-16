import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { CertificationEditor } from "@/src/components/admin/certifications/certification-editor";

export const metadata: Metadata = { title: "New certification · Zakir Enterprise Admin" };

export default async function NewCertificationPage() {
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;
  return <CertificationEditor initial={null} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} />;
}
