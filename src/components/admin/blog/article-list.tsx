"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import {
  listArticlesAction,
  duplicateArticleAction,
  deleteArticleAction,
  previewArticleAction,
  bulkArticlesAction,
} from "@/app/admin/blog/actions";
import { formatDate } from "@/src/lib/format-date";
import { Badge } from "@/src/components/ui/badge";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useToast } from "@/src/components/ui/use-toast";
import { CONTENT_STATUS_BADGE, Thumb } from "@/src/components/admin/shared/list-primitives";
import {
  FilteredList,
  RowActionIcons,
  type ColumnDef,
  type ListResult,
} from "@/src/components/admin/shared/filtered-list";
import type { ArticleListItem } from "./types";

export function ArticleList() {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();

  const columns: ColumnDef<ArticleListItem>[] = [
    { key: "cover", header: "", cell: (r) => <Thumb media={r.cover_image} alt="" />, className: "w-14" },
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <div className="flex flex-col">
          <span className="line-clamp-1 font-medium">{r.title}</span>
          {r.tags.length > 0 && <span className="line-clamp-1 text-xs text-muted-foreground">{r.tags.join(", ")}</span>}
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (r) => <span className="text-muted-foreground">{r.category?.label ?? "—"}</span> },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const b = r.content_status ? CONTENT_STATUS_BADGE[r.content_status] : null;
        return b ? <Badge variant={b.variant}>{b.label}</Badge> : "—";
      },
    },
    { key: "date", header: "Date", cell: (r) => <span className="whitespace-nowrap tabular-nums text-muted-foreground">{r.display_date ?? "—"}</span> },
    {
      key: "featured",
      header: "Featured",
      cell: (r) =>
        r.featured ? <Star className="h-4 w-4 fill-[var(--status-gold,#caa42a)] text-[var(--status-gold,#caa42a)]" aria-label="Featured" /> : <span className="sr-only">Not featured</span>,
    },
  ];

  async function fetchPage(query: Record<string, string | undefined>): Promise<ListResult<ArticleListItem>> {
    return (await listArticlesAction({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      sort: query.sort,
      category: query.category,
      contentStatus: query.contentStatus,
      featured: query.featured,
    })) as ListResult<ArticleListItem>;
  }

  return (
    <FilteredList<ArticleListItem>
      fetchPage={fetchPage}
      basePath="/admin/blog"
      noun="article"
      nounPlural="articles"
      newHref="/admin/blog/new"
      searchPlaceholder="Search articles…"
      columns={columns}
      filters={[
        { kind: "taxonomy", key: "category", vocabularySlug: "blog-category", placeholder: "All categories" },
        {
          kind: "enum",
          key: "contentStatus",
          label: "Status",
          options: [
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ],
        },
        { kind: "boolean", key: "featured", label: "Featured only" },
      ]}
      sorts={[
        { value: "latest", label: "Latest" },
        { value: "popular", label: "Most popular" },
        { value: "featured", label: "Featured order" },
      ]}
      defaultSort="latest"
      bulk={async (ids, action) => bulkArticlesAction({ ids, action })}
      rowActions={(row, reload) => [
        {
          label: "Duplicate",
          icon: <RowActionIcons.Copy className="h-4 w-4" />,
          onSelect: async () => {
            try {
              const copy = await duplicateArticleAction(row.id);
              toast({ variant: "success", title: "Duplicated — opening the copy." });
              router.push(`/admin/blog/${copy.id}`);
            } catch {
              toast({ variant: "destructive", title: "Couldn't duplicate the article." });
            }
          },
        },
        {
          label: "Preview",
          icon: <RowActionIcons.Eye className="h-4 w-4" />,
          onSelect: async () => {
            try {
              const { preview_url } = await previewArticleAction(row.id);
              window.open(preview_url, "_blank", "noopener,noreferrer");
            } catch {
              toast({ variant: "destructive", title: "Couldn't open the preview link." });
            }
          },
        },
        {
          label: "Delete",
          icon: <RowActionIcons.Trash2 className="h-4 w-4" />,
          destructive: true,
          separatorBefore: true,
          onSelect: async () => {
            const ok = await confirm({
              title: "Delete this article?",
              description: "It's removed from lists; an admin can restore it later.",
              confirmLabel: "Delete",
              destructive: true,
            });
            if (!ok) return;
            try {
              await deleteArticleAction(row.id);
              toast({ variant: "success", title: "Deleted." });
              reload();
            } catch {
              toast({ variant: "destructive", title: "Couldn't delete the article." });
            }
          },
        },
      ]}
    />
  );
}
