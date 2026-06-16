import type { Metadata } from "next";
import Link from "next/link";
import { Award, Plus } from "lucide-react";

import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { CertificationList } from "@/src/components/admin/certifications/certification-list";

export const metadata: Metadata = { title: "Certifications · Zakir Enterprise Admin" };

export default function CertificationsListPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Certifications"
        breadcrumbs={[{ label: "Certifications" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/certifications/home-seals">
                <Award className="h-4 w-4" /> Home seals
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/certifications/new">
                <Plus className="h-4 w-4" /> New certification
              </Link>
            </Button>
          </div>
        }
      />
      <CertificationList />
    </div>
  );
}
