"use client";

import * as React from "react";
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
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";

import { listProjectsAction, setFeaturedAction } from "@/app/admin/projects/actions";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useToast } from "@/src/components/ui/use-toast";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { CoverThumb } from "./cover-thumb";
import type { FeaturedItem, ProjectListItem } from "./types";

interface ListResult {
  data: ProjectListItem[];
  meta: { page: number; pageSize: number; total: number };
}

export function FeaturedCuration({
  initial,
  max,
}: {
  initial: FeaturedItem[];
  max: number;
}) {
  const { toast } = useToast();
  const confirm = useConfirm();

  const [items, setItems] = React.useState<FeaturedItem[]>(initial);
  const [pending, setPending] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const overCap = items.length > max;
  const atCap = items.length >= max;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Persist a new ordered set; optimistic, revert on failure (FR-PROJ-031). */
  async function persist(next: FeaturedItem[], previous: FeaturedItem[], successMsg: string) {
    setItems(next);
    setPending(true);
    setError(null);
    try {
      const res = (await setFeaturedAction({ ordered_ids: next.map((p) => p.id) })) as {
        featured: FeaturedItem[];
      };
      // Trust the server's canonical order (reflects auto-unfeature, etc.).
      setItems(res.featured);
      toast({ variant: "success", title: successMsg });
    } catch {
      setItems(previous); // revert
      setError("Couldn't save the change — reverted.");
      toast({ variant: "destructive", title: "Couldn't update the featured set." });
    } finally {
      setPending(false);
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((p) => p.id === active.id);
    const to = items.findIndex((p) => p.id === over.id);
    if (from === -1 || to === -1) return;
    const previous = items;
    void persist(arrayMove(items, from, to), previous, "Featured order updated.");
  }

  function moveBy(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    const previous = items;
    void persist(arrayMove(items, index, to), previous, "Featured order updated.");
  }

  async function removeAt(index: number) {
    const target = items[index];
    const ok = await confirm({
      title: "Remove from featured?",
      description: `“${target.title}” will no longer appear in the featured strip.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    const previous = items;
    void persist(
      items.filter((_, i) => i !== index),
      previous,
      "Removed from featured.",
    );
  }

  function addProjects(picks: ProjectListItem[]) {
    const previous = items;
    const merged = [...items];
    for (const p of picks) {
      if (merged.length >= max) break;
      if (!merged.some((m) => m.id === p.id)) merged.push(p as FeaturedItem);
    }
    void persist(merged, previous, "Added to featured.");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Capacity meter + add */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-[var(--status-gold,#caa42a)]" />
          <span className="font-medium tabular-nums">
            {items.length} / {max} featured
          </span>
          {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <Button
          type="button"
          size="sm"
          disabled={atCap || pending}
          onClick={() => setPickerOpen(true)}
          title={atCap ? `You've reached the maximum of ${max}.` : undefined}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Add project
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive">
          {error}
        </p>
      )}

      {overCap && (
        <p role="alert" className="rounded-md border border-[var(--status-warning)]/40 bg-[var(--status-warning)]/10 px-3 py-2 text-[13px] text-[var(--status-warning)]">
          The featured set ({items.length}) is over the current maximum of {max}. Remove {items.length - max}{" "}
          to get back within the cap.
        </p>
      )}

      {atCap && !overCap && (
        <p className="text-[13px] text-muted-foreground">
          You&apos;ve reached the maximum of {max}. Remove one to add another.
        </p>
      )}

      {/* Featured list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[10px] border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <Star className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No featured projects yet</p>
          <p className="text-sm text-muted-foreground">
            Feature a published project to showcase it on the home page.
          </p>
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            Add project
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-2">
              {items.map((p, i) => (
                <FeaturedCard
                  key={p.id}
                  item={p}
                  index={i}
                  total={items.length}
                  disabled={pending}
                  onMoveUp={() => moveBy(i, -1)}
                  onMoveDown={() => moveBy(i, +1)}
                  onRemove={() => removeAt(i)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <AddFeaturedPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={items.map((p) => p.id)}
        remaining={Math.max(0, max - items.length)}
        onConfirm={addProjects}
      />
    </div>
  );
}

function FeaturedCard({
  item,
  index,
  total,
  disabled,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  item: FeaturedItem;
  index: number;
  total: number;
  disabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  return (
    <li
      ref={setNodeRef}
      aria-label={`${index + 1} of ${total}: ${item.title}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-[10px] border border-border bg-card p-2 shadow-sm",
        isDragging && "z-10 opacity-80 shadow-md",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        aria-label={`Reorder ${item.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-5 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      <CoverThumb cover={item.cover_image} alt="" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.category?.label ?? "Uncategorised"}</p>
      </div>
      <div className="flex items-center gap-0.5">
        <Button type="button" variant="ghost" size="icon" disabled={disabled || index === 0} onClick={onMoveUp} aria-label="Move up">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={disabled || index === total - 1} onClick={onMoveDown} aria-label="Move down">
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onRemove}
          aria-label={`Remove ${item.title} from featured`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

function AddFeaturedPicker({
  open,
  onOpenChange,
  excludeIds,
  remaining,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: string[];
  remaining: number;
  onConfirm: (picks: ProjectListItem[]) => void;
}) {
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState<ProjectListItem[] | null>(null);
  const [error, setError] = React.useState(false);
  const [selected, setSelected] = React.useState<Record<string, ProjectListItem>>({});

  const load = React.useCallback(async (query: string) => {
    setRows(null);
    setError(false);
    try {
      const res = (await listProjectsAction({
        page: 1,
        pageSize: 20,
        contentStatus: "published",
        featured: false,
        q: query || undefined,
        sort: "recent",
      })) as ListResult;
      setRows(res.data);
    } catch {
      setError(true);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setSelected({});
    setQ("");
    void load("");
  }, [open, load]);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(q), 300);
    return () => clearTimeout(t);
  }, [q, open, load]);

  const selectedIds = Object.keys(selected);
  const atMax = selectedIds.length >= remaining;
  const visible = (rows ?? []).filter((r) => !excludeIds.includes(r.id) && !r.featured);

  function toggle(row: ProjectListItem) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[row.id]) delete next[row.id];
      else if (selectedIds.length < remaining) next[row.id] = row;
      return next;
    });
  }

  function confirm() {
    onConfirm(selectedIds.map((id) => selected[id]));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add featured projects</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search published projects…"
            aria-label="Search published projects"
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} of {remaining} slots selected
        </p>

        <div className="max-h-[50vh] overflow-auto rounded-md border border-border">
          {error ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              Couldn&apos;t load projects.
              <Button variant="outline" size="sm" onClick={() => load(q)}>
                Retry
              </Button>
            </div>
          ) : rows === null ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : visible.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No more published projects to feature.
            </p>
          ) : (
            <ul>
              {visible.map((row) => {
                const isSelected = !!selected[row.id];
                const disabled = !isSelected && atMax;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => toggle(row)}
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left last:border-0 hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-50",
                        isSelected && "bg-secondary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <CoverThumb cover={row.cover_image} alt="" />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-medium">{row.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.category?.label ?? "Uncategorised"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={selectedIds.length === 0}>
            Add {selectedIds.length > 0 ? selectedIds.length : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
