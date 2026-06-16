import type { Metadata } from "next";

import { listCertificationsAction } from "@/app/admin/certifications/actions";
import { PageHeader } from "@/src/components/admin/page-header";
import { HomeSealsManager } from "@/src/components/admin/certifications/home-seals-manager";
import type { CertListItem } from "@/src/components/admin/certifications/types";

export const metadata: Metadata = { title: "Home seals · Zakir Enterprise Admin" };

interface ListResult {
  data: CertListItem[];
  meta: { page: number; pageSize: number; total: number };
}

// Home seals manager (certifications-admin-home-seals — Admin Wave 3). Cross-record
// curation + ordering of the home-page certification seals, analogous to Projects featured.
export default async function HomeSealsPage() {
  const res = (await listCertificationsAction({ showOnHome: true, sort: "recent", pageSize: 100 })) as ListResult;
  // The list isn't seal-ordered; sort by the stored seal_order so the page opens in order.
  const ordered = res.data.slice().sort((a, b) => (a.seal_order ?? 0) - (b.seal_order ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Home seals"
        description="Choose which published certifications show on the home page, and in what order."
        breadcrumbs={[{ label: "Certifications", href: "/admin/certifications" }, { label: "Home seals" }]}
      />
      <HomeSealsManager initial={ordered} />
    </div>
  );
}
