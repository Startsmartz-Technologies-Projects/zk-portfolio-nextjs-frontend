"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FolderKanban,
  Loader2,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import {
  listProjectsAction,
  duplicateProjectAction,
  deleteProjectAction,
  previewProjectAction,
  bulkProjectsAction,
} from "@/app/admin/projects/actions";
import { cn } from "@/src/lib/utils";
import { formatDate } from "@/src/lib/format-date";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useToast } from "@/src/components/ui/use-toast";
import { CoverThumb } from "./cover-thumb";
import { ProjectListToolbar, type ListFilters } from "./project-list-toolbar";
import { CONTENT_STATUS_BADGE, SORTS, type ProjectListItem, type Sort } from "./types";

const PAGE_SIZE = 20;

type BulkAction = "publish" | "unpublish" | "archive" | "delete";

interface ListResult {
  data: ProjectListItem[];
  meta: { page: number; pageSize: number; total: number };
}

function parseFilters(params: URLSearchParams): ListFilters & { page: number } {
  const sortParam = params.get("sort");
  const sort: Sort = (SORTS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as Sort)
    : "recent";
  return {
    q: params.get("q") ?? "",
    category: params.get("category"),
    location: params.get("location"),
    clientType: params.get("clientType"),
    deliveryStatus: params.get("deliveryStatus"),
    contentStatus: params.get("contentStatus"),
    featured: params.get("featured") === "1",
    sort,
    page: Math.max(1, Number(params.get("page")) || 1),
  };
}

function isFiltered(f: ListFilters): boolean {
  return Boolean(
    f.q ||
      f.category ||
      f.location ||
      f.clientType ||
      f.deliveryStatus ||
      f.contentStatus ||
      f.featured,
  );
}

