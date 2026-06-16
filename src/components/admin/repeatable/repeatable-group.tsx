"use client";

import * as React from "react";
import {
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { useConfirm } from "@/src/components/admin/confirm-dialog";

export type RepeatableRow = Record<string, unknown>;

export interface RepeatableGroupProps {
  /** RHF field-array path (the host form must be a FormProvider). */
  name: string;
  /** Group header label, e.g. "Scopes". */
  label: string;
  /** Singular noun for Add / empty copy, e.g. "scope" → "Add scope", "No scopes yet." */
  itemNoun: string;
  variant?: "standard" | "scalar-list" | "media-backed" | "picker-backed";
  min?: number;
  max?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Blank-row factory for inline Add (standard / scalar-list). */
  newRow?: () => RepeatableRow;
  /** Media-backed / picker-backed Add: open the host picker, resolve appended row(s). */
  onAddExternal?: (remainingSlots: number) => Promise<RepeatableRow[] | null>;
  /** Collapsed summary line for a row. */
  summary: (row: RepeatableRow, index: number) => React.ReactNode;
  /** Render a row's editable fields (host binds inputs to `${name}.${index}.*`). */
  renderRow: (ctx: { index: number; fieldId: string }) => React.ReactNode;
  /** Whether a row holds user content (drives the remove-confirm). */
  rowHasContent?: (row: RepeatableRow) => boolean;
  addLabel?: string;
  emptyHint?: string;
  className?: string;
}

const defaultHasContent = (row: RepeatableRow): boolean =>
  Object.values(row ?? {}).some(
    (v) => v !== null && v !== undefined && v !== "" && v !== false,
  );

export function RepeatableGroup({
  name,
  label,
  itemNoun,
  variant = "standard",
  min,
  max,
  collapsible = true,
  defaultCollapsed = false,
  newRow,
  onAddExternal,
  summary,
  renderRow,
  rowHasContent = defaultHasContent,
  addLabel,
  emptyHint,
  className,
}: RepeatableGroupProps) {
  const confirm = useConfirm();
  const { control, formState } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const values = (useWatch({ control, name }) as RepeatableRow[] | undefined) ?? [];

  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const [announce, setAnnounce] = React.useState("");
  const pendingFocus = React.useRef(false);
  const rowEls = React.useRef<Map<string, HTMLLIElement>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Per-row error lookup from RHF's nested error tree.
  const arrayErrors = formState.errors?.[name] as
    | Array<unknown | undefined>
    | undefined;
  const rowHasError = (i: number) => Boolean(arrayErrors?.[i]);
  const errorCount = fields.reduce((n, _f, i) => n + (rowHasError(i) ? 1 : 0), 0);

  const atMax = typeof max === "number" && fields.length >= max;
  const addBtnLabel = addLabel ?? `Add ${itemNoun}`;

  // After an inline Add, expand + focus the first input of the new (last) row.
  React.useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const last = fields[fields.length - 1];
    if (last) {
      const el = rowEls.current.get(last.id);
      el?.scrollIntoView({ block: "nearest" });
      el?.querySelector<HTMLElement>("input,textarea,[contenteditable]")?.focus();
    }
  }, [fields]);

  async function handleAdd() {
    if (atMax) return;
    if ((variant === "media-backed" || variant === "picker-backed") && onAddExternal) {
      const remaining = typeof max === "number" ? max - fields.length : Infinity;
      const rows = await onAddExternal(remaining);
      if (!rows || rows.length === 0) return;
      const trimmed = Number.isFinite(remaining) ? rows.slice(0, remaining) : rows;
      trimmed.forEach((r) => append(r));
      setAnnounce(`Added ${trimmed.length} ${itemNoun}${trimmed.length === 1 ? "" : "s"}.`);
      return;
    }
    const row = newRow ? newRow() : ({} as RepeatableRow);
    append(row);
    // The appended row is last; expand + focus it after the field array updates.
    pendingFocus.current = true;
    setAnnounce(`Added ${itemNoun}.`);
  }

  async function handleRemove(index: number) {
    const row = values[index] ?? {};
    if (rowHasContent(row)) {
      const ok = await confirm({
        title: `Remove this ${itemNoun}?`,
        description: "This row has content that will be removed when you save.",
        confirmLabel: "Remove",
        cancelLabel: "Keep",
        destructive: true,
      });
      if (!ok) return;
    }
    remove(index);
    setAnnounce(`Removed ${itemNoun}.`);
    // Focus the next row, or the Add button when the list empties.
    requestAnimationFrame(() => {
      const next = fields[index + 1] ?? fields[index - 1];
      if (next) rowEls.current.get(next.id)?.focus();
    });
  }

  function moveBy(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= fields.length) return;
    move(index, to);
    setAnnounce(`Moved to position ${to + 1} of ${fields.length}.`);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = fields.findIndex((f) => f.id === active.id);
    const to = fields.findIndex((f) => f.id === over.id);
    if (from === -1 || to === -1) return;
    move(from, to);
    setAnnounce(`Moved to position ${to + 1} of ${fields.length}.`);
  }

  const countLabel =
    typeof max === "number"
      ? `${fields.length} of ${max}`
      : `${fields.length}`;

  return (
    <section
      aria-label={label}
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-base font-semibold">{label}</h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              atMax
                ? "bg-[var(--status-warning)]/15 text-[var(--status-warning)]"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {countLabel}
          </span>
          {errorCount > 0 && (
            <button
              type="button"
              onClick={() => {
                const firstErr = fields.findIndex((_f, i) => rowHasError(i));
                if (firstErr >= 0) {
                  setCollapsed((c) => ({ ...c, [fields[firstErr].id]: false }));
                  rowEls.current.get(fields[firstErr].id)?.scrollIntoView({ block: "center" });
                }
              }}
              className="text-xs font-medium text-destructive underline-offset-2 hover:underline"
            >
              {errorCount} row{errorCount === 1 ? "" : "s"} need attention
            </button>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={atMax}
          title={atMax ? `Maximum of ${max} reached.` : undefined}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> {addBtnLabel}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-[10px] border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          <span>
            No {itemNoun}s yet. {emptyHint ?? "Add the first one."}
          </span>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="flex flex-col gap-2">
              {fields.map((field, index) => {
                const errored = rowHasError(index);
                const isCollapsed =
                  collapsible && !errored && (collapsed[field.id] ?? defaultCollapsed);
                return (
                  <SortableRow
                    key={field.id}
                    id={field.id}
                    index={index}
                    total={fields.length}
                    variant={variant}
                    collapsible={collapsible}
                    collapsed={isCollapsed}
                    errored={errored}
                    summary={summary(values[index] ?? {}, index)}
                    registerEl={(el) => {
                      if (el) rowEls.current.set(field.id, el);
                      else rowEls.current.delete(field.id);
                    }}
                    onToggleCollapse={() =>
                      setCollapsed((c) => ({ ...c, [field.id]: !c[field.id] }))
                    }
                    onMoveUp={() => moveBy(index, -1)}
                    onMoveDown={() => moveBy(index, +1)}
                    onRemove={() => handleRemove(index)}
                  >
                    {renderRow({ index, fieldId: field.id })}
                  </SortableRow>
                );
              })}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      {fields.length > 4 && !atMax && (
        <Button type="button" size="sm" variant="ghost" onClick={handleAdd} className="gap-1 self-start">
          <Plus className="h-4 w-4" /> {addBtnLabel}
        </Button>
      )}

      <div className="sr-only" role="status" aria-live="polite">
        {announce}
      </div>
    </section>
  );
}

function SortableRow({
  id,
  index,
  total,
  variant,
  collapsible,
  collapsed,
  errored,
  summary,
  children,
  registerEl,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  id: string;
  index: number;
  total: number;
  variant: RepeatableGroupProps["variant"];
  collapsible: boolean;
  collapsed: boolean;
  errored: boolean;
  summary: React.ReactNode;
  children: React.ReactNode;
  registerEl: (el: HTMLLIElement | null) => void;
  onToggleCollapse: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const readOnlyOrder = variant === "picker-backed";

  return (
    <li
      ref={(el) => {
        setNodeRef(el);
        registerEl(el);
      }}
      tabIndex={-1}
      aria-label={`${index + 1} of ${total}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-[10px] border bg-card shadow-sm outline-none",
        errored ? "border-destructive" : "border-border",
        isDragging && "z-10 opacity-80 shadow-md",
      )}
    >
      <div className="flex items-start gap-2 p-2">
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <button
            type="button"
            className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
            aria-label={`Reorder ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move up"
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move down"
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1 py-1">
          {collapsed ? (
            <div className="flex min-h-[1.75rem] items-center truncate text-sm">
              {summary || <span className="text-muted-foreground">Untitled</span>}
            </div>
          ) : (
            <div className="flex flex-col gap-3">{!readOnlyOrder ? children : summary}</div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {collapsible && !readOnlyOrder && (
            <button
              type="button"
              onClick={onToggleCollapse}
              disabled={errored}
              aria-label={collapsed ? "Expand row" : "Collapse row"}
              aria-expanded={!collapsed}
              className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove"
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
