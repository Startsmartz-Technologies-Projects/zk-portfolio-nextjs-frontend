"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Home } from "lucide-react";

import {
  listCertificationsAction,
  duplicateCertificationAction,
  deleteCertificationAction,
  bulkCertificationsAction,
} from "@/app/admin/certifications/actions";
import { Badge } from "@/src/components/ui/badge";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useToast } from "@/src/components/ui/use-toast";
import { CONTENT_STATUS_BADGE } from "@/src/components/admin/shared/list-primitives";
import {
  FilteredList,
  RowActionIcons,
  type ColumnDef,
  type ListResult,
} from "@/src/components/admin/shared/filtered-list";
import { CERT_STATUSES, type CertListItem } from "./types";

export function CertificationList() {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();

  const columns: ColumnDef<CertListItem>[] = [
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <div className="flex flex-col">
          <span className="line-clamp-1 font-medium">{r.title}</span>
          {(r.authority || r.number) && (
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {[r.authority, r.number].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (r) => <span className="text-muted-foreground">{r.category?.label ?? "—"}</span> },
    { key: "status", header: "Cert status", cell: (r) => <span className="text-muted-foreground">{r.status}</span> },
    {
      key: "content",
      header: "Workflow",
      cell: (r) => {
        const b = r.content_status ? CONTENT_STATUS_BADGE[r.content_status] : null;
        return b ? <Badge variant={b.variant}>{b.label}</Badge> : "—";
      },
    },
    {
      key: "document",
      header: "Doc",
      cell: (r) =>
        r.document ? <FileText className="h-4 w-4 text-muted-foreground" aria-label="Has document" /> : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: "home",
      header: "Home",
      cell: (r) =>
        r.show_on_home ? <Home className="h-4 w-4 text-[var(--status-published)]" aria-label="Shown on home" /> : <span className="sr-only">Not on home</span>,
    },
    { key: "issued", header: "Issued", cell: (r) => <span className="whitespace-nowrap tabular-nums text-muted-foreground">{r.display_issued ?? "—"}</span> },
    { key: "expiry", header: "Expiry", cell: (r) => <span className="whitespace-nowrap tabular-nums text-muted-foreground">{r.display_expiry}</span> },
  ];

  async function fetchPage(query: Record<string, string | undefined>): Promise<ListResult<CertListItem>> {
    return (await listCertificationsAction({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      sort: query.sort,
      category: query.category,
      status: query.status,
      contentStatus: query.contentStatus,
    })) as ListResult<CertListItem>;
  }

  return (
    <FilteredList<CertListItem>
      fetchPage={fetchPage}
      basePath="/admin/certifications"
      noun="certification"
      nounPlural="certifications"
      newHref="/admin/certifications/new"
      searchPlaceholder="Search title, authority, number…"
      columns={columns}
      filters={[
        { kind: "taxonomy", key: "category", vocabularySlug: "certifications-category", placeholder: "All categories" },
        { kind: "enum", key: "status", label: "Cert status", options: CERT_STATUSES.map((s) => ({ value: s, label: s })) },
        {
          kind: "enum",
          key: "contentStatus",
          label: "Workflow",
          options: [
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ],
        },
      ]}
      sorts={[
        { value: "recent", label: "Most recent" },
        { value: "title", label: "Title (A–Z)" },
        { value: "expiry", label: "Expiry" },
      ]}
      defaultSort="recent"
      bulk={async (ids, action) => bulkCertificationsAction({ ids, action })}
      rowActions={(row, reload) => [
        {
          label: "Duplicate",
          icon: <RowActionIcons.Copy className="h-4 w-4" />,
          onSelect: async () => {
            try {
              const copy = await duplicateCertificationAction(row.id);
              toast({ variant: "success", title: "Duplicated — opening the copy." });
              router.push(`/admin/certifications/${copy.id}`);
            } catch {
              toast({ variant: "destructive", title: "Couldn't duplicate the certification." });
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
              title: "Delete this certification?",
              description: "It's removed from lists; an admin can restore it later.",
              confirmLabel: "Delete",
              destructive: true,
            });
            if (!ok) return;
            try {
              await deleteCertificationAction(row.id);
              toast({ variant: "success", title: "Deleted." });
              reload();
            } catch {
              toast({ variant: "destructive", title: "Couldn't delete the certification." });
            }
          },
        },
      ]}
    />
  );
}
