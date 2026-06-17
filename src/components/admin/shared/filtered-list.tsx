"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Copy,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { TermRef } from "@/lib/data/site";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { TaxonomySelector } from "@/src/components/admin/taxonomy-selector/taxonomy-selector";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useToast } from "@/src/components/ui/use-toast";
import { CheckboxCell, EmptyState, Pagination, TableSkeleton } from "./list-primitives";

const ALL = "__all";

export type BulkAction = "publish" | "unpublish" | "archive" | "delete";

export interface ListResult<TRow> {
  data: TRow[];
  meta: { page: number; pageSize: number; total: number };
}

export interface ColumnDef<TRow> {
  key: string;
  header: string;
  cell: (row: TRow) => React.ReactNode;
  className?: string;
}

export type FilterDef =
  | { kind: "taxonomy"; key: string; vocabularySlug: string; placeholder: string }
  | { kind: "enum"; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: "boolean"; key: string; label: string };

export interface RowAction<TRow> {
  label: string;
  icon?: React.ReactNode;
  onSelect: (row: TRow) => void;
  destructive?: boolean;
  separatorBefore?: boolean;
}

export interface FilteredListProps<TRow extends { id: string }> {
  /** Fetch a page given the URL-derived query (already parsed to a plain object). */
  fetchPage: (query: Record<string, string | undefined>) => Promise<ListResult<TRow>>;
  columns: ColumnDef<TRow>[];
  filters?: FilterDef[];
  sorts?: { value: string; label: string }[];
  defaultSort?: string;
  searchPlaceholder: string;
  basePath: string;
  noun: string; // singular, e.g. "article"
  nounPlural: string; // e.g. "articles"
  pageSize?: number;
  /** Row overflow actions beyond Edit (which links to basePath/{id}). `reload` re-fetches the page. */
  rowActions?: (row: TRow, reload: () => void) => RowAction<TRow>[];
  /** Enable the publish/unpublish/archive/delete bulk bar. */
  bulk?: (ids: string[], action: BulkAction) => Promise<{ results: { id: string; ok: boolean; error?: string }[] }>;
  /** Empty-state CTA href (New …). */
  newHref?: string;
  /** Editable cell injected at the start of every row (e.g. a featured toggle). */
  leadingCell?: (row: TRow, reload: () => void) => React.ReactNode;
}

