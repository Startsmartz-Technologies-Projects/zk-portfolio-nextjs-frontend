import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { ProjectList } from "@/src/components/admin/projects/project-list";
import Link from "next/link";
import { Plus, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects · Zakir Enterprise Admin",
};

// Projects admin index (projects-admin-list — Admin Wave 2, the List-archetype template).
// The shell guard (the (app) layout) already enforces auth; we read the principal here
// only to gate the Admin-only restore view (FR-PROJ-009). All listing/search/filter/sort
// state lives in the client component, URL-synced, calling listProjectsAction.
export default async function ProjectsListPage() {
  const principal = await auth();
  const isAdmin = principal?.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        breadcrumbs={[{ label: "Projects" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/projects/featured">
                <Star className="h-4 w-4" /> Featured
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="h-4 w-4" /> New project
              </Link>
            </Button>
          </div>
        }
      />

      <ProjectList isAdmin={isAdmin} />
    </div>
  );
}
