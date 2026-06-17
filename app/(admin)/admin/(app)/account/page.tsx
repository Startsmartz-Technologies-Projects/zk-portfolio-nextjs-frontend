import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, MonitorSmartphone } from "lucide-react";

import { auth } from "@/lib/auth";
import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

export const metadata: Metadata = {
  title: "Profile · Zakir Enterprise Admin",
};

const ROLE_LABEL: Record<"admin" | "editor", string> = {
  admin: "Administrator",
  editor: "Editor",
};

export default async function AccountPage() {
  const principal = await auth();
  if (!principal) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Your account details and security settings."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Profile" },
        ]}
      />

      <div className="max-w-2xl rounded-[10px] border border-border bg-card p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <dt className="text-sm font-medium text-muted-foreground">Name</dt>
          <dd className="text-sm">{principal.full_name}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
          <dd className="text-sm">{principal.email}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Role</dt>
          <dd>
            <Badge variant="outline">{ROLE_LABEL[principal.role]}</Badge>
          </dd>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/account/change-password">
            <KeyRound /> Change password
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/account/sessions">
            <MonitorSmartphone /> Active sessions
          </Link>
        </Button>
      </div>
    </div>
  );
}
