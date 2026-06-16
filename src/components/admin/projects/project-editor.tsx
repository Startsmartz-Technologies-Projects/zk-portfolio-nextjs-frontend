"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FormProvider,
  useForm,
  useFieldArray,
  useFormContext,
  useWatch,
  Controller,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Save, Star, X } from "lucide-react";

import {
  createProjectAction,
  updateProjectAction,
  publishProjectAction,
  unpublishProjectAction,
  archiveProjectAction,
  deleteProjectAction,
  duplicateProjectAction,
  previewProjectAction,
  publishIssuesAction,
} from "@/app/admin/projects/actions";
import type { SeoDefaults } from "@/lib/seo/seo-meta";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useToast } from "@/src/components/ui/use-toast";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import {
  MediaPickerProvider,
  useMediaPicker,
} from "@/src/components/admin/media/media-picker-provider";
import { SeoSidebar } from "@/src/components/admin/seo/seo-sidebar";
import { PublishAuditPanel } from "@/src/components/admin/publish-audit/publish-audit-panel";
import { RepeatableGroup } from "@/src/components/admin/repeatable/repeatable-group";
import { TaxonomySelector } from "@/src/components/admin/taxonomy-selector/taxonomy-selector";
import { CoverThumb } from "./cover-thumb";
import { RelatedPicker } from "./related-picker";
import {
  projectFormSchema,
  emptyForm,
  fromDetail,
  toServerInput,
  type ProjectFormValues,
} from "./project-form-schema";
import { mapGateIssue, type EditorTab, type GateIssue } from "./publish-gate";
import {
  BADGE_STYLES,
  CLIENT_TYPES,
  DELIVERY_STATUSES,
  type ContentStatus,
  type ProjectDetail,
} from "./types";

const TABS: { id: EditorTab; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "overview", label: "Overview" },
  { id: "scopes", label: "Scopes" },
  { id: "highlights", label: "Highlights" },
  { id: "gallery", label: "Gallery" },
  { id: "case-study", label: "Case study" },
  { id: "related", label: "Related" },
  { id: "seo", label: "SEO" },
];

export interface ProjectEditorProps {
  /** The loaded record (edit) or null (new). */
  initial: ProjectDetail | null;
  isAdmin: boolean;
  canViewAuditLog: boolean;
  seoDefaults: SeoDefaults;
  metadataBase: string;
}

export function ProjectEditor(props: ProjectEditorProps) {
  return (
    <MediaPickerProvider>
      <ProjectEditorInner {...props} />
    </MediaPickerProvider>
  );
}

