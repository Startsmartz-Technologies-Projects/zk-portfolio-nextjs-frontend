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
import { Award, ChevronDown, ChevronUp, GripVertical, Loader2, Plus, Search, X } from "lucide-react";

import {
  listCertificationsAction,
  updateCertificationAction,
  setHomeSealsAction,
} from "@/app/admin/certifications/actions";
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
import type { CertListItem } from "./types";

interface ListResult {
  data: CertListItem[];
  meta: { page: number; pageSize: number; total: number };
}

export function HomeSealsManager({ initial }: { initial: CertListItem[] }) {
  const { toast } = useToast();
  const confirm = useConfirm();

  const [items, setItems] = React.useState<CertListItem[]>(initial);
  const [pending, setPending] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function persistOrder(next: CertListItem[], previous: CertListItem[]) {
    setItems(next);
    setPending(true);
    try {
      const res = (await setHomeSealsAction({ ordered_ids: next.map((c) => c.id) })) as {
        home_seals: { slug: string }[];
      };
      // Re-fetch the full list rows for the now-shown set (the action returns seal-only shapes).
      const fresh = (await listCertificationsAction({ showOnHome: true, pageSize: 100 })) as ListResult;
      const order = new Map(res.home_seals.map((s, i) => [s.slug, i]));
      setItems(fresh.data.slice().sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)));
      toast({ variant: "success", title: "Home seals updated." });
    } catch {
      setItems(previous);
      toast({ variant: "destructive", title: "Couldn't update the home seals — reverted." });
    } finally {
      setPending(false);
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
  async function removeAt(index: number) {
    const target = items[index];
    const ok = await confirm({
      title: "Remove from home seals?",
      description: `“${target.title}” will no longer show on the home page.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    const previous = items;
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    setPending(true);
    try {
      // Persisting the reduced set turns the dropped cert's show_on_home off server-side.
      await setHomeSealsAction({ ordered_ids: next.map((c) => c.id) });
      toast({ variant: "success", title: "Removed from home." });
    } catch {
      setItems(previous);
      toast({ variant: "destructive", title: "Couldn't remove — reverted." });
    } finally {
      setPending(false);
    }
  }

  async function addCert(cert: CertListItem, sealLabel: string) {
    setPending(true);
    try {
      // Ensure the cert has its seal_label set (setHomeSeals requires it), then include it.
      await updateCertificationAction(cert.id, { show_on_home: true, seal_label: sealLabel });
      const next = [...items, cert];
      await setHomeSealsAction({ ordered_ids: next.map((c) => c.id) });
      const fresh = (await listCertificationsAction({ showOnHome: true, pageSize: 100 })) as ListResult;
      setItems(fresh.data);
      toast({ variant: "success", title: "Added to home seals." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't add the certification." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 text-[var(--status-gold,#caa42a)]" />
          <span className="font-medium tabular-nums">{items.length} on home</span>
          {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <Button type="button" size="sm" disabled={pending} onClick={() => setPickerOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add certification
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[10px] border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <Award className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No home seals yet</p>
          <p className="text-sm text-muted-foreground">Add a published certification to feature its seal on the home page.</p>
          <Button size="sm" onClick={() => setPickerOpen(true)}>Add certification</Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
          <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-2">
              {items.map((c, i) => (
                <SealCard
                  key={c.id}
                  item={c}
                  index={i}
                  total={items.length}
                  disabled={pending}
                  onMoveUp={() => moveBy(i, -1)}
                  onMoveDown={() => moveBy(i, +1)}
                  onRemove={() => removeAt(i)}
                  onSave={async (fields) => {
                    await updateCertificationAction(c.id, fields);
                    setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...fields } : x)));
                    toast({ variant: "success", title: "Seal updated." });
                  }}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <AddSealPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={items.map((c) => c.id)}
        onConfirm={addCert}
      />
    </div>
  );
}

function SealCard({
  item,
  index,
  total,
  disabled,
  onMoveUp,
  onMoveDown,
  onRemove,
  onSave,
}: {
  item: CertListItem;
  index: number;
  total: number;
  disabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onSave: (fields: { seal_label: string; seal_id: string | null; seal_validity: string | null }) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [editing, setEditing] = React.useState(false);
  const [label, setLabel] = React.useState(item.seal_label ?? "");
  const [sid, setSid] = React.useState(item.seal_id ?? "");
  const [validity, setValidity] = React.useState(item.seal_validity ?? "");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (!label.trim()) return;
    setSaving(true);
    try {
      await onSave({ seal_label: label.trim(), seal_id: sid.trim() || null, seal_validity: validity.trim() || null });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex flex-col gap-2 rounded-[10px] border border-border bg-card p-2 shadow-sm", isDragging && "z-10 opacity-80 shadow-md")}
    >
      <div className="flex items-center gap-3">
        <button type="button" className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing" aria-label={`Reorder ${item.title}`} {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="w-5 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{item.seal_label || item.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {item.title}
            {item.seal_validity ? ` · ${item.seal_validity}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon" disabled={disabled || index === 0} onClick={onMoveUp} aria-label="Move up"><ChevronUp className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" disabled={disabled || index === total - 1} onClick={onMoveDown} aria-label="Move down"><ChevronDown className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>{editing ? "Close" : "Edit"}</Button>
          <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={onRemove} aria-label={`Remove ${item.title}`} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><X className="h-4 w-4" /></Button>
        </div>
      </div>
      {editing && (
        <div className="grid gap-2 border-t border-border pt-2 sm:grid-cols-3">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Seal label (required)" aria-label="Seal label" />
          <Input value={sid} onChange={(e) => setSid(e.target.value)} placeholder="Seal ID" aria-label="Seal ID" />
          <div className="flex gap-2">
            <Input value={validity} onChange={(e) => setValidity(e.target.value)} placeholder="Validity" aria-label="Seal validity" />
            <Button type="button" size="sm" onClick={save} disabled={saving || !label.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddSealPicker({
  open,
  onOpenChange,
  excludeIds,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: string[];
  onConfirm: (cert: CertListItem, sealLabel: string) => void;
}) {
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState<CertListItem[] | null>(null);
  const [error, setError] = React.useState(false);
  const [selected, setSelected] = React.useState<CertListItem | null>(null);
  const [sealLabel, setSealLabel] = React.useState("");

  const load = React.useCallback(async (query: string) => {
    setRows(null);
    setError(false);
    try {
      const res = (await listCertificationsAction({ page: 1, pageSize: 20, contentStatus: "published", q: query || undefined })) as ListResult;
      setRows(res.data.filter((c) => !c.show_on_home));
    } catch {
      setError(true);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setSelected(null);
    setSealLabel("");
    setQ("");
    void load("");
  }, [open, load]);
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(q), 300);
    return () => clearTimeout(t);
  }, [q, open, load]);

  const visible = (rows ?? []).filter((c) => !excludeIds.includes(c.id));

  function confirm() {
    if (selected && sealLabel.trim()) {
      onConfirm(selected, sealLabel.trim());
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a home seal</DialogTitle>
        </DialogHeader>

        {!selected ? (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search published certifications…" aria-label="Search certifications" className="pl-8" />
            </div>
            <div className="max-h-[50vh] overflow-auto rounded-md border border-border">
              {error ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                  Couldn&apos;t load certifications.
                  <Button variant="outline" size="sm" onClick={() => load(q)}>Retry</Button>
                </div>
              ) : rows === null ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              ) : visible.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No more published certifications to feature.</p>
              ) : (
                <ul>
                  {visible.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(c);
                          setSealLabel(c.seal_label ?? c.title);
                        }}
                        className="flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left last:border-0 hover:bg-secondary/50"
                      >
                        <Award className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-1 font-medium">{c.title}</span>
                          <span className="text-xs text-muted-foreground">{c.authority ?? "—"}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Seal for <strong>{selected.title}</strong>
            </p>
            <Input value={sealLabel} onChange={(e) => setSealLabel(e.target.value)} placeholder="Seal label (required)" aria-label="Seal label" autoFocus />
            <p className="text-[12px] text-muted-foreground">A seal label is required to show a certification on the home page.</p>
          </div>
        )}

        <DialogFooter>
          {selected && (
            <Button variant="ghost" onClick={() => setSelected(null)}>Back</Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirm} disabled={!selected || !sealLabel.trim()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