export function FilteredList<TRow extends { id: string }>({
  fetchPage,
  columns,
  filters = [],
  sorts,
  defaultSort,
  searchPlaceholder,
  basePath,
  noun,
  nounPlural,
  pageSize = 20,
  rowActions,
  bulk,
  newHref,
  leadingCell,
}: FilteredListProps<TRow>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const { toast } = useToast();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? defaultSort ?? "";

  const [result, setResult] = React.useState<ListResult<TRow> | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [selection, setSelection] = React.useState<Record<string, boolean>>({});
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState(q);

  const filterKeys = filters.map((f) => f.key);
  const activeFilterValues = filterKeys.map((k) => searchParams.get(k)).filter(Boolean);
  const hasFilters = Boolean(q || sort !== (defaultSort ?? "") || activeFilterValues.length);

  const queryKey = searchParams.toString();
  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const query: Record<string, string | undefined> = {
        page: String(page),
        pageSize: String(pageSize),
        q: q || undefined,
        sort: sort || undefined,
      };
      for (const k of filterKeys) query[k] = searchParams.get(k) || undefined;
      const res = await fetchPage(query);
      setResult(res);
      setStatus("ready");
      setSelection({});
    } catch {
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setSearchText(q);
  }, [q]);
  React.useEffect(() => {
    if (searchText === q) return;
    const t = setTimeout(() => push({ q: searchText, page: undefined }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  function push(patch: Record<string, string | undefined | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    // Any change but a page change resets to page 1.
    if (!("page" in patch)) params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  }
  function clearAll() {
    router.replace("?", { scroll: false });
  }

  const rows = result?.data ?? [];
  const selectedIds = Object.keys(selection).filter((id) => selection[id]);
  const allSelected = rows.length > 0 && rows.every((r) => selection[r.id]);
  const someSelected = rows.some((r) => selection[r.id]);

  async function runBulk(action: BulkAction) {
    if (!bulk || selectedIds.length === 0) return;
    const label = `${selectedIds.length} ${selectedIds.length === 1 ? noun : nounPlural}`;
    if (action !== "publish") {
      const ok = await confirm({
        title: `${cap(action)} ${label}?`,
        description: action === "delete" ? "You can restore them later." : "They leave the public site.",
        confirmLabel: cap(action),
        destructive: true,
      });
      if (!ok) return;
    }
    setBulkBusy(true);
    try {
      const { results } = await bulk(selectedIds, action);
      const failed = results.filter((r) => !r.ok).length;
      const done = results.length - failed;
      toast(
        failed === 0
          ? { variant: "success", title: `${done} ${done === 1 ? noun : nounPlural} updated.` }
          : { variant: "destructive", title: `${done} done, ${failed} skipped.` },
      );
      await load();
    } catch {
      toast({ variant: "destructive", title: "Bulk action failed." });
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[16rem] flex-1">
            <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder={searchPlaceholder} aria-label={`Search ${nounPlural}`} />
          </div>
          {sorts && sorts.length > 0 && (
            <div className="w-44">
              <Select value={sort || sorts[0].value} onValueChange={(v) => push({ sort: v })}>
                <SelectTrigger aria-label="Sort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sorts.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <FilterControl key={f.key} def={f} value={searchParams.get(f.key)} onChange={(v) => push({ [f.key]: v })} />
            ))}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
            )}
          </div>
        )}
      </div>

      {/* Bulk bar */}
      {bulk && selectedIds.length > 0 && (
        <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-secondary/40 px-3 py-2 text-sm">
          <span className="font-medium">{selectedIds.length} selected</span>
          <span className="mx-1 h-4 w-px bg-border" />
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("publish")}>Publish</Button>
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("unpublish")}>Unpublish</Button>
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("archive")}>Archive</Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={bulkBusy} onClick={() => runBulk("delete")}>Delete</Button>
          {bulkBusy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelection({})}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[10px] border border-border bg-card shadow-sm">
        {status === "error" ? (
          <EmptyState icon={<AlertTriangle className="h-8 w-8 text-destructive" />} title={`Couldn't load ${nounPlural}.`} action={<Button variant="outline" size="sm" onClick={load}>Retry</Button>} />
        ) : status === "loading" ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          hasFilters ? (
            <EmptyState icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />} title={`No ${nounPlural} match these filters.`} action={<Button variant="outline" size="sm" onClick={clearAll}>Clear all</Button>} />
          ) : (
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
              title={`No ${nounPlural} yet`}
              description={newHref ? `Create your first ${noun}.` : undefined}
              action={newHref ? <Button asChild size="sm"><Link href={newHref}>New {noun}</Link></Button> : undefined}
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border [&_th]:h-11 [&_th]:bg-secondary/40 [&_th]:px-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
                  {bulk && (
                    <th className="w-10">
                      <CheckboxCell
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onChange={(v) => setSelection(v ? Object.fromEntries(rows.map((r) => [r.id, true])) : {})}
                        label="Select all"
                      />
                    </th>
                  )}
                  {leadingCell && <th className="w-10"></th>}
                  {columns.map((c) => (
                    <th key={c.key} className={c.className}>{c.header}</th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-secondary/50 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle">
                    {bulk && (
                      <td>
                        <CheckboxCell checked={!!selection[row.id]} onChange={(v) => setSelection((s) => ({ ...s, [row.id]: v }))} label="Select row" />
                      </td>
                    )}
                    {leadingCell && <td>{leadingCell(row, load)}</td>}
                    {columns.map((c) => (
                      <td key={c.key} className={c.className}>{c.cell(row)}</td>
                    ))}
                    <td>
                      <RowMenu
                        row={row}
                        basePath={basePath}
                        busy={rowBusy === row.id}
                        actions={rowActions?.(row, load) ?? []}
                        setBusy={setRowBusy}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {status === "ready" && result && (
        <Pagination page={result.meta.page} pageSize={result.meta.pageSize} total={result.meta.total} onPage={(p) => push({ page: p > 1 ? String(p) : undefined })} />
      )}
    </div>
  );
}

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function FilterControl({
  def,
  value,
  onChange,
}: {
  def: FilterDef;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  if (def.kind === "taxonomy") {
    return (
      <div className="w-48">
        <TaxonomySelector
          vocabularySlug={def.vocabularySlug}
          placeholder={def.placeholder}
          value={value ? ({ id: value, slug: value, label: value } as TermRef) : null}
          onChange={(t) => onChange(t?.slug ?? null)}
        />
      </div>
    );
  }
  if (def.kind === "boolean") {
    return (
      <Button
        type="button"
        variant={value === "1" ? "secondary" : "outline"}
        size="sm"
        aria-pressed={value === "1"}
        onClick={() => onChange(value === "1" ? null : "1")}
      >
        {def.label}
      </Button>
    );
  }
  return (
    <div className="w-44">
      <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? null : v)}>
        <SelectTrigger aria-label={def.label}><SelectValue placeholder={def.label} /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All {def.label.toLowerCase()}</SelectItem>
          {def.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function RowMenu<TRow extends { id: string }>({
  row,
  basePath,
  busy,
  actions,
  setBusy,
}: {
  row: TRow;
  basePath: string;
  busy: boolean;
  actions: RowAction<TRow>[];
  setBusy: (id: string | null) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Row actions" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`${basePath}/${row.id}`}><Pencil className="h-4 w-4" /> Edit</Link>
        </DropdownMenuItem>
        {actions.map((a, i) => (
          <React.Fragment key={i}>
            {a.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={() => a.onSelect(row)}
              className={a.destructive ? "text-destructive focus:text-destructive" : undefined}
            >
              {a.icon}
              {a.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Re-export common row-action icons so module lists can build menus tersely.
export const RowActionIcons = { Copy, Eye, Trash2 };
