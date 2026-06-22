"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
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
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  updatePageAction,
  publishPageAction,
  unpublishPageAction,
  previewPageAction,
} from "@/app/admin/pages/actions";
import { PERMITTED_SECTION_TYPES } from "@/lib/pages/permitted-section-types";
import type { SeoDefaults } from "@/lib/seo/seo-meta";
import type { PageKey, SectionType } from "@prisma/client";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useToast } from "@/src/components/ui/use-toast";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { MediaPickerProvider } from "@/src/components/admin/media/media-picker-provider";
import { SeoSidebar } from "@/src/components/admin/seo/seo-sidebar";
import { PublishAuditPanel } from "@/src/components/admin/publish-audit/publish-audit-panel";
import { ogImageUrl, type SeoFormValues } from "@/src/components/admin/shared/seo-form-fields";
import { SectionEditor } from "./section-editor";
import { blankSection, seoFromPage, toUpdateInput } from "./page-form";
import { sectionLabel, type PageAdmin, type SectionAdmin } from "./types";

export interface PageEditorProps {
  initial: PageAdmin;
  canViewAuditLog: boolean;
  seoDefaults: SeoDefaults;
  metadataBase: string;
  /** Live stat-picker keys (computed metrics + CompanyStat keys from Site Settings). */
  statKeys: string[];
}

export function PageEditor(props: PageEditorProps) {
  return (
    <MediaPickerProvider>
      <Inner {...props} />
    </MediaPickerProvider>
  );
}

