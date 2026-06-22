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

import type { PageKey } from "@prisma/client";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useMediaPicker } from "@/src/components/admin/media/media-picker-provider";
import { Field, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import { Thumb } from "@/src/components/admin/shared/list-primitives";
import { blankItem } from "./page-form";
import { DisplaySettingsEditor, hasDisplaySettings, isSplitLayoutHero } from "./display-settings-editor";
import {
  COLLECTION_SECTION_TYPES,
  SECTION_FIELD_CONFIG,
  STAT_SECTION_TYPES,
  sectionLabel,
  type SectionAdmin,
  type SectionChromeField,
  type SectionItemAdmin,
  type SectionItemField,
} from "./types";

// Stat keys offered in the stat picker — CompanyStat keys + the derived metrics the
// resolver supports (lib/data/pages buildStatResolver).
const STAT_KEYS = [
  "years_experience",
  "projects_count",
  "districts_covered",
  "team_size",
  "client_confidence_pct",
  "on_schedule_pct",
];

export function SectionEditor({
  section,
  pageKey,
  onChange,
}: {
  section: SectionAdmin;
  pageKey: PageKey;
  onChange: (patch: Partial<SectionAdmin>) => void;
}) {
  void pageKey;
  const pick = useMediaPicker();
  const isStat = STAT_SECTION_TYPES.includes(section.type);
  const isCollection = COLLECTION_SECTION_TYPES.includes(section.type);

  // Per-type field visibility: a section listed in SECTION_FIELD_CONFIG shows only the
  // declared fields (the public renderer ignores the rest); unlisted types show everything.
  const fieldConfig = SECTION_FIELD_CONFIG[section.type];
  const showChrome = (f: SectionChromeField) => !fieldConfig?.chrome || fieldConfig.chrome.includes(f);
  const itemFields = fieldConfig?.item;
  // A section that renders no item fields (e.g. final_cta, contact_panel — config `item: []`)
  // hides the whole Items editor. Stat/collection types manage items via their own editors.
  // A split-layout hero (one with a stamp) also draws no items, so hide its Items editor too.
  const hasItemEditor = (isStat || !itemFields || itemFields.length > 0) && !isSplitLayoutHero(section);

  function setItems(items: SectionItemAdmin[]) {
    onChange({ items });
  }

  async function pickBackground() {
    const r = await pick({ resourceType: "image", title: "Choose background image" });
    if (r && r[0]) onChange({ background_image: { id: r[0].id, url: r[0].url, alt: null, width: null, height: null } });
  }

  return (
    <div className="flex flex-col gap-4">
      <TabCard>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">{sectionLabel(section.type)}</h2>
          <code className="text-[11px] text-muted-foreground">{section.type}</code>
        </div>

        {/* Chrome fields — gated by the section type's field config (defaults to all). */}
        {showChrome("eyebrow") && (
          <Field label="Eyebrow" htmlFor="sec-eyebrow" helper="Small label above the heading.">
            <Input id="sec-eyebrow" value={section.eyebrow ?? ""} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          </Field>
        )}
        {showChrome("heading") && (
          <Field label="Heading" htmlFor="sec-heading">
            <Input id="sec-heading" value={section.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
        )}
        {showChrome("subheading") && (
          <Field label="Subheading" htmlFor="sec-subheading">
            <Input id="sec-subheading" value={section.subheading ?? ""} onChange={(e) => onChange({ subheading: e.target.value })} />
          </Field>
        )}
        {showChrome("body") && (
          <Field label="Body" htmlFor="sec-body">
            <Textarea id="sec-body" rows={3} value={section.body ?? ""} onChange={(e) => onChange({ body: e.target.value })} />
          </Field>
        )}

        {/* Background image */}
        {showChrome("background_image") && (
          <Field label="Background image" helper="Optional; needs alt text to publish if set.">
            <div className="flex items-center gap-3">
              <Thumb media={section.background_image} alt="" className="h-14 w-24" />
              <Button type="button" variant="outline" size="sm" onClick={pickBackground} className="gap-1">
                <ImageIcon className="h-4 w-4" /> {section.background_image ? "Replace" : "Choose"}
              </Button>
              {section.background_image && (
                <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ background_image: null })} aria-label="Remove background">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Field>
        )}

        {/* CTAs */}
        {showChrome("cta") && (
          <div className="grid gap-3 sm:grid-cols-2">
            <CtaField label="Primary CTA" cta={section.cta_primary} onChange={(v) => onChange({ cta_primary: v })} />
            <CtaField label="Secondary CTA" cta={section.cta_secondary} onChange={(v) => onChange({ cta_secondary: v })} />
          </div>
        )}
      </TabCard>

      {/* Display-only settings (badges, accents, captions stored in `settings`). */}
      {hasDisplaySettings(section.type) && <DisplaySettingsEditor section={section} onChange={onChange} />}

      {/* Type-specific content */}
      {isCollection ? (
        <TabCard>
          <p className="text-sm font-medium">Collection feed</p>
          <p className="text-[13px] text-muted-foreground">
            Records are pulled from the collection at render time — they aren&apos;t edited here.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Source" helper="Read-only feed key.">
              <Input value={section.source_key ?? ""} readOnly disabled />
            </Field>
            <Field label="Max items" htmlFor="sec-max" helper="Clamped to the site maximum.">
              <Input
                id="sec-max"
                type="number"
                min={1}
                value={section.max_items ?? ""}
                onChange={(e) => onChange({ max_items: e.target.value ? Number(e.target.value) : null })}
              />
            </Field>
          </div>
        </TabCard>
      ) : hasItemEditor ? (
        <TabCard>
          <ItemsEditor section={section} isStat={isStat} itemFields={itemFields} pick={pick} onChange={setItems} />
        </TabCard>
      ) : null}
    </div>
  );
}

function CtaField({
  label,
  cta,
  onChange,
}: {
  label: string;
  cta: { label: string; url: string } | null | undefined;
  onChange: (v: { label: string; url: string } | null) => void;
}) {
  const value = cta ?? { label: "", url: "" };
  function set(patch: Partial<{ label: string; url: string }>) {
    const next = { ...value, ...patch };
    onChange(next.label || next.url ? next : null);
  }
  return (
    <Field label={label} helper="Label + URL (both required to show).">
      <div className="flex flex-col gap-2">
        <Input placeholder="Label" value={value.label} onChange={(e) => set({ label: e.target.value })} aria-label={`${label} label`} />
        <Input placeholder="https://… or /path" value={value.url} onChange={(e) => set({ url: e.target.value })} aria-label={`${label} URL`} />
      </div>
    </Field>
  );
}

function ItemsEditor({
  section,
  isStat,
  itemFields,
  pick,
  onChange,
}: {
  section: SectionAdmin;
  isStat: boolean;
  itemFields: SectionItemField[] | undefined;
  pick: ReturnType<typeof useMediaPicker>;
  onChange: (items: SectionItemAdmin[]) => void;
}) {
  const items = section.items;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(items, from, to));
  }
  function patchItem(id: string, patch: Partial<SectionItemAdmin>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold">{isStat ? "Stats" : "Items"}</h3>
        <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => onChange([...items, blankItem()])}>
          <Plus className="h-4 w-4" /> Add {isStat ? "stat" : "item"}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
          No {isStat ? "stats" : "items"} yet.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-2">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  isStat={isStat}
                  itemFields={itemFields}
                  pick={pick}
                  onChange={(patch) => patchItem(item.id, patch)}
                  onRemove={() => onChange(items.filter((i) => i.id !== item.id))}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function ItemRow({
  item,
  isStat,
  itemFields,
  pick,
  onChange,
  onRemove,
}: {
  item: SectionItemAdmin;
  isStat: boolean;
  itemFields: SectionItemField[] | undefined;
  pick: ReturnType<typeof useMediaPicker>;
  onChange: (patch: Partial<SectionItemAdmin>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const imageUrl = item.image && "url" in item.image ? item.image.url : null;
  const showItem = (f: SectionItemField) => !itemFields || itemFields.includes(f);

  async function pickImage() {
    const r = await pick({ resourceType: "image", title: "Choose item image" });
    if (r && r[0]) onChange({ image: { id: r[0].id, url: r[0].url, alt: null, width: null, height: null } });
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-md border border-border bg-card p-2 shadow-sm", isDragging && "z-10 opacity-80 shadow-md")}
    >
      <div className="flex items-start gap-2">
        <button type="button" className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing" aria-label="Reorder item" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {isStat ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Stat" htmlFor={`stat-${item.id}`} helper="Resolved from Site Settings.">
                  <select
                    id={`stat-${item.id}`}
                    value={item.stat_key ?? ""}
                    onChange={(e) => onChange({ stat_key: e.target.value || null })}
                    className="h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Custom (value/unit below)</option>
                    {STAT_KEYS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Label override" htmlFor={`lbl-${item.id}`}>
                  <Input id={`lbl-${item.id}`} value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
                </Field>
              </div>
              {!item.stat_key && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Value" htmlFor={`val-${item.id}`}>
                    <Input id={`val-${item.id}`} value={item.value ?? ""} onChange={(e) => onChange({ value: e.target.value })} />
                  </Field>
                  <Field label="Unit" htmlFor={`unit-${item.id}`}>
                    <Input id={`unit-${item.id}`} value={item.unit ?? ""} onChange={(e) => onChange({ unit: e.target.value })} />
                  </Field>
                </div>
              )}
              {item.stat_key && (
                <p className="text-[12px] italic text-muted-foreground">Value + unit resolve from Site Settings at render time.</p>
              )}
            </>
          ) : (
            <>
              {showItem("image") && (
                <div className="flex items-center gap-3">
                  <Thumb media={imageUrl ? { id: "i", url: imageUrl, alt: null, width: null, height: null } : null} alt="" className="h-12 w-16" />
                  <Button type="button" variant="outline" size="sm" onClick={pickImage}>{item.image ? "Replace image" : "Add image"}</Button>
                  {item.image && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ image: null })} aria-label="Remove image"><X className="h-4 w-4" /></Button>
                  )}
                </div>
              )}
              {(showItem("title") || showItem("subtitle") || showItem("tag")) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {showItem("title") && (
                    <Field label="Title" htmlFor={`it-title-${item.id}`}>
                      <Input id={`it-title-${item.id}`} value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
                    </Field>
                  )}
                  {showItem("subtitle") && (
                    <Field label="Subtitle" htmlFor={`it-subtitle-${item.id}`}>
                      <Input id={`it-subtitle-${item.id}`} value={item.subtitle ?? ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
                    </Field>
                  )}
                  {showItem("tag") && (
                    <Field label="Tag" htmlFor={`it-tag-${item.id}`}>
                      <Input id={`it-tag-${item.id}`} value={item.tag ?? ""} onChange={(e) => onChange({ tag: e.target.value })} />
                    </Field>
                  )}
                </div>
              )}
              {showItem("body") && (
                <Field label="Body" htmlFor={`it-body-${item.id}`}>
                  <Textarea id={`it-body-${item.id}`} rows={2} value={item.body ?? ""} onChange={(e) => onChange({ body: e.target.value })} />
                </Field>
              )}
              {(showItem("icon") || showItem("link")) && (
                <div className="grid gap-2 sm:grid-cols-3">
                  {showItem("icon") && (
                    <Field label="Icon" htmlFor={`it-icon-${item.id}`}>
                      <Input id={`it-icon-${item.id}`} value={item.icon ?? ""} onChange={(e) => onChange({ icon: e.target.value })} />
                    </Field>
                  )}
                  {showItem("link") && (
                    <>
                      <Field label="Link label" htmlFor={`it-ll-${item.id}`}>
                        <Input id={`it-ll-${item.id}`} value={item.link_label ?? ""} onChange={(e) => onChange({ link_label: e.target.value })} />
                      </Field>
                      <Field label="Link URL" htmlFor={`it-lu-${item.id}`}>
                        <Input id={`it-lu-${item.id}`} value={item.link_url ?? ""} onChange={(e) => onChange({ link_url: e.target.value })} />
                      </Field>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <button type="button" onClick={onRemove} aria-label="Remove item" className="mt-1 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
