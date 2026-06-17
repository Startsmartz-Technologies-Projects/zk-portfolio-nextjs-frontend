import type { Metadata } from "next";

import { PageHeader } from "@/src/components/admin/page-header";
import { SessionsList } from "@/src/components/admin/auth/sessions-list";

export const metadata: Metadata = {
  title: "Active sessions · Zakir Enterprise Admin",
};

// Per-device session management (FR-AUTH-007) — list, revoke a device, log out everywhere.
export default function SessionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Active sessions"
        description="Devices currently signed in to your account."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Profile", href: "/admin/account" },
          { label: "Active sessions" },
        ]}
      />
      <SessionsList />
    </div>
  );
}
