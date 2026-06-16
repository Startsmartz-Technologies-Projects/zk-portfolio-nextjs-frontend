import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { getCertificationAction } from "@/app/admin/certifications/actions";
import { CertificationEditor } from "@/src/components/admin/certifications/certification-editor";
import type { CertDetail } from "@/src/components/admin/certifications/types";

export const metadata: Metadata = { title: "Edit certification · Zakir Enterprise Admin" };

export default async function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  const canViewAuditLog = principal ? can(principal.role, "audit_log") : false;

  let record: CertDetail | null = null;
  try {
    record = (await getCertificationAction(id)) as CertDetail;
  } catch {
    record = null;
  }
  if (!record) notFound();

  return <CertificationEditor initial={record} isAdmin={isAdmin} canViewAuditLog={canViewAuditLog} />;
}