function ProjectEditorInner({
  initial,
  isAdmin,
  canViewAuditLog,
  seoDefaults,
  metadataBase,
}: ProjectEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const pick = useMediaPicker();

  // Identity + lifecycle state (the record evolves across save/publish).
  const [record, setRecord] = React.useState<ProjectDetail | null>(initial);
  const id = record?.id ?? null;
  const status: ContentStatus = record?.content_status ?? "draft";

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initial ? fromDetail(initial) : emptyForm(),
    mode: "onBlur",
  });

  const [tab, setTab] = React.useState<EditorTab>("basics");
  const [saving, setSaving] = React.useState(false);
  const [publishIssues, setPublishIssues] = React.useState<GateIssue[]>([]);

  // Load the publish gate for a saved record so the panel disables Publish proactively.
  const refreshGate = React.useCallback(async (pid: string | null) => {
    if (!pid) return;
    try {
      setPublishIssues(await publishIssuesAction(pid));
    } catch {
      /* non-blocking: the publish action re-checks authoritatively */
    }
  }, []);

  React.useEffect(() => {
    void refreshGate(id);
  }, [id, refreshGate]);

  // ── Save (create or update) ───────────────────────────────────────────────
  async function save(values: ProjectFormValues): Promise<ProjectDetail | null> {
    setSaving(true);
    try {
      const input = toServerInput(values);
      let saved: ProjectDetail;
      if (id) {
        saved = (await updateProjectAction(id, input)) as ProjectDetail;
      } else {
        saved = (await createProjectAction(input)) as ProjectDetail;
      }
      setRecord(saved);
      recordRef.current = saved; // keep the ref fresh for onPublish in the same tick
      form.reset(fromDetail(saved));
      await refreshGate(saved.id);
      toast({ variant: "success", title: id ? "Saved." : "Draft saved." });
      // For a brand-new record, move to its canonical URL so refresh/preview work.
      if (!id) router.replace(`/admin/projects/${saved.id}`);
      return saved;
    } catch (e) {
      applyServerErrors(e);
      toast({ variant: "destructive", title: "Couldn't save — check the highlighted fields." });
      return null;
    } finally {
      setSaving(false);
    }
  }

  function applyServerErrors(e: unknown) {
    // ValidationError carries zod issues in `details`; map common ones to fields.
    const details = (e as { details?: { path?: (string | number)[]; field?: string; message?: string }[] })?.details;
    if (!Array.isArray(details)) return;
    for (const d of details) {
      const key = d.field ?? (Array.isArray(d.path) ? d.path[0] : undefined);
      if (key === "slug") form.setError("slug", { message: "That slug is taken — try another." });
    }
  }

  const onSaveClick = form.handleSubmit(save, () => {
    // RHF validation failed; jump to the tab with the first error.
    const firstTab = tabOfFirstError(form.formState.errors);
    if (firstTab) setTab(firstTab);
  });

  // ── Publish lifecycle (delegated to the panel) ────────────────────────────
  // Keep a ref so onPublish can read the freshest id right after an auto-save.
  const recordRef = React.useRef<ProjectDetail | null>(record);
  React.useEffect(() => {
    recordRef.current = record;
  }, [record]);

  async function onPublish() {
    if (!id) {
      await onSaveClick();
    }
    const pid = recordRef.current?.id ?? id;
    if (!pid) return;
    try {
      const saved = (await publishProjectAction(pid)) as ProjectDetail;
      setRecord(saved);
      form.reset(fromDetail(saved));
      setPublishIssues([]);
    } catch (e) {
      // PublishValidationError → surface the gate issues in the panel.
      const details = (e as { details?: GateIssue[] })?.details;
      if (Array.isArray(details)) {
        setPublishIssues(details);
        toast({ variant: "destructive", title: "Fix the listed issues before publishing." });
      } else {
        toast({ variant: "destructive", title: "Couldn't publish — please try again." });
      }
      throw e; // let the panel reset its busy state
    }
  }

  async function onUnpublish() {
    if (!id) return;
    const saved = (await unpublishProjectAction(id)) as ProjectDetail;
    setRecord(saved);
    form.reset(fromDetail(saved));
    await refreshGate(saved.id);
  }
  async function onArchive() {
    if (!id) return;
    const saved = (await archiveProjectAction(id)) as ProjectDetail;
    setRecord(saved);
    form.reset(fromDetail(saved));
  }
  async function onDelete() {
    if (!id) return;
    await deleteProjectAction(id);
    router.push("/admin/projects");
  }
  async function onDuplicate() {
    if (!id) return;
    const copy = (await duplicateProjectAction(id)) as ProjectDetail;
    router.push(`/admin/projects/${copy.id}`);
  }
  async function onPreview(): Promise<string> {
    const pid = id;
    if (!pid) throw new Error("Save the project first.");
    const { preview_url } = await previewProjectAction(pid);
    return preview_url;
  }

  // ── Gate issue list for the panel (clickable → tab focus) ─────────────────
  const mappedIssues = publishIssues.map(mapGateIssue);
  function onIssueClick(_issue: string, i: number) {
    const target = mappedIssues[i]?.tab;
    if (target) setTab(target);
  }

  const title = form.watch("title");
  const liveUrl =
    status === "published" && record
      ? `${metadataBase.replace(/\/$/, "")}/projects/${record.slug}`
      : null;

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/admin/projects" className="hover:text-foreground hover:underline">
                Projects
              </Link>
              <span aria-hidden>›</span>
              <span className="text-foreground">{id ? title || "Untitled project" : "New project"}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-semibold">
                {id ? title || "Untitled project" : "New project"}
              </h1>
              <Badge variant={status}>{status[0].toUpperCase() + status.slice(1)}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/projects">Cancel</Link>
            </Button>
            <Button onClick={onSaveClick} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Main column — tabbed form */}
          <div className="min-w-0">
            <Tabs value={tab} onValueChange={(v) => setTab(v as EditorTab)}>
              <TabsList className="flex w-full flex-wrap">
                {TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="basics">
                <BasicsTab pick={pick} isAdmin={isAdmin} />
              </TabsContent>
              <TabsContent value="overview">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="scopes">
                <ScopesTab />
              </TabsContent>
              <TabsContent value="highlights">
                <HighlightsTab />
              </TabsContent>
              <TabsContent value="gallery">
                <GalleryTab pick={pick} />
              </TabsContent>
              <TabsContent value="case-study">
                <CaseStudyTab />
              </TabsContent>
              <TabsContent value="related">
                <RelatedTab currentId={id} />
              </TabsContent>
              <TabsContent value="seo">
                <TabCard>
                  <p className="text-sm text-muted-foreground">
                    SEO metadata and the page slug are managed in the{" "}
                    <strong className="text-foreground">SEO panel</strong> on the right rail
                    (single home for the slug, per the editor conventions). The live search +
                    social previews update there as you edit the title, summary, and cover.
                  </p>
                </TabCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right rail */}
          <aside className="flex flex-col gap-4">
            <PublishAuditPanel
              status={status}
              publishedAt={record?.published_at ?? null}
              updatedAt={record?.updated_at ?? null}
              createdAt={record?.created_at ?? null}
              liveUrl={liveUrl}
              featured={record?.featured ?? false}
              itemNoun="project"
              entityType="project"
              entityId={id ?? undefined}
              canViewAuditLog={canViewAuditLog}
              auditLogHref="/admin/audit"
              allowDuplicate={!!id}
              allowDelete={!!id}
              publishIssues={mappedIssues.map((m) => m.message)}
              onIssueClick={onIssueClick}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onArchive={onArchive}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onPreview={id ? onPreview : undefined}
            />
            {/* SEO is also in the rail (slug lives here per spec §5/§14). */}
            <SeoSidebar
              defaults={seoDefaults}
              record={{ title, summary: form.watch("summary"), coverImageId: form.watch("cover")?.id ?? null }}
              metadataBase={metadataBase}
              collectionPath="projects"
              isPublished={status === "published"}
              initialOgImageUrl={record?.seo.og_image && "url" in record.seo.og_image ? record.seo.og_image.url : null}
            />
          </aside>
        </div>
      </div>
    </FormProvider>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

