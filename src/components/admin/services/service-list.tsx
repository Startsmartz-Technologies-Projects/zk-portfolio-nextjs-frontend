"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";

import {
  listServicesAction,
  reorderServicesAction,
  duplicateServiceAction,
  deleteServiceAction,
  previewServiceAction,
  bulkServicesAction,
} from "@/app/admin/services/actions";
import { cn } from "@/src/lib/utils";
import { formatDate } from "@/src/lib/format-date";
import { Badge } from "@/src/components/ui/badge";
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
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useToast } from "@/src/components/ui/use-toast";
import {
  CONTENT_STATUS_BADGE,
  CheckboxCell,
  EmptyState,
  Pagination,
  TableSkeleton,
  Thumb,
} from "@/src/components/admin/shared/list-primitives";
import { CONTENT_STATUSES, type ContentStatus, type ServiceListItem } from "./types";

const PAGE_SIZE = 50; // the catalog is small + manually ordered; show it in one page
const ALL = "__all";

type BulkAction = "publish" | "unpublish" | "archive" | "delete";

interface ListResult {
  data: ServiceListItem[];
  meta: { page: number; pageSize: number; total: number };
}

export function ServiceList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const { toast } = useToast();

  const q = searchParams.get("q") ?? "";
  const contentStatus = searchParams.get("contentStatus");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const filtered = Boolean(q || contentStatus);

  const [items, setItems] = React.useState<ServiceListItem[]>([]);
  const [meta, setMeta] = React.useState<ListResult["meta"]>({ page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [selection, setSelection] = React.useState<Record<string, boolean>>({});
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);
  const [reordering, setReordering] = React.useState(false);
  const [searchText, setSearchText] = React.useState(q);

  const queryKey = searchParams.toString();
  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const res = (await listServicesAction({
        page,
        pageSize: PAGE_SIZE,
        q: q || undefined,
        contentStatus: contentStatus || undefined,
      })) as ListResult;
      setItems(res.data);
      setMeta(res.meta);
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

  // Debounced search → URL.
  React.useEffect(() => {
    setSearchText(q);
  }, [q]);
  React.useEffect(() => {
    if (searchText === q) return;
    const t = setTimeout(() => pushParams({ q: searchText, page: 1 }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  function pushParams(next: { q?: string; contentStatus?: string | null; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const set = (k: string, v: string | null | undefined) => {
      if (v) params.set(k, v);
      else params.delete(k);
    };
    if ("q" in next) set("q", next.q || null);
    if ("contentStatus" in next) set("contentStatus", next.contentStatus || null);
    set("page", next.page && next.page > 1 ? String(next.page) : null);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function persistOrder(next: ServiceListItem[], previous: ServiceListItem[]) {
    setItems(next);
    setReordering(true);
    try {
      const res = (await reorderServicesAction({ ordered_ids: next.map((s) => s.id) })) as {
        services: ServiceListItem[];
      };
      setItems(res.services);
      toast({ variant: "success", title: "Order updated." });
    } catch {
      setItems(previous);
      toast({ variant: "destructive", title: "Couldn't reorder — reverted." });
    } finally {
      setReordering(false);
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((s) => s.id === active.id);
    const to = items.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;
    void persistOrder(arrayMove(items, from, to), items);
  }
  function moveBy(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    void persistOrder(arrayMove(items, index, to), items);
  }

  // ── Row actions ───────────────────────────────────────────────────────────
  async function duplicate(row: ServiceListItem) {
    setRowBusy(row.id);
    try {
      const copy = await duplicateServiceAction(row.id);
      toast({ variant: "success", title: "Duplicated — opening the copy." });
      router.push(`/admin/services/${copy.id}`);
    } catch {
      toast({ variant: "destructive", title: "Couldn't duplicate the service." });
      setRowBusy(null);
    }
  }
  async function preview(row: ServiceListItem) {
    setRowBusy(row.id);
    try {
      const { preview_url } = await previewServiceAction(row.id);
      window.open(preview_url, "_blank", "noopener,noreferrer");
    } catch {
      toast({ variant: "destructive", title: "Couldn't open the preview link." });
    } finally {
      setRowBusy(null);
    }
  }
  async function softDelete(row: ServiceListItem) {
    const ok = await confirm({
      title: "Delete this service?",
      description: "It's removed from lists; an admin can restore it later.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setRowBusy(row.id);
    try {
      await deleteServiceAction(row.id);
      toast({ variant: "success", title: "Deleted." });
      await load();
    } catch {
      toast({ variant: "destructive", title: "Couldn't delete the service." });
    } finally {
      setRowBusy(null);
    }
  }

  // ── Bulk ──────────────────────────────────────────────────────────────────
  const selectedIds = Object.keys(selection).filter((id) => selection[id]);
  async function runBulk(action: BulkAction) {
    if (selectedIds.length === 0) return;
    const noun = `${selectedIds.length} service${selectedIds.length === 1 ? "" : "s"}`;
    if (action !== "publish") {
      const ok = await confirm({
        title: `${action[0].toUpperCase() + action.slice(1)} ${noun}?`,
        description: action === "delete" ? "You can restore them later." : "They leave the public site.",
        confirmLabel: action[0].toUpperCase() + action.slice(1),
        destructive: true,
      });
      if (!ok) return;
    }
    setBulkBusy(true);
    try {
      const { results } = await bulkServicesAction({ ids: selectedIds, action });
      const failed = results.filter((r) => !r.ok).length;
      const done = results.length - failed;
      toast(
        failed === 0
          ? { variant: "success", title: `${done} ${done === 1 ? "service" : "services"} updated.` }
          : { variant: "destructive", title: `${done} done, ${failed} skipped.` },
      );
      await load();
    } catch {
      toast({ variant: "destructive", title: "Bulk action failed." });
    } finally {
      setBulkBusy(false);
    }
  }

  const allSelected = items.length > 0 && items.every((s) => selection[s.id]);
  const someSelected = items.some((s) => selection[s.id]);
  const canReorder = !filtered && status === "ready";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-card p-3 shadow-sm">
        <div className="min-w-[16rem] flex-1">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
          />
        </div>
        <div className="w-44">
          <Select
            value={contentStatus ?? ALL}
            onValueChange={(v) => pushParams({ contentStatus: v === ALL ? null : v, page: 1 })}
          >
            <SelectTrigger aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {CONTENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {CONTENT_STATUS_BADGE[s as ContentStatus].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => router.replace("?", { scroll: false })}>
            Clear all
          </Button>
        )}
        {reordering && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {!canReorder && status === "ready" && items.length > 0 && (
        <p className="text-[13px] text-muted-foreground">Clear filters to reorder the catalogue.</p>
      )}

      {/* Bulk bar */}
      {selectedIds.length > 0 && (
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
          <EmptyState icon={<AlertTriangle className="h-8 w-8 text-destructive" />} title="Couldn't load services." action={<Button variant="outline" size="sm" onClick={load}>Retry</Button>} />
        ) : status === "loading" ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          filtered ? (
            <EmptyState icon={<Wrench className="h-8 w-8 text-muted-foreground" />} title="No services match these filters." action={<Button variant="outline" size="sm" onClick={() => router.replace("?", { scroll: false })}>Clear all</Button>} />
          ) : (
            <EmptyState icon={<Wrench className="h-8 w-8 text-muted-foreground" />} title="No services yet" description="Create your first service." action={<Button asChild size="sm"><Link href="/admin/services/new">New service</Link></Button>} />
          )
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border [&_th]:h-11 [&_th]:bg-secondary/40 [&_th]:px-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
                  <th className="w-8"></th>
                  <th className="w-10">
                    <CheckboxCell
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onChange={(v) => setSelection(v ? Object.fromEntries(items.map((s) => [s.id, true])) : {})}
                      label="Select all"
                    />
                  </th>
                  <th className="w-14"></th>
                  {/* Service absorbs spare width so the row fills the table (no right-side gap). */}
                  <th className="w-full">Service</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {items.map((row, i) => (
                      <ServiceRow
                        key={row.id}
                        row={row}
                        index={i}
                        total={items.length}
                        canReorder={canReorder}
                        selected={!!selection[row.id]}
                        busy={rowBusy === row.id}
                        onSelect={(v) => setSelection((s) => ({ ...s, [row.id]: v }))}
                        onMoveUp={() => moveBy(i, -1)}
                        onMoveDown={() => moveBy(i, +1)}
                        onDuplicate={() => duplicate(row)}
                        onPreview={() => preview(row)}
                        onDelete={() => softDelete(row)}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        )}
      </div>

      {status === "ready" && (
        <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onPage={(p) => pushParams({ page: p })} />
      )}
    </div>
  );
}

function ServiceRow({
  row,
  index,
  total,
  canReorder,
  selected,
  busy,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onPreview,
  onDelete,
}: {
  row: ServiceListItem;
  index: number;
  total: number;
  canReorder: boolean;
  selected: boolean;
  busy: boolean;
  onSelect: (v: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: !canReorder,
  });
  const badge = row.content_status ? CONTENT_STATUS_BADGE[row.content_status] : null;
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-b border-border last:border-0 hover:bg-secondary/50 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle",
        isDragging && "bg-card opacity-80 shadow-md",
        selected && "bg-secondary/40",
      )}
    >
      <td>
        <button
          type="button"
          aria-label={`Reorder ${row.title}`}
          disabled={!canReorder}
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td>
        <CheckboxCell checked={selected} onChange={onSelect} label={`Select ${row.title}`} />
      </td>
      <td>
        <Thumb media={row.hero_image} alt="" />
      </td>
      <td>
        <Link href={`/admin/services/${row.id}`} className="font-medium text-foreground underline-offset-2 hover:underline">
          <span className="line-clamp-1">{row.title}</span>
        </Link>
        {row.subtitle && <span className="line-clamp-1 text-xs text-muted-foreground">{row.subtitle}</span>}
      </td>
      <td className="tabular-nums text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>{row.service_number}/{row.total_services}</span>
          {canReorder && (
            <span className="flex flex-col">
              <button type="button" onClick={onMoveUp} disabled={index === 0} aria-label="Move up" className="rounded p-0.5 hover:bg-secondary disabled:opacity-30">
                <ChevronUp className="h-3 w-3" />
              </button>
              <button type="button" onClick={onMoveDown} disabled={index === total - 1} aria-label="Move down" className="rounded p-0.5 hover:bg-secondary disabled:opacity-30">
                <ChevronDown className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      </td>
      <td>{badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : "—"}</td>
      <td className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(row.updated_at)}</td>
      <td>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${row.title}`} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/services/${row.id}`}><Pencil className="h-4 w-4" /> Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
            <DropdownMenuItem onSelect={onPreview}><Eye className="h-4 w-4" /> Preview</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
