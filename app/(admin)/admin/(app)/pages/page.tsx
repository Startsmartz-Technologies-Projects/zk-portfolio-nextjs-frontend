import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Pencil } from "lucide-react";

import { listPagesAction } from "@/app/admin/pages/actions";
import { PageHeader } from "@/src/components/admin/page-header";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { formatDate } from "@/src/lib/format-date";
import { CONTENT_STATUS_BADGE } from "@/src/components/admin/shared/list-primitives";
import type { PageListItem } from "@/src/components/admin/pages/types";

export const metadata: Metadata = { title: "Pages · Zakir Enterprise Admin" };

// Pages admin index (pages-admin-editor — Admin Wave 4). The page picker over the fixed
// set of singleton + collection-index pages; click a row to open the section builder.
// No create/delete (the set is fixed — BR-1).
export default async function PagesListPage() {
  const { data } = (await listPagesAction()) as { data: PageListItem[] };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pages" breadcrumbs={[{ label: "Pages" }]} />

      <div className="rounded-[10px] border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border [&_th]:h-11 [&_th]:bg-secondary/40 [&_th]:px-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
              <th className="w-10"></th>
              <th>Page</th>
              <th>Path</th>
              <th>Status</th>
              <th>Sections</th>
              <th>Updated</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => {
              const badge = p.content_status ? CONTENT_STATUS_BADGE[p.content_status] : null;
              return (
                <tr key={p.key} className="border-b border-border last:border-0 hover:bg-secondary/50 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle">
                  <td><FileText className="h-4 w-4 text-muted-foreground" /></td>
                  <td>
                    <Link href={`/admin/pages/${p.key}`} className="font-medium text-foreground underline-offset-2 hover:underline">
                      {p.admin_title}
                    </Link>
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">{p.path}</td>
                  <td>{badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : "—"}</td>
                  <td className="tabular-nums text-muted-foreground">{p.section_count}</td>
                  <td className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(p.updated_at)}</td>
                  <td>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/pages/${p.key}`}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
