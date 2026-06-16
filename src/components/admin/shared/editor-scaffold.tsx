"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { Loader2, Save } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useToast } from "@/src/components/ui/use-toast";
import { MediaPickerProvider } from "@/src/components/admin/media/media-picker-provider";
import {
  PublishAuditPanel,
  type ContentStatus,
} from "@/src/components/admin/publish-audit/publish-audit-panel";

export interface GateIssue {
  field: string;
  issue: string;
}

/** A record the scaffold can drive — the common lifecycle fields every module returns. */
export interface ScaffoldRecord {
  id: string;
  content_status?: ContentStatus;
  slug?: string;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  published_at?: Date | string | null;
  featured?: boolean;
}

export interface EditorTabDef<TTab extends string> {
  id: TTab;
  label: string;
}

export interface EditorActions<TInput, TDetail> {
  create: (input: TInput) => Promise<TDetail>;
  update: (id: string, input: TInput) => Promise<TDetail>;
  publish: (id: string) => Promise<TDetail>;
  unpublish: (id: string) => Promise<TDetail>;
  archive: (id: string) => Promise<TDetail>;
  remove: (id: string) => Promise<unknown>;
  duplicate?: (id: string) => Promise<{ id: string }>;
  preview?: (id: string) => Promise<{ preview_url: string }>;
  loadIssues?: (id: string) => Promise<GateIssue[]>;
}

export interface EditorScaffoldProps<
  TForm extends FieldValues,
  TDetail extends ScaffoldRecord,
  TInput,
  TTab extends string,
> {
  initial: TDetail | null;
  /** Noun for breadcrumbs/copy, e.g. "service". */
  noun: string;
  /** Plural-friendly title noun, e.g. "Services". */
  titleNoun: string;
  /** Base admin path, e.g. "/admin/services". */
  basePath: string;
  /** Public live-URL base, e.g. metadataBase + "/services". */
  liveUrlBase?: string | null;
  /** The field whose value is the record's display title (e.g. "title" or "name"). */
  titleField: keyof TForm & string;

  tabs: EditorTabDef<TTab>[];
  /** Render the panels for each tab id. */
  renderTab: (tab: TTab, form: UseFormReturn<TForm>) => React.ReactNode;
  /** Right-rail content under the publish panel (e.g. the SEO sidebar), or null. */
  renderRail?: (form: UseFormReturn<TForm>) => React.ReactNode;

  zodResolver: Resolver<TForm>;
  emptyForm: () => TForm;
  fromDetail: (d: TDetail) => TForm;
  toServerInput: (v: TForm) => TInput;
  actions: EditorActions<TInput, TDetail>;

  /** Map a server gate issue to a message + tab; default echoes the field. */
  mapIssue?: (issue: GateIssue) => { message: string; tab: TTab };
  /** First-error tab resolver for RHF validation failures. */
  tabOfError?: (errors: Record<string, unknown>) => TTab | null;

  canViewAuditLog?: boolean;
  auditLogHref?: string;
  /** Apply server ValidationError details to form fields (e.g. slug taken). */
  applyServerErrors?: (form: UseFormReturn<TForm>, e: unknown) => void;
}

export function EditorScaffold<
  TForm extends FieldValues,
  TDetail extends ScaffoldRecord,
  TInput,
  TTab extends string,
>(props: EditorScaffoldProps<TForm, TDetail, TInput, TTab>) {
  return (
    <MediaPickerProvider>
      <Inner {...props} />
    </MediaPickerProvider>
  );
}

function Inner<
  TForm extends FieldValues,
  TDetail extends ScaffoldRecord,
  TInput,
  TTab extends string,