type Pick = ReturnType<typeof useMediaPicker>;

function Field({
  label,
  htmlFor,
  error,
  helper,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {helper && !error && <p className="text-[12px] text-muted-foreground">{helper}</p>}
      {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

function TabCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex flex-col gap-5 rounded-[10px] border border-border bg-card p-5 shadow-sm">
      {children}
    </div>
  );
}

function BasicsTab({ pick, isAdmin }: { pick: Pick; isAdmin: boolean }) {
  const { register, control, watch, setValue, formState } = useFormReturn();
  const errors = formState.errors;
  const cover = watch("cover");

  async function pickCover() {
    const r = await pick({ resourceType: "image", title: "Choose a cover image" });
    if (r && r[0]) setValue("cover", { id: r[0].id, url: r[0].url }, { shouldDirty: true });
  }

  return (
    <TabCard>
      <Field label="Title" htmlFor="title" error={errors.title?.message as string}>
        <Input id="title" {...register("title")} />
      </Field>

      <Field label="Summary" htmlFor="summary" error={errors.summary?.message as string} helper="Shown on cards + as the SEO fallback. ≤280 characters.">
        <textarea
          id="summary"
          rows={3}
          {...register("summary")}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <TaxonomySelector
                vocabularySlug="projects-category"
                fieldNoun="category"
                value={field.value}
                onChange={field.onChange}
                canCreateTerm={isAdmin}
              />
            )}
          />
        </Field>
        <Field label="Location">
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <TaxonomySelector
                vocabularySlug="location"
                fieldNoun="location"
                value={field.value}
                onChange={field.onChange}
                canCreateTerm={isAdmin}
              />
            )}
          />
        </Field>
      </div>

      <Field label="Location detail" htmlFor="locationDetail" helper="Free text, e.g. a district or site name (Bangla allowed).">
        <Input id="locationDetail" {...register("locationDetail")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Client type">
          <Controller
            control={control}
            name="clientType"
            render={({ field }) => (
              <Select value={field.value ?? "__none"} onValueChange={(v) => field.onChange(v === "__none" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Not set</SelectItem>
                  {CLIENT_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Delivery status">
          <Controller
            control={control}
            name="deliveryStatus"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_STATUSES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Start date" htmlFor="startDate">
          <Input id="startDate" type="date" {...register("startDate")} />
        </Field>
        <Field label="End date" htmlFor="endDate" error={errors.endDate?.message as string} helper="Required for completed projects.">
          <Input id="endDate" type="date" {...register("endDate")} />
        </Field>
      </div>

      <Field label="Cover image" helper="Used on the card + as the SEO image fallback. Needs alt text to publish.">
        <div className="flex items-center gap-3">
          <CoverThumb cover={cover ? { id: cover.id, url: cover.url ?? "", alt: null, width: null, height: null } : null} alt="" className="h-16 w-24" />
          <Button type="button" variant="outline" size="sm" onClick={pickCover} className="gap-1">
            <ImageIcon className="h-4 w-4" /> {cover ? "Replace" : "Choose image"}
          </Button>
          {cover && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setValue("cover", null, { shouldDirty: true })} aria-label="Remove cover">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Badge text" htmlFor="badgeText" helper="Optional label shown on the card.">
          <Input id="badgeText" {...register("badgeText")} />
        </Field>
        <Field label="Badge style">
          <Controller
            control={control}
            name="badgeStyle"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGE_STYLES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <FeaturedNote />
    </TabCard>
  );
}

function FeaturedNote() {
  // Featured is curated on a dedicated screen (BR-3); it's read-only here (spec §5).
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground">
      <Star className="h-4 w-4" />
      <span>Manage the featured set on the </span>
      <Link href="/admin/projects/featured" className="text-foreground underline underline-offset-2">
        Featured page
      </Link>
      <span>.</span>
    </div>
  );
}

function OverviewTab() {
  const { register } = useFormReturn();
  return (
    <TabCard>
      <Field label="Overview title" htmlFor="overviewTitle">
        <Input id="overviewTitle" {...register("overviewTitle")} />
      </Field>
      <Field label="Overview body" htmlFor="overviewBody">
        <textarea
          id="overviewBody"
          rows={5}
          {...register("overviewBody")}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Pull quote" htmlFor="pullQuote">
          <Input id="pullQuote" {...register("pullQuote")} />
        </Field>
        <Field label="Client name" htmlFor="client">
          <Input id="client" {...register("client")} />
        </Field>
      </div>
    </TabCard>
  );
}

function ScopesTab() {
  const { register } = useFormReturn();
  return (
    <TabCard>
      <Field label="Scopes intro" htmlFor="scopeDescription">
        <textarea
          id="scopeDescription"
          rows={2}
          {...register("scopeDescription")}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
      <RepeatableGroup
        name="scopes"
        label="Scopes"
        itemNoun="scope"
        newRow={() => ({ icon: "default", value: "", title: "", description: "" })}
        summary={(row) => (row.title as string) || "Untitled scope"}
        renderRow={({ index }) => <ScopeRow index={index} />}
      />
    </TabCard>
  );
}

function ScopeRow({ index }: { index: number }) {
  const { register } = useFormReturn();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Title" htmlFor={`scopes.${index}.title`}>
        <Input id={`scopes.${index}.title`} {...register(`scopes.${index}.title` as const)} />
      </Field>
      <Field label="Icon" htmlFor={`scopes.${index}.icon`} helper="Icon key (e.g. 'bridge').">
        <Input id={`scopes.${index}.icon`} {...register(`scopes.${index}.icon` as const)} />
      </Field>
      <Field label="Value" htmlFor={`scopes.${index}.value`} helper="Optional metric, e.g. '49 m'.">
        <Input id={`scopes.${index}.value`} {...register(`scopes.${index}.value` as const)} />
      </Field>
      <Field label="Description" htmlFor={`scopes.${index}.description`}>
        <Input id={`scopes.${index}.description`} {...register(`scopes.${index}.description` as const)} />
      </Field>
    </div>
  );
}

function HighlightsTab() {
  const { register } = useFormReturn();
  return (
    <TabCard>
      <Field label="Highlights intro" htmlFor="highlightsDescription">
        <textarea
          id="highlightsDescription"
          rows={2}
          {...register("highlightsDescription")}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
      <RepeatableGroup
        name="highlights"
        label="Highlights"
        itemNoun="highlight"
        newRow={() => ({ number: "", unit: "", title: "", body: "" })}
        summary={(row) => (row.title as string) || "Untitled highlight"}
        renderRow={({ index }) => <HighlightRow index={index} />}
      />
    </TabCard>
  );
}

function HighlightRow({ index }: { index: number }) {
  const { register } = useFormReturn();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Title" htmlFor={`highlights.${index}.title`}>
        <Input id={`highlights.${index}.title`} {...register(`highlights.${index}.title` as const)} />
      </Field>
      <Field label="Number" htmlFor={`highlights.${index}.number`}>
        <Input id={`highlights.${index}.number`} {...register(`highlights.${index}.number` as const)} />
      </Field>
      <Field label="Unit" htmlFor={`highlights.${index}.unit`}>
        <Input id={`highlights.${index}.unit`} {...register(`highlights.${index}.unit` as const)} />
      </Field>
      <Field label="Body" htmlFor={`highlights.${index}.body`}>
        <Input id={`highlights.${index}.body`} {...register(`highlights.${index}.body` as const)} />
      </Field>
    </div>
  );
}

function GalleryTab({ pick }: { pick: Pick }) {
  const { register, control } = useFormReturn();
  return (
    <TabCard>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Gallery heading" htmlFor="galleryHeading">
          <Input id="galleryHeading" {...register("galleryHeading")} />
        </Field>
        <Field label="Gallery description" htmlFor="galleryDescription">
          <Input id="galleryDescription" {...register("galleryDescription")} />
        </Field>
      </div>
      <RepeatableGroup
        name="gallery"
        label="Images"
        itemNoun="image"
        variant="media-backed"
        max={30}
        onAddExternal={async (remaining) => {
          const r = await pick({ resourceType: "image", multiple: true, title: "Add gallery images" });
          if (!r) return null;
          return r.slice(0, remaining).map((m) => ({ media_id: m.id, url: m.url, caption: "" }));
        }}
        summary={(row) => (
          <span className="flex items-center gap-2">
            <CoverThumb cover={row.url ? { id: String(row.media_id), url: String(row.url), alt: null, width: null, height: null } : null} alt="" className="h-8 w-12" />
            <span className="truncate">{(row.caption as string) || "No caption"}</span>
          </span>
        )}
        renderRow={({ index }) => <GalleryRow index={index} control={control} register={register} />}
      />
    </TabCard>
  );
}

function GalleryRow({
  index,
  control,
  register,
}: {
  index: number;
  control: ReturnType<typeof useFormReturn>["control"];
  register: ReturnType<typeof useFormReturn>["register"];
}) {
  const url = useWatchField(control, `gallery.${index}.url`);
  return (
    <div className="flex items-start gap-3">
      <CoverThumb cover={url ? { id: "g", url: String(url), alt: null, width: null, height: null } : null} alt="" className="h-16 w-24" />
      <div className="flex-1">
        <Field label="Caption" htmlFor={`gallery.${index}.caption`}>
          <Input id={`gallery.${index}.caption`} {...register(`gallery.${index}.caption` as const)} />
        </Field>
      </div>
    </div>
  );
}

function CaseStudyTab() {
  const { register } = useFormReturn();
  return (
    <TabCard>
      <Field label="Challenge" htmlFor="caseStudyChallenge">
        <textarea id="caseStudyChallenge" rows={3} {...register("caseStudyChallenge")} className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </Field>
      <Field label="Approach" htmlFor="caseStudyApproach">
        <textarea id="caseStudyApproach" rows={3} {...register("caseStudyApproach")} className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </Field>
      <Field label="Result" htmlFor="caseStudyResult">
        <textarea id="caseStudyResult" rows={3} {...register("caseStudyResult")} className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </Field>
      <Field label="CTA heading" htmlFor="ctaHeading">
        <Input id="ctaHeading" {...register("ctaHeading")} />
      </Field>
      <RepeatableGroup
        name="servicesDelivered"
        label="Services delivered"
        itemNoun="service"
        variant="scalar-list"
        newRow={() => ({ value: "" })}
        summary={(row) => (row.value as string) || "—"}
        renderRow={({ index }) => <ServiceRow index={index} />}
      />
    </TabCard>
  );
}

function ServiceRow({ index }: { index: number }) {
  const { register } = useFormReturn();
  return (
    <Field label="Service" htmlFor={`servicesDelivered.${index}.value`}>
      <Input id={`servicesDelivered.${index}.value`} {...register(`servicesDelivered.${index}.value` as const)} />
    </Field>
  );
}

function RelatedTab({ currentId }: { currentId: string | null }) {
  const { control } = useFormReturn();
  const { fields, append, remove, move } = useFieldArray({ control, name: "related" });
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const values = useWatchField(control, "related") as { id: string; title: string; published: boolean }[] | undefined;
  const list = values ?? [];
  const remaining = 3 - fields.length;

  return (
    <TabCard>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold">Related projects</h3>
          <p className="text-[12px] text-muted-foreground">Up to 3 other published projects, in order.</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={remaining <= 0} onClick={() => setPickerOpen(true)}>
          Add project
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          No related projects yet. Pick up to 3 other published projects.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {fields.map((f, i) => (
            <li key={f.id} className="flex items-center gap-2 rounded-[10px] border border-border bg-card p-2 shadow-sm">
              <span className="text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{list[i]?.title ?? "Project"}</span>
              <Button type="button" variant="ghost" size="sm" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">
                ↑
              </Button>
              <Button type="button" variant="ghost" size="sm" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down">
                ↓
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(i)} aria-label="Remove">
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ol>
      )}

      <RelatedPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={[...(currentId ? [currentId] : []), ...list.map((r) => r.id)]}
        remaining={remaining}
        onConfirm={(picks) => picks.forEach((p) => append(p))}
      />
    </TabCard>
  );
}

// ── RHF helpers (typed access to the form context) ────────────────────────────

function useFormReturn() {
  return useFormContext<ProjectFormValues>();
}

function useWatchField(control: Control<ProjectFormValues>, name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useWatch({ control, name: name as any });
}

function tabOfFirstError(errors: Record<string, unknown>): EditorTab | null {
  const map: Record<string, EditorTab> = {
    title: "basics",
    summary: "basics",
    endDate: "basics",
    slug: "seo",
    scopes: "scopes",
    highlights: "highlights",
    gallery: "gallery",
    servicesDelivered: "case-study",
    related: "related",
  };
  for (const key of Object.keys(errors)) {
    if (map[key]) return map[key];
  }
  return null;
}