export function ProjectList({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const { toast } = useToast();

  const { page, ...filters } = parseFilters(searchParams);

  const [result, setResult] = React.useState<ListResult | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [selection, setSelection] = React.useState<RowSelectionState>({});
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);
  const [partial, setPartial] = React.useState<
    { id: string; title: string; error: string }[] | null
  >(null);

  // ── Data load (keyed on the URL query) ───────────────────────────────────
  const queryKey = searchParams.toString();
  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const res = (await listProjectsAction({
        page,
        pageSize: PAGE_SIZE,
        q: filters.q || undefined,
        sort: filters.sort,
        category: filters.category || undefined,
        location: filters.location || undefined,
        clientType: filters.clientType || undefined,
        deliveryStatus: filters.deliveryStatus || undefined,
        contentStatus: filters.contentStatus || undefined,
        featured: filters.featured || undefined,
      })) as ListResult;
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

  // ── URL sync ─────────────────────────────────────────────────────────────
  function pushParams(next: Partial<ListFilters & { page: number }>) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, page, ...next };
    const setOrDelete = (key: string, value: string | null | undefined) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("q", merged.q || null);
    setOrDelete("category", merged.category);
    setOrDelete("location", merged.location);
    setOrDelete("clientType", merged.clientType);
    setOrDelete("deliveryStatus", merged.deliveryStatus);
    setOrDelete("contentStatus", merged.contentStatus);
    setOrDelete("featured", merged.featured ? "1" : null);
    setOrDelete("sort", merged.sort !== "recent" ? merged.sort : null);
    // Any filter change resets to page 1 unless the page is what changed.
    const nextPage = "page" in next ? merged.page : 1;
    setOrDelete("page", nextPage > 1 ? String(nextPage) : null);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleFilterChange(patch: Partial<ListFilters>) {
    pushParams(patch);
  }
  function handleClearAll() {
    router.replace("?", { scroll: false });
  }

  // ── Row actions ──────────────────────────────────────────────────────────
  async function duplicate(row: ProjectListItem) {
    setRowBusy(row.id);
    try {
      const copy = await duplicateProjectAction(row.id);
      toast({ variant: "success", title: "Duplicated — opening the copy." });
      router.push(`/admin/projects/${copy.id}`);
    } catch {
      toast({ variant: "destructive", title: "Couldn't duplicate the project." });
      setRowBusy(null);
    }
  }

  async function preview(row: ProjectListItem) {
    setRowBusy(row.id);
    try {
      const { preview_url } = await previewProjectAction(row.id);
      window.open(preview_url, "_blank", "noopener,noreferrer");
    } catch {
      toast({ variant: "destructive", title: "Couldn't open the preview link." });
    } finally {
      setRowBusy(null);
    }
  }

  async function softDelete(row: ProjectListItem) {
    const ok = await confirm({
      title: "Delete this project?",
      description: "It's removed from lists; an admin can restore it later.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setRowBusy(row.id);
    try {
      await deleteProjectAction(row.id);
      toast({ variant: "success", title: "Deleted." });
      await load();
    } catch {
      toast({ variant: "destructive", title: "Couldn't delete the project." });
    } finally {
      setRowBusy(null);
    }
  }

  // ── Bulk actions ─────────────────────────────────────────────────────────
  const rows = result?.data ?? [];
  const selectedIds = Object.keys(selection).filter((id) => selection[id]);
  const selectedRows = rows.filter((r) => selectedIds.includes(r.id));

  async function runBulk(action: BulkAction) {
    if (selectedIds.length === 0) return;
    const noun = `${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"}`;
    if (action === "delete" || action === "archive" || action === "unpublish") {
      const ok = await confirm({
        title:
          action === "delete"
            ? `Delete ${noun}?`
            : action === "archive"
              ? `Archive ${noun}?`
              : `Unpublish ${noun}?`,
        description:
          action === "delete"
            ? "You can restore them later."
            : "They leave the public site.",
        confirmLabel: action[0].toUpperCase() + action.slice(1),
        destructive: true,
      });
      if (!ok) return;
    }
    setBulkBusy(true);
    setPartial(null);
    try {
      const { results } = await bulkProjectsAction({ ids: selectedIds, action });
      const failed = results.filter((r) => !r.ok);
      const done = results.length - failed.length;
      if (failed.length === 0) {
        toast({ variant: "success", title: `${done} ${done === 1 ? "project" : "projects"} ${pastTense(action)}.` });
      } else {
        toast({
          variant: "destructive",
          title: `${done} done, ${failed.length} skipped — review the issues.`,
        });
        const byId = new Map(rows.map((r) => [r.id, r]));
        setPartial(
          failed.map((f) => ({
            id: f.id,
            title: byId.get(f.id)?.title ?? f.id,
            error: f.error ?? "Failed.",
          })),
        );
      }
      await load();
    } catch {
      toast({ variant: "destructive", title: "Bulk action failed. Please try again." });
    } finally {
      setBulkBusy(false);
    }
  }

  // ── Table ────────────────────────────────────────────────────────────────
  const columns = React.useMemo<ColumnDef<ProjectListItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <CheckboxCell
            checked={
              table.getIsAllRowsSelected()
                ? true
                : table.getIsSomeRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onChange={(v) => table.toggleAllRowsSelected(v)}
            label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <CheckboxCell
            checked={row.getIsSelected()}
            onChange={(v) => row.toggleSelected(v)}
            label={`Select ${row.original.title}`}
          />
        ),
        enableSorting: false,
      },
      {
        id: "cover",
        header: "",
        cell: ({ row }) => (
          <CoverThumb cover={row.original.cover_image} alt="" />
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <Link
            href={`/admin/projects/${row.original.id}`}
            className="font-medium text-foreground underline-offset-2 hover:underline"
            title={row.original.title}
          >
            <span className="line-clamp-2 max-w-[20rem]">{row.original.title}</span>
          </Link>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.category?.label ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "client_type",
        header: "Client",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.client_type ?? "—"}</span>
        ),
      },
      {
        accessorKey: "delivery_status",
        header: "Delivery",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.delivery_status}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.content_status;
          const badge = s ? CONTENT_STATUS_BADGE[s] : null;
          return badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : <span>—</span>;
        },
      },
      {
        id: "featured",
        header: "Featured",
        cell: ({ row }) =>
          row.original.featured ? (
            <Star className="h-4 w-4 fill-[var(--status-gold,#caa42a)] text-[var(--status-gold,#caa42a)]" aria-label="Featured" />
          ) : (
            <span className="sr-only">Not featured</span>
          ),
      },
      {
        accessorKey: "updated_at",
        header: "Updated",
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums text-muted-foreground">
            {formatDate(row.original.updated_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            busy={rowBusy === row.original.id}
            onEditHref={`/admin/projects/${row.original.id}`}
            onDuplicate={() => duplicate(row.original)}
            onPreview={() => preview(row.original)}
            onDelete={() => softDelete(row.original)}
          />
        ),
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowBusy],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { rowSelection: selection },
    onRowSelectionChange: setSelection,
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const total = result?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = isFiltered(filters);

  return (
    <div className="flex flex-col gap-4">
      <ProjectListToolbar
        filters={filters}
        onChange={handleFilterChange}
        onClearAll={handleClearAll}
        hasActiveFilters={filtered}
      />

      {/* Bulk bar */}
      {selectedIds.length > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-secondary/40 px-3 py-2 text-sm"
        >
          <span className="font-medium">{selectedIds.length} selected</span>
          <span className="mx-1 h-4 w-px bg-border" />
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("publish")}>
            Publish
          </Button>
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("unpublish")}>
            Unpublish
          </Button>
          <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("archive")}>
            Archive
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={bulkBusy}
            onClick={() => runBulk("delete")}
          >
            Delete
          </Button>
          {bulkBusy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelection({})}>
            Clear selection
          </Button>
        </div>
      )}

      {/* Partial-failure summary (publish gate, etc.) */}
      {partial && partial.length > 0 && (
        <div role="alert" className="flex flex-col gap-2 rounded-[10px] border border-[var(--status-warning)]/40 bg-[var(--status-warning)]/10 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold text-[var(--status-warning)]">
            <AlertTriangle className="h-4 w-4" /> Some projects were skipped
          </p>
          <ul className="flex flex-col gap-1">
            {partial.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.title}</span>
                <span className="text-muted-foreground">— {p.error}</span>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="text-foreground underline underline-offset-2"
                >
                  Fix it
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setPartial(null)}
            className="self-start text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table / states */}
      <div className="rounded-[10px] border border-border bg-card shadow-sm">
        {status === "error" ? (
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-destructive" />}
            title="Couldn't load projects."
            action={
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : status === "loading" ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          filtered ? (
            <EmptyState
              icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
              title="No projects match these filters."
              action={
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Clear all
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
              title="No projects yet"
              description="Create your first project."
              action={
                <Button asChild size="sm">
                  <Link href="/admin/projects/new">New project</Link>
                </Button>
              }
            />
          )
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {status === "ready" && total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => pushParams({ page: page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="tabular-nums">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => pushParams({ page: page + 1 })}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function pastTense(action: BulkAction): string {
  return action === "delete"
    ? "deleted"
    : action === "publish"
      ? "published"
      : action === "unpublish"
        ? "unpublished"
        : "archived";
}

function RowActions({
  row,
  busy,
  onEditHref,
  onDuplicate,
  onPreview,
  onDelete,
}: {
  row: ProjectListItem;
  busy: boolean;
  onEditHref: string;
  onDuplicate: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${row.title}`} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={onEditHref}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy className="h-4 w-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onPreview}>
          <Eye className="h-4 w-4" /> Preview
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CheckboxCell({
  checked,
  onChange,
  label,
}: {
  checked: boolean | "indeterminate";
  onChange: (v: boolean) => void;
  label: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === "indeterminate";
  }, [checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      role="checkbox"
      aria-label={label}
      checked={checked === true}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 cursor-pointer rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-10 w-14 rounded-md" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon}
      <p className={cn("font-medium")}>{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