>({
  initial,
  noun,
  titleNoun,
  basePath,
  liveUrlBase,
  titleField,
  tabs,
  renderTab,
  renderRail,
  zodResolver,
  emptyForm,
  fromDetail,
  toServerInput,
  actions,
  mapIssue,
  tabOfError,
  canViewAuditLog = false,
  auditLogHref,
  applyServerErrors,
}: EditorScaffoldProps<TForm, TDetail, TInput, TTab>) {
  const router = useRouter();
  const { toast } = useToast();

  const [record, setRecord] = React.useState<TDetail | null>(initial);
  const recordRef = React.useRef<TDetail | null>(initial);
  React.useEffect(() => {
    recordRef.current = record;
  }, [record]);

  const id = record?.id ?? null;
  const status: ContentStatus = record?.content_status ?? "draft";

  const form = useForm<TForm>({
    resolver: zodResolver,
    defaultValues: (initial ? fromDetail(initial) : emptyForm()) as DefaultValues<TForm>,
    mode: "onBlur",
  });

  const [tab, setTab] = React.useState<TTab>(tabs[0].id);
  const [saving, setSaving] = React.useState(false);
  const [issues, setIssues] = React.useState<GateIssue[]>([]);

  const refreshGate = React.useCallback(
    async (pid: string | null) => {
      if (!pid || !actions.loadIssues) return;
      try {
        setIssues(await actions.loadIssues(pid));
      } catch {
        /* non-blocking */
      }
    },
    [actions],
  );

  React.useEffect(() => {
    void refreshGate(id);
  }, [id, refreshGate]);

  async function save(values: TForm): Promise<TDetail | null> {
    setSaving(true);
    try {
      const input = toServerInput(values);
      const saved = id ? await actions.update(id, input) : await actions.create(input);
      setRecord(saved);
      recordRef.current = saved;
      form.reset(fromDetail(saved) as DefaultValues<TForm>);
      await refreshGate(saved.id);
      toast({ variant: "success", title: id ? "Saved." : "Draft saved." });
      if (!id) router.replace(`${basePath}/${saved.id}`);
      return saved;
    } catch (e) {
      applyServerErrors?.(form, e);
      toast({ variant: "destructive", title: "Couldn't save — check the highlighted fields." });
      return null;
    } finally {
      setSaving(false);
    }
  }

  const onSaveClick = form.handleSubmit(save, () => {
    const t = tabOfError?.(form.formState.errors as Record<string, unknown>);
    if (t) setTab(t);
  });

  async function onPublish() {
    if (!id) await onSaveClick();
    const pid = recordRef.current?.id ?? id;
    if (!pid) return;
    try {
      const saved = await actions.publish(pid);
      setRecord(saved);
      recordRef.current = saved;
      form.reset(fromDetail(saved) as DefaultValues<TForm>);
      setIssues([]);
    } catch (e) {
      const details = (e as { details?: GateIssue[] })?.details;
      if (Array.isArray(details)) {
        setIssues(details);
        toast({ variant: "destructive", title: "Fix the listed issues before publishing." });
      } else {
        toast({ variant: "destructive", title: "Couldn't publish — please try again." });
      }
      throw e;
    }
  }
  async function transition(fn: (id: string) => Promise<TDetail>) {
    if (!id) return;
    const saved = await fn(id);
    setRecord(saved);
    recordRef.current = saved;
    form.reset(fromDetail(saved) as DefaultValues<TForm>);
    await refreshGate(saved.id);
  }
  async function onDelete() {
    if (!id) return;
    await actions.remove(id);
    router.push(basePath);
  }
  async function onDuplicate() {
    if (!id || !actions.duplicate) return;
    const copy = await actions.duplicate(id);
    router.push(`${basePath}/${copy.id}`);
  }
  async function onPreview(): Promise<string> {
    if (!id || !actions.preview) throw new Error("Save first.");
    return (await actions.preview(id)).preview_url;
  }

  const mapped = issues.map((i) => (mapIssue ? mapIssue(i) : { message: `${i.field}: ${i.issue}`, tab: tabs[0].id }));
  function onIssueClick(_m: string, i: number) {
    const t = mapped[i]?.tab;
    if (t) setTab(t);
  }

  const title = ((form.watch(titleField as never) as unknown as string) ?? "") || "";
  const liveUrl = status === "published" && record?.slug && liveUrlBase ? `${liveUrlBase}/${record.slug}` : null;

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href={basePath} className="hover:text-foreground hover:underline">{titleNoun}</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground">{id ? title || `Untitled ${noun}` : `New ${noun}`}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-semibold">{id ? title || `Untitled ${noun}` : `New ${noun}`}</h1>
              <Badge variant={status}>{status[0].toUpperCase() + status.slice(1)}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={basePath}>Cancel</Link>
            </Button>
            <Button onClick={onSaveClick} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className={cn("grid gap-6", renderRail ? "lg:grid-cols-[minmax(0,1fr)_22rem]" : "lg:grid-cols-[minmax(0,1fr)_20rem]")}>
          <div className="min-w-0">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TTab)}>
              <TabsList className="flex w-full flex-wrap">
                {tabs.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((t) => (
                <TabsContent key={t.id} value={t.id}>
                  {renderTab(t.id, form)}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <aside className="flex flex-col gap-4">
            <PublishAuditPanel
              status={status}
              publishedAt={record?.published_at ?? null}
              updatedAt={record?.updated_at ?? null}
              createdAt={record?.created_at ?? null}
              liveUrl={liveUrl}
              featured={record?.featured ?? false}
              itemNoun={noun}
              entityType={noun}
              entityId={id ?? undefined}
              canViewAuditLog={canViewAuditLog}
              auditLogHref={auditLogHref}
              allowDuplicate={!!id && !!actions.duplicate}
              allowDelete={!!id}
              publishIssues={mapped.map((m) => m.message)}
              onIssueClick={onIssueClick}
              onPublish={onPublish}
              onUnpublish={() => transition(actions.unpublish)}
              onArchive={() => transition(actions.archive)}
              onDelete={onDelete}
              onDuplicate={actions.duplicate ? onDuplicate : undefined}
              onPreview={id && actions.preview ? onPreview : undefined}
            />
            {renderRail?.(form)}
          </aside>
        </div>
      </div>
    </FormProvider>
  );
}