function Inner({ initial, canViewAuditLog, seoDefaults, metadataBase, statKeys }: PageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();

  const [page, setPage] = React.useState<PageAdmin>(initial);
  const [sections, setSections] = React.useState<SectionAdmin[]>(initial.sections);
  const [selectedId, setSelectedId] = React.useState<string | null>(initial.sections[0]?.id ?? null);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const status = page.content_status ?? "draft";
  const pageKey = page.key.replace(/-/g, "_") as PageKey;
  const permitted = PERMITTED_SECTION_TYPES[pageKey] ?? [];
  const presentTypes = new Set(sections.map((s) => s.type));

  // RHF holds only the SEO sub-form so the shared SeoSidebar (FormProvider-bound) works.
  const form = useForm<{ seo: SeoFormValues }>({ defaultValues: { seo: seoFromPage(initial) } });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function patchSections(next: SectionAdmin[]) {
    setSections(next);
    setDirty(true);
  }
  function updateSection(id: string, patch: Partial<SectionAdmin>) {
    patchSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((s) => s.id === active.id);
    const to = sections.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;
    patchSections(arrayMove(sections, from, to));
  }
  function addSection(type: SectionType) {
    const s = blankSection(type);
    patchSections([...sections, s]);
    setSelectedId(s.id);
  }
  async function removeSection(id: string) {
    const s = sections.find((x) => x.id === id);
    const ok = await confirm({
      title: "Remove this section?",
      description: `“${s ? sectionLabel(s.type) : "Section"}” will be removed when you save.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    patchSections(sections.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(sections.find((x) => x.id !== id)?.id ?? null);
  }

  async function save(): Promise<PageAdmin | null> {
    setSaving(true);
    try {
      const seo = form.getValues("seo");
      const saved = (await updatePageAction(page.key, toUpdateInput(sections, seo))) as PageAdmin;
      setPage(saved);
      setSections(saved.sections);
      form.reset({ seo: seoFromPage(saved) });
      setDirty(false);
      // Keep the selection if the section still exists, else select the first.
      setSelectedId((cur) => (saved.sections.some((s) => s.id === cur) ? cur : saved.sections[0]?.id ?? null));
      toast({ variant: "success", title: "Saved." });
      return saved;
    } catch {
      toast({ variant: "destructive", title: "Couldn't save the page." });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    // Persist pending edits first so publish validates the latest content. `dirty` only
    // tracks section edits; SEO lives in the RHF form, so check its dirty flag too —
    // otherwise SEO-only edits are silently dropped on publish.
    if (dirty || form.formState.isDirty) {
      const saved = await save();
      if (!saved) return;
    }
    try {
      const published = (await publishPageAction(page.key)) as PageAdmin;
      setPage(published);
      setSections(published.sections);
      form.reset({ seo: seoFromPage(published) });
      setDirty(false);
    } catch (e) {
      const details = (e as { details?: { section: string; field: string; issue: string }[] })?.details;
      if (Array.isArray(details) && details.length) {
        toast({ variant: "destructive", title: "Fix the publish issues first." });
        setPublishIssues(details.map((d) => `${sectionLabel(d.section)}: ${d.field} — ${d.issue}`));
      } else {
        toast({ variant: "destructive", title: "Couldn't publish the page." });
      }
      throw e;
    }
  }
  async function onUnpublish() {
    const updated = (await unpublishPageAction(page.key)) as PageAdmin;
    setPage(updated);
  }
  async function onPreview(): Promise<string> {
    const { preview_url } = await previewPageAction(page.key);
    return preview_url;
  }

  const [publishIssues, setPublishIssues] = React.useState<string[]>([]);

  const selected = sections.find((s) => s.id === selectedId) ?? null;

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/admin/pages" className="hover:text-foreground hover:underline">Pages</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground">{page.admin_title}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-semibold">{page.admin_title}</h1>
              <Badge variant={status}>{status[0].toUpperCase() + status.slice(1)}</Badge>
              <code className="text-xs text-muted-foreground">{page.path}</code>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/pages">Back</Link>
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
          {/* Left rail — section list */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sections</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[60vh] overflow-auto">
                  {permitted.map((t) => (
                    <DropdownMenuItem key={t} onSelect={() => addSection(t)}>
                      {sectionLabel(t)}
                      {presentTypes.has(t) && <span className="ml-auto text-[10px] text-muted-foreground">added</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {sections.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
                No sections yet. Add one from the permitted types.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <ol className="flex flex-col gap-1.5">
                    {sections.map((s) => (
                      <SectionRow
                        key={s.id}
                        section={s}
                        selected={s.id === selectedId}
                        onSelect={() => setSelectedId(s.id)}
                        onToggleVisible={() => updateSection(s.id, { is_visible: !s.is_visible })}
                        onRemove={() => removeSection(s.id)}
                      />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Center — selected section editor */}
          <div className="min-w-0">
            {selected ? (
              <SectionEditor
                key={selected.id}
                section={selected}
                pageKey={pageKey}
                statKeys={statKeys}
                onChange={(patch) => updateSection(selected.id, patch)}
              />
            ) : (
              <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
                Select a section to edit, or add one.
              </div>
            )}
          </div>

          {/* Right rail — publish + SEO */}
          <aside className="flex flex-col gap-4">
            <PublishAuditPanel
              status={status}
              publishedAt={page.published_at ?? null}
              updatedAt={page.updated_at ?? null}
              createdAt={page.created_at ?? null}
              liveUrl={status === "published" && metadataBase ? `${metadataBase.replace(/\/$/, "")}${page.path}` : null}
              itemNoun="page"
              entityType="page"
              entityId={page.id}
              canViewAuditLog={canViewAuditLog}
              auditLogHref="/admin/audit"
              allowDuplicate={false}
              allowDelete={false}
              publishIssues={publishIssues}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onPreview={onPreview}
            />
            <SeoSidebar
              defaults={seoDefaults}
              record={{ title: page.admin_title, summary: null, coverImageId: null }}
              metadataBase={metadataBase}
              pagesMode
              isPublished={status === "published"}
              initialOgImageUrl={ogImageUrl(page.seo)}
            />
          </aside>
        </div>
      </div>
    </FormProvider>
  );
}

function SectionRow({
  section,
  selected,
  onSelect,
  onToggleVisible,
  onRemove,
}: {
  section: SectionAdmin;
  selected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-md border bg-card p-1.5 text-sm shadow-sm",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
        isDragging && "z-10 opacity-80",
        !section.is_visible && "opacity-60",
      )}
    >
      <button type="button" className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing" aria-label="Reorder section" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <span className="line-clamp-1 font-medium">{sectionLabel(section.type)}</span>
        {(section.heading || section.eyebrow) && (
          <span className="line-clamp-1 text-xs text-muted-foreground">{section.heading || section.eyebrow}</span>
        )}
        {!section.is_visible && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Hidden</span>}
      </button>
      <button type="button" onClick={onToggleVisible} aria-label={section.is_visible ? "Hide section" : "Show section"} className="rounded p-1 text-muted-foreground hover:bg-secondary">
        {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove section" className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
