import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { ServiceList } from "@/src/components/admin/services/service-list";

export const metadata: Metadata = {
  title: "Services · Zakir Enterprise Admin",
};

// Services admin index (services-admin-list — Admin Wave 3). The directory is ordered by
// `position` with drag-reorder (FR-SVC-017); status + search only (no taxonomy/featured).
export default function ServicesListPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        breadcrumbs={[{ label: "Services" }]}
        actions={
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus className="h-4 w-4" /> New service
            </Link>
          </Button>
        }
      />
      <ServiceList />
    </div>
  );
}
