import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { ConcernList } from "@/src/components/admin/concerns/concern-list";

export const metadata: Metadata = { title: "Concerns · Zakir Enterprise Admin" };

export default async function ConcernsListPage() {
  const principal = await auth();
  const isAdmin = principal?.role === "admin";
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Concerns"
        breadcrumbs={[{ label: "Concerns" }]}
        actions={
          <Button asChild>
            <Link href="/admin/concerns/new">
              <Plus className="h-4 w-4" /> New concern
            </Link>
          </Button>
        }
      />
      <ConcernList isAdmin={isAdmin} />
    </div>
  );
}
