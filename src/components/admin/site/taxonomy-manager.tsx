"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { AlertTriangle, ExternalLink, GripVertical, Loader2, MoreHorizontal, Plus } from "lucide-react";

import {
  listTermsAction,
  termUsageAction,
  addTermAction,
  updateTermAction,
  reorderTermsAction,
  deleteTermAction,
  mergeTermAction,
} from "@/app/admin/taxonomies/actions";
import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Field } from "@/src/components/admin/shared/form-fields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useToast } from "@/src/components/ui/use-toast";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { cn } from "@/src/lib/utils";

export interface VocabInitial {
  slug: string;
  label: string;
  isShared: boolean;
  count: number;
}
interface TermRow {
  id: string;
  slug: string;
  label: string;
  position: number;
  isActive: boolean;
}

export interface TaxonomyManagerProps {
  vocabularies: VocabInitial[];
  initialVocab: string;
  canViewAuditLog: boolean;
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function TaxonomyManager({ vocabularies, initialVocab, canViewAuditLog }: TaxonomyManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const confirm = useConfirm();

  const known = new Set(vocabularies.map((v) => v.slug));
  const [slug, setSlug] = React.useState<string>(known.has(initialVocab) ? initialVocab : vocabularies[0]?.slug ?? "");
  const active = vocabularies.find((v) => v.slug === slug) ?? null;

  const [terms, setTerms] = React.useState<TermRow[] | null>(null);
  const [usage, setUsage] = React.useState<Record<string, number> | null>(null);
  const [loadError, setLoadError] = React.useState(false);
  const loadSeq = React.useRef(0);

  const loadTerms = React.useCallback(async (s: string) => {
    if (!s) return;
    const seq = ++loadSeq.current;
    setTerms(null);
    setUsage(null);
    setLoadError(false);
    try {
      const [t, u] = await Promise.all([listTermsAction(s, true), termUsageAction(s)]);
      if (seq !== loadSeq.current) return;
      setTerms(t.map((r) => ({ id: r.id, slug: r.slug, label: r.label, position: r.position, isActive: r.isActive })));
      setUsage(u);
    } catch {
      if (seq !== loadSeq.current) return;
      setLoadError(true);
    }
  }, []);

  React.useEffect(() => {
    loadTerms(slug);
  }, [slug, loadTerms]);

  function selectVocab(next: string) {
    setSlug(next);
    router.replace(`${pathname}?vocab=${next}`, { scroll: false });
  }

  // Dialog state.
  const [addOpen, setAddOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<TermRow | null>(null);
  const [mergeTarget, setMergeTarget] = React.useState<TermRow | null>(null);

  async function onAdd(label: string, termSlug: string): Promise<boolean> {
    try {
      await addTermAction(slug, { label, slug: termSlug || undefined });
      toast({ variant: "success", title: "Term added." });
      loadTerms(slug);
      return true;
    } catch {
      return false;
    }
  }

  async function onRename(termId: string, label: string, termSlug: string): Promise<boolean> {
    try {
      await updateTermAction(slug, termId, { label, slug: termSlug });
      toast({ variant: "success", title: "Term renamed." });
      loadTerms(slug);
      return true;
    } catch {
      return false;
    }
  }

  async function onToggleActive(term: TermRow) {
    try {
      await updateTermAction(slug, term.id, { isActive: !term.isActive });
      toast({ variant: "success", title: term.isActive ? "Term deactivated." : "Term reactivated." });
      loadTerms(slug);
    } catch {
      toast({ variant: "destructive", title: "Couldn't update the term." });
    }
  }

  async function onReorder(next: TermRow[]) {
    const prev = terms;
    setTerms(next);
    try {
      await reorderTermsAction(slug, { orderedIds: next.map((t) => t.id) });
      toast({ variant: "success", title: "Order saved." });
    } catch {
      setTerms(prev);
      toast({ variant: "destructive", title: "Couldn't save the order." });
    }
  }

  async function onDeleteClick(term: TermRow) {
    const used = usage?.[term.id] ?? 0;
    if (used > 0) {
      setMergeTarget(term);
      return;
    }
    const ok = await confirm({
      title: `Delete '${term.label}'?`,
      description: "This can't be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteTermAction(slug, term.id);
      toast({ variant: "success", title: "Term deleted." });
      loadTerms(slug);
    } catch {
      // Likely became referenced between load and delete — pivot to merge.
      toast({ variant: "destructive", title: "This term is now in use — merge or deactivate it." });
      setMergeTarget(term);
      loadTerms(slug);
    }
  }

  async function onMerge(termId: string, intoTermId: string): Promise<boolean> {
    try {
      const res = await mergeTermAction(slug, termId, intoTermId);
      toast({ variant: "success", title: `Terms merged — ${res.repointed} record(s) repointed.` });
      loadTerms(slug);
      return true;
    } catch {
      toast({ variant: "destructive", title: "Couldn't merge the terms." });
      return false;
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function onDragEnd(e: DragEndEvent) {
    const { active: a, over } = e;
    if (!over || a.id === over.id || !terms) return;
    const from = terms.findIndex((t) => t.id === a.id);
    const to = terms.findIndex((t) => t.id === over.id);
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(terms, from, to));
  }

  const displayCount = terms ? terms.length : active?.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Taxonomies"
        breadcrumbs={[{ label: "Site Settings", href: "/admin/site" }, { label: "Taxonomies" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Master — vocabulary list */}
        <nav aria-label="Vocabularies" className="flex flex-col gap-1">
          <h2 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vocabularies</h2>
          {vocabularies.map((v) => (
            <button
              key={v.slug}
              type="button"
              onClick={() => selectVocab(v.slug)}
              aria-current={v.slug === slug}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-sm",
                v.slug === slug ? "border-primary bg-secondary/60 ring-1 ring-primary" : "border-border hover:bg-secondary/50",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="font-medium">{v.label}</span>
                {v.isShared && <Badge variant="outline">Shared</Badge>}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{v.slug}</span>
            </button>
          ))}
        </nav>

        {/* Detail — term manager */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-semibold">{active?.label ?? "—"}</h2>
              <span className="text-sm text-muted-foreground tabular-nums">{displayCount} term{displayCount === 1 ? "" : "s"}</span>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)} disabled={!slug} className="gap-1">
              <Plus className="h-4 w-4" /> Add term
            </Button>
          </div>

          {loadError ? (
            <div className="flex flex-col items-start gap-2 rounded-[10px] border border-border bg-card p-5 text-sm">
              <span className="text-muted-foreground">Couldn&apos;t load terms.</span>
              <Button size="sm" variant="outline" onClick={() => loadTerms(slug)}>Retry</Button>
            </div>
          ) : terms === null ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-md border border-border bg-card/60" />
              ))}
            </div>
          ) : terms.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
              No terms in this vocabulary yet. Add the first one.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
              <SortableContext items={terms.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <ol className="flex flex-col gap-1.5">
                  {terms.map((t) => (
                    <TermRowItem
                      key={t.id}
                      term={t}
                      usage={usage?.[t.id] ?? null}
                      onRename={() => setRenameTarget(t)}
                      onToggleActive={() => onToggleActive(t)}
                      onDelete={() => onDeleteClick(t)}
                    />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
          )}

          {canViewAuditLog && (
            <Link href="/admin/audit" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline">
              <ExternalLink className="h-3.5 w-3.5" /> View audit log
            </Link>
          )}
        </section>
      </div>

      <TermDialog
        key={`add-${slug}`}
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        vocabLabel={active?.label ?? ""}
        onSubmit={onAdd}
      />
      {renameTarget && (
        <TermDialog
          key={`rename-${renameTarget.id}`}
          open
          onOpenChange={(o) => !o && setRenameTarget(null)}
          mode="rename"
          vocabLabel={active?.label ?? ""}
          initialLabel={renameTarget.label}
          initialSlug={renameTarget.slug}
          onSubmit={(label, s) => onRename(renameTarget.id, label, s)}
        />
      )}
      {mergeTarget && (
        <MergeDialog
          term={mergeTarget}
          usage={usage?.[mergeTarget.id] ?? 0}
          targets={(terms ?? []).filter((t) => t.isActive && t.id !== mergeTarget.id)}
          onOpenChange={(o) => !o && setMergeTarget(null)}
          onMerge={(intoId) => onMerge(mergeTarget.id, intoId)}
          onDeactivate={async () => {
            await onToggleActive(mergeTarget);
            setMergeTarget(null);
          }}
        />
      )}
    </div>
  );
}

function TermRowItem({
  term,
  usage,
  onRename,
  onToggleActive,
  onDelete,
}: {
  term: TermRow;
  usage: number | null;
  onRename: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: term.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-2 text-sm shadow-sm",
        isDragging ? "z-10 opacity-80 shadow-md" : "border-border",
        !term.isActive && "opacity-70",
      )}
    >
      <button type="button" className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing" aria-label={`Reorder ${term.label}`} {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <span className="line-clamp-1 font-medium">{term.label || term.slug}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{term.slug}</span>
      </div>
      {term.isActive ? (
        <Badge variant="published">Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      )}
      <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">
        {usage === null ? "…" : usage > 0 ? `${usage} in use` : "unused"}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" aria-label={`Actions for ${term.label}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
          <DropdownMenuItem onSelect={onToggleActive}>{term.isActive ? "Deactivate" : "Reactivate"}</DropdownMenuItem>
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            {usage && usage > 0 ? "Delete / merge…" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function TermDialog({
  open,
  onOpenChange,
  mode,
  vocabLabel,
  initialLabel = "",
  initialSlug = "",
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "rename";
  vocabLabel: string;
  initialLabel?: string;
  initialSlug?: string;
  onSubmit: (label: string, slug: string) => Promise<boolean>;
}) {
  const [label, setLabel] = React.useState(initialLabel);
  const [slug, setSlug] = React.useState(initialSlug);
  const [slugTouched, setSlugTouched] = React.useState(mode === "rename");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(label);
  const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(effectiveSlug);

  async function submit() {
    setError(null);
    if (!label.trim()) {
      setError("Enter a term name.");
      return;
    }
    if (!slugValid) {
      setError("Use lowercase letters, numbers, and hyphens.");
      return;
    }
    setBusy(true);
    const ok = await onSubmit(label.trim(), effectiveSlug);
    setBusy(false);
    if (ok) onOpenChange(false);
    else setError("Couldn't save — that slug may already be used in this vocabulary.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? `Add a term to ${vocabLabel}` : "Rename term"}</DialogTitle>
          <DialogDescription>Terms power the public filter dropdowns and record categorisation.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Field label="Term label" htmlFor="term-label" error={error && !label.trim() ? error : undefined}>
            <Input id="term-label" value={label} autoFocus onChange={(e) => setLabel(e.target.value)} />
          </Field>
          <Field label="Slug" htmlFor="term-slug" helper="Lowercase, hyphenated; unique within this vocabulary." error={error && label.trim() ? error : undefined}>
            <Input
              id="term-slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="gap-1.5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "add" ? (busy ? "Creating…" : "Create") : busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MergeDialog({
  term,
  usage,
  targets,
  onOpenChange,
  onMerge,
  onDeactivate,
}: {
  term: TermRow;
  usage: number;
  targets: TermRow[];
  onOpenChange: (open: boolean) => void;
  onMerge: (intoTermId: string) => Promise<boolean>;
  onDeactivate: () => Promise<void>;
}) {
  const [into, setInto] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function merge() {
    if (!into) {
      setError("Choose a term to merge into.");
      return;
    }
    setBusy(true);
    const ok = await onMerge(into);
    setBusy(false);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This term is in use</DialogTitle>
          <DialogDescription>
            &lsquo;{term.label}&rsquo; is used by {usage} published record{usage === 1 ? "" : "s"}, so it can&apos;t be deleted. Merge it
            into another term (all records move to it) or deactivate it (hide it from new selections).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {targets.length === 0 ? (
            <p className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 p-3 text-[13px] text-muted-foreground">
              <AlertTriangle className="h-4 w-4" /> No other active term to merge into — deactivate it instead.
            </p>
          ) : (
            <Field label="Merge into" htmlFor="merge-into" error={error ?? undefined}>
              <select
                id="merge-into"
                value={into}
                onChange={(e) => setInto(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Choose a term…</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                setBusy(true);
                await onDeactivate();
                setBusy(false);
              }}
              disabled={busy}
            >
              Deactivate instead
            </Button>
            <Button variant="destructive" onClick={merge} disabled={busy || targets.length === 0} className="gap-1.5">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Merge
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
