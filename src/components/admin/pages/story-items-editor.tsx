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
import { GripVertical, ImageIcon, Plus, Trash2, X } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useMediaPicker } from "@/src/components/admin/media/media-picker-provider";
import { Field } from "@/src/components/admin/shared/form-fields";
import { Thumb } from "@/src/components/admin/shared/list-primitives";
import { blankItem } from "./page-form";
import type { SectionAdmin, SectionItemAdmin } from "./types";

// The Story section (section-renderer.tsx StorySection) packs TWO things into one `items`
// list and splits them by whether an item has an image: image items → the photo collage,
// the rest → the stat row. The generic items editor can't tell them apart, so it shows a
// useless Title on photos, no stat fields on stats, and no collage cap. This editor splits
// the one list into a Photos group (image only, capped to the collage's 3 cells) and a Stats
// group (stat picker / label / value+unit), then merges them back into `items` on every edit
// (photos first, then stats — order only matters within each group).

// The collage CSS (.story-collage in about.css) is a fixed 2×2 grid with the first cell tall:
// exactly three visible cells. More photos have nowhere to render, so cap the editor here.
const MAX_COLLAGE = 3;

const hasImage = (it: SectionItemAdmin) => Boolean(it.image && "id" in it.image);

export function StoryItemsEditor({
  section,
  statKeys,
  onChange,
}: {
  section: SectionAdmin;
  statKeys: string[];
  onChange: (items: SectionItemAdmin[]) => void;
}) {
  const items = section.items;
  const photos = items.filter(hasImage);
  const stats = items.filter((it) => !hasImage(it));

  // Merge a changed group back with the other, preserving photos-first order.
  const commit = (nextPhotos: SectionItemAdmin[], nextStats: SectionItemAdmin[]) => onChange([...nextPhotos, ...nextStats]);

  return (
    <div className="flex flex-col gap-6">
      <CollageGroup
        photos={photos}
        onChange={(next) => commit(next, stats)}
      />
      <StatsGroup
        stats={stats}
        statKeys={statKeys}
        onChange={(next) => commit(photos, next)}
      />
    </div>
  );
}

// ── Collage photos ────────────────────────────────────────────────────────────
function CollageGroup({
  photos,
  onChange,
}: {
  photos: SectionItemAdmin[];
  onChange: (photos: SectionItemAdmin[]) => void;
}) {
  const pick = useMediaPicker();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const atCap = photos.length >= MAX_COLLAGE;

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = photos.findIndex((i) => i.id === active.id);
    const to = photos.findIndex((i) => i.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(photos, from, to));
  }

  async function addPhoto() {
    const r = await pick({ resourceType: "image", title: "Choose collage photo" });
    if (r && r[0]) {
      const item = { ...blankItem(), image: { id: r[0].id, url: r[0].url, alt: null, width: null, height: null } };
      onChange([...photos, item]);
    }
  }

  async function replacePhoto(id: string) {
    const r = await pick({ resourceType: "image", title: "Replace collage photo" });
    if (r && r[0]) {
      onChange(photos.map((p) => (p.id === id ? { ...p, image: { id: r[0].id, url: r[0].url, alt: null, width: null, height: null } } : p)));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-semibold">Collage photos</h3>
          <p className="text-[12px] text-muted-foreground">The image collage on the left. The layout shows up to {MAX_COLLAGE}.</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addPhoto} disabled={atCap}>
          <Plus className="h-4 w-4" /> Add photo
        </Button>
      </div>
      {atCap && <p className="text-[12px] text-muted-foreground">Maximum of {MAX_COLLAGE} photos reached — remove one to add another.</p>}

      {photos.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">No photos yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
          <SortableContext items={photos.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-2">
              {photos.map((p) => (
                <PhotoRow
                  key={p.id}
                  item={p}
                  onReplace={() => replacePhoto(p.id)}
                  onRemove={() => onChange(photos.filter((i) => i.id !== p.id))}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function PhotoRow({ item, onReplace, onRemove }: { item: SectionItemAdmin; onReplace: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const imageUrl = item.image && "url" in item.image ? item.image.url : null;
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3 rounded-md border border-border bg-card p-2 shadow-sm", isDragging && "z-10 opacity-80 shadow-md")}
    >
      <button type="button" className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing" aria-label="Reorder photo" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <Thumb media={imageUrl ? { id: "i", url: imageUrl, alt: null, width: null, height: null } : null} alt="" className="h-12 w-16" />
      <Button type="button" variant="outline" size="sm" onClick={onReplace}>Replace image</Button>
      <button type="button" onClick={onRemove} aria-label="Remove photo" className="ml-auto rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

// ── Stats ───────────────────────────────────────────────────────────────────
function StatsGroup({
  stats,
  statKeys,
  onChange,
}: {
  stats: SectionItemAdmin[];
  statKeys: string[];
  onChange: (stats: SectionItemAdmin[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = stats.findIndex((i) => i.id === active.id);
    const to = stats.findIndex((i) => i.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(stats, from, to));
  }
  function patch(id: string, p: Partial<SectionItemAdmin>) {
    onChange(stats.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-semibold">Stats</h3>
          <p className="text-[12px] text-muted-foreground">The KPI numbers beside the story copy. Pick a company stat (number resolves from Site Settings) or enter a custom value.</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => onChange([...stats, blankItem()])}>
          <Plus className="h-4 w-4" /> Add stat
        </Button>
      </div>

      {stats.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">No stats yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
          <SortableContext items={stats.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-2">
              {stats.map((s) => (
                <StatRow
                  key={s.id}
                  item={s}
                  statKeys={statKeys}
                  onChange={(p) => patch(s.id, p)}
                  onRemove={() => onChange(stats.filter((i) => i.id !== s.id))}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function StatRow({ item, statKeys, onChange, onRemove }: { item: SectionItemAdmin; statKeys: string[]; onChange: (p: Partial<SectionItemAdmin>) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-md border border-border bg-card p-2 shadow-sm", isDragging && "z-10 opacity-80 shadow-md")}
    >
      <div className="flex items-start gap-2">
        <button type="button" className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing" aria-label="Reorder stat" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Company stat" htmlFor={`story-stat-${item.id}`} helper="Resolved from Site Settings.">
              <select
                id={`story-stat-${item.id}`}
                value={item.stat_key ?? ""}
                onChange={(e) => onChange({ stat_key: e.target.value || null })}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Custom (value/unit below)</option>
                {statKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Label" htmlFor={`story-lbl-${item.id}`}>
              <Input id={`story-lbl-${item.id}`} value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
            </Field>
          </div>
          {item.stat_key ? (
            <p className="text-[12px] italic text-muted-foreground">Value + unit resolve from Site Settings at render time.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Value" htmlFor={`story-val-${item.id}`}>
                <Input id={`story-val-${item.id}`} value={item.value ?? ""} onChange={(e) => onChange({ value: e.target.value })} />
              </Field>
              <Field label="Unit" htmlFor={`story-unit-${item.id}`}>
                <Input id={`story-unit-${item.id}`} value={item.unit ?? ""} onChange={(e) => onChange({ unit: e.target.value })} />
              </Field>
            </div>
          )}
        </div>
        <button type="button" onClick={onRemove} aria-label="Remove stat" className="mt-1 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
