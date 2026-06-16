import type { Metadata } from "next";

import { PageHeader } from "@/src/components/admin/page-header";
import { ChangePasswordForm } from "@/src/components/admin/auth/change-password-form";

export const metadata: Metadata = {
  title: "Change password · Zakir Enterprise Admin",
};

// Voluntary change-password (FR-AUTH-010) — a focused panel within the shell.
export default function VoluntaryChangePasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Change password"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Profile", href: "/admin/account" },
          { label: "Change password" },
        ]}
      />
      <div className="max-w-md rounded-[10px] border border-border bg-card p-6 shadow-sm">
        <ChangePasswordForm forced={false} next="/admin/account" />
      </div>
    </div>
  );
}
