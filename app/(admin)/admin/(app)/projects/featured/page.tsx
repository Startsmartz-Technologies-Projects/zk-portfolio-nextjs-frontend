import type { Metadata } from "next";

import { listProjectsAction } from "@/app/admin/projects/actions";
import { getSiteBundle } from "@/lib/data/site";
import { PageHeader } from "@/src/components/admin/page-header";
import { FeaturedCuration } from "@/src/components/admin/projects/featured-curation";
import type { FeaturedItem } from "@/src/components/admin/projects/types";

export const metadata: Metadata = {
  title: "Featured projects · Zakir Enterprise Admin",
};

interface ListResult {
  data: FeaturedItem[];
  meta: { page: number; pageSize: number; total: number };
}

// Featured curation (projects-admin-featured — Admin Wave 2). Loads the current
// featured set (ordered by featured_order) + the SITE max_featured_projects cap, then
// hands off to the client curator (drag/keyboard reorder, add picker, optimistic).
export default async function FeaturedProjectsPage() {
  const [featuredRes, site] = await Promise.all([
    listProjectsAction({ featured: true, sort: "featured", pageSize: 100 }) as Promise<ListResult>,
    getSiteBundle(),
  ]);

  const maxRaw = site.settings.max_featured_projects;
  const max = typeof maxRaw === "number" && maxRaw > 0 ? maxRaw : 3;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Featured projects"
        description="Choose which published projects appear in the home + listing featured strip, and in what order."
        breadcrumbs={[{ label: "Projects", href: "/admin/projects" }, { label: "Featured" }]}
      />
      <FeaturedCuration initial={featuredRes.data} max={max} />
    </div>
  );
}
