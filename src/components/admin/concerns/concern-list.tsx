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
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import {
  listConcernsAction,
  reorderConcernsAction,
  setDefaultConcernAction,
  duplicateConcernAction,
  deleteConcernAction,
  previewConcernAction,
} from "@/app/admin/concerns/actions";
import { cn } from "@/src/lib/utils";
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
  EmptyState,
  Pagination,
  TableSkeleton,
  Thumb,
} from "@/src/components/admin/shared/list-primitives";
import { CONTENT_STATUSES, type ConcernListItem } from "./types";

const PAGE_SIZE = 50;
const ALL = "__all";

interface ListResult {
  data: ConcernListItem[];
  meta: { page: number; pageSize: number; total: number };
}

export function ConcernList({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const { toast } = useToast();

  const q = searchParams.get("q") ?? "";
  const contentStatus = searchParams.get("contentStatus");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const filtered = Boolean(q || contentStatus);

  const [items, setItems] = React.useState<ConcernListItem[]>([]);
  const [meta, setMeta] = React.useState<ListResult["meta"]>({ page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);
  const [reordering, setReordering] = React.useState(false);
  const [searchText, setSearchText] = React.useState(q);

  const queryKey = searchParams.toString();
  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const res = (await listConcernsAction({
        page,
        pageSize: PAGE_SIZE,
        q: q || undefined,
        contentStatus: contentStatus || undefined,
      })) as ListResult;
      setItems(res.data);
      setMeta(res.meta);
      setStatus("ready");
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

  async function persistOrder(next: ConcernListItem[], previous: ConcernListItem[]) {
    setItems(next);
    setReordering(true);
    try {
      const res = (await reorderConcernsAction({ ordered_ids: next.map((c) => c.id) })) as { concerns: ConcernListItem[] };
      setItems(res.concerns);
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
    const from = items.findIndex((c) => c.id === active.id);
    const to = items.findIndex((c) => c.id === over.id);
    if (from === -1 || to === -1) return;
    void persistOrder(arrayMove(items, from, to), items);
  }
  function moveBy(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    void persistOrder(arrayMove(items, index, to), items);
  }

  async function setDefault(row: ConcernListItem) {
    setRowBusy(row.id);
    try {
      await setDefaultConcernAction(row.id);
      toast({ variant: "success", title: `“${row.name}” is now the default concern.` });
      await load();
    } catch (e) {
      toast({ variant: "destructive", title: (e as Error)?.message || "Couldn't set the default (must be published)." });
    } finally {
      setRowBusy(null);
    }
  }
  async function duplicate(row: ConcernListItem) {
    setRowBusy(row.id);
    try {
      const copy = await duplicateConcernAction(row.id);
      toast({ variant: "success", title: "Duplicated — opening the copy." });
      router.push(`/admin/concerns/${copy.id}`);
    } catch {
      toast({ variant: "destructive", title: "Couldn't duplicate the concern." });
      setRowBusy(null);
    }
  }
  async function preview(row: ConcernListItem) {
    setRowBusy(row.id);
    try {
      const { preview_url } = await previewConcernAction(row.id);
      window.open(preview_url, "_blank", "noopener,noreferrer");
    } catch {
      toast({ variant: "destructive", title: "Couldn't open the preview link." });
    } finally {
      setRowBusy(null);
    }
  }
  async function softDelete(row: ConcernListItem) {
    const ok = await confirm({
      title: "Delete this concern?",
      description: row.is_default
        ? "This is the default concern — set another as default first."
        : "It's removed from lists; an admin can restore it later.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setRowBusy(row.id);
    try {
      await deleteConcernAction(row.id);
      toast({ variant: "success", title: "Deleted." });
      await load();
    } catch (e) {
      toast({ variant: "destructive", title: (e as Error)?.message || "Couldn't delete the concern." });
    } finally {
      setRowBusy(null);
    }
  }

  const canReorder = !filtered && status === "ready";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-card p-3 shadow-sm">
        <div className="min-w-[16rem] flex-1">
          <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search concerns…" aria-label="Search concerns" />
        </div>
        <div className="w-44">
          <Select value={contentStatus ?? ALL} onValueChange={(v) => pushParams({ contentStatus: v === ALL ? null : v, page: 1 })}>
            <SelectTrigger aria-label="Status"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {CONTENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{CONTENT_STATUS_BADGE[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filtered && <Button variant="ghost" size="sm" onClick={() => router.replace("?", { scroll: false })}>Clear all</Button>}
        {reordering && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {!canReorder && status === "ready" && items.length > 0 && (
        <p className="text-[13px] text-muted-foreground">Clear filters to reorder concerns.</p>
      )}

      <div className="rounded-[10px] border border-border bg-card shadow-sm">
        {status === "error" ? (
          <EmptyState icon={<AlertTriangle className="h-8 w-8 text-destructive" />} title="Couldn't load concerns." action={<Button variant="outline" size="sm" onClick={load}>Retry</Button>} />
        ) : status === "loading" ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          filtered ? (
            <EmptyState icon={<Building2 className="h-8 w-8 text-muted-foreground" />} title="No concerns match these filters." action={<Button variant="outline" size="sm" onClick={() => router.replace("?", { scroll: false })}>Clear all</Button>} />
          ) : (
            <EmptyState icon={<Building2 className="h-8 w-8 text-muted-foreground" />} title="No concerns yet" description="Create your first concern." action={<Button asChild size="sm"><Link href="/admin/concerns/new">New concern</Link></Button>} />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border [&_th]:h-11 [&_th]:bg-secondary/40 [&_th]:px-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
                  <th className="w-8"></th>
                  <th className="w-14"></th>
                  <th>Concern</th>
                  <th>Status</th>
                  <th>Default</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {items.map((row, i) => (
                      <ConcernRow
                        key={row.id}
                        row={row}
                        index={i}
                        total={items.length}
                        canReorder={canReorder}
                        isAdmin={isAdmin}
                        busy={rowBusy === row.id}
                        onMoveUp={() => moveBy(i, -1)}
                        onMoveDown={() => moveBy(i, +1)}
                        onSetDefault={() => setDefault(row)}
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

      {status === "ready" && <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onPage={(p) => pushParams({ page: p })} />}
    </div>
  );
}

function ConcernRow({
  row,
  index,
  total,
  canReorder,
  isAdmin,
  busy,
  onMoveUp,
  onMoveDown,
  onSetDefault,
  onDuplicate,
  onPreview,
  onDelete,
}: {
  row: ConcernListItem;
  index: number;
  total: number;
  canReorder: boolean;
  isAdmin: boolean;
  busy: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetDefault: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id, disabled: !canReorder });
  const badge = row.content_status ? CONTENT_STATUS_BADGE[row.content_status] : null;
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("border-b border-border last:border-0 hover:bg-secondary/50 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle", isDragging && "bg-card opacity-80 shadow-md")}
    >
      <td>
        <div className="flex flex-col items-center">
          <button type="button" aria-label={`Reorder ${row.name}`} disabled={!canReorder} className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
          {canReorder && (
            <span className="flex">
              <button type="button" onClick={onMoveUp} disabled={index === 0} aria-label="Move up" className="rounded p-0.5 hover:bg-secondary disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button>
              <button type="button" onClick={onMoveDown} disabled={index === total - 1} aria-label="Move down" className="rounded p-0.5 hover:bg-secondary disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      </td>
      <td><Thumb media={row.hero_image} alt="" /></td>
      <td>
        <Link href={`/admin/concerns/${row.id}`} className="font-medium text-foreground underline-offset-2 hover:underline"><span className="line-clamp-1">{row.name}</span></Link>
        {row.short && <span className="line-clamp-1 text-xs text-muted-foreground">{row.short}</span>}
      </td>
      <td>{badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : "—"}</td>
      <td>
        {row.is_default ? (
          <span className="inline-flex items-center gap-1 text-[var(--status-gold,#caa42a)]">
            <Star className="h-4 w-4 fill-current" /> <span className="text-xs font-medium">Default</span>
          </span>
        ) : (
          <span className="sr-only">Not default</span>
        )}
      </td>
      <td>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${row.name}`} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/concerns/${row.id}`}><Pencil className="h-4 w-4" /> Edit</Link>
            </DropdownMenuItem>
            {isAdmin && !row.is_default && (
              <DropdownMenuItem onSelect={onSetDefault}><Star className="h-4 w-4" /> Set as default</DropdownMenuItem>
            )}
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
