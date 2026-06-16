import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { StoryList } from "@/src/components/admin/news/story-list";

export const metadata: Metadata = { title: "News · Zakir Enterprise Admin" };

export default function NewsListPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="News"
        breadcrumbs={[{ label: "News" }]}
        actions={
          <Button asChild>
            <Link href="/admin/news/new">
              <Plus className="h-4 w-4" /> New story
            </Link>
          </Button>
        }
      />
      <StoryList />
    </div>
  );
}
