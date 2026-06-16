import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { ArticleList } from "@/src/components/admin/blog/article-list";

export const metadata: Metadata = {
  title: "Blog · Zakir Enterprise Admin",
};

export default function BlogListPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blog"
        breadcrumbs={[{ label: "Blog" }]}
        actions={
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4" /> New article
            </Link>
          </Button>
        }
      />
      <ArticleList />
    </div>
  );
}
