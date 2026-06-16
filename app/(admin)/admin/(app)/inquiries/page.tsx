import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { LeadsInbox } from "@/src/components/admin/inquiries/leads-inbox";

export const metadata: Metadata = { title: "Inquiries · Zakir Enterprise Admin" };

// Leads inbox — both roles triage (capability `leads_triage`); delete/restore + CSV
// export are admin-only (`leads_manage`). Server actions re-enforce both (FR-LEADS).
export default async function InquiriesPage() {
  const principal = await auth();
  if (!principal || !can(principal.role, "leads_triage")) notFound();

  return (
    <LeadsInbox
      principalId={principal.user_id}
      principalName={principal.full_name}
      canManage={can(principal.role, "leads_manage")}
    />
  );
}
