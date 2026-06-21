"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";

import {
  createConcernAction,
  updateConcernAction,
  publishConcernAction,
  unpublishConcernAction,
  archiveConcernAction,
  deleteConcernAction,
  duplicateConcernAction,
  previewConcernAction,
  publishIssuesConcernAction,
} from "@/app/admin/concerns/actions";
import type { SeoDefaults } from "@/lib/seo/seo-meta";
import { Input } from "@/src/components/ui/input";
import { SeoSidebar } from "@/src/components/admin/seo/seo-sidebar";
import { RepeatableGroup } from "@/src/components/admin/repeatable/repeatable-group";
import { useMediaPicker } from "@/src/components/admin/media/media-picker-provider";
import { EditorScaffold, type GateIssue } from "@/src/components/admin/shared/editor-scaffold";
import { Field, MediaSlotField, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import { Thumb } from "@/src/components/admin/shared/list-primitives";
import { ogImageUrl } from "@/src/components/admin/shared/seo-form-fields";
import {
  concernFormSchema,
  emptyForm,
  fromDetail,
  toServerInput,
  type ConcernFormValues,
} from "./concern-form";
import type { ConcernDetail } from "./types";

type Tab = "identity" | "overview" | "facts" | "services" | "why" | "showcase" | "process" | "gallery" | "faq" | "seo";

const TABS = [
  { id: "identity", label: "Identity" },
  { id: "overview", label: "Overview" },
  { id: "facts", label: "Facts" },
  { id: "services", label: "Services" },
  { id: "why", label: "Why" },
  { id: "showcase", label: "Showcase" },
  { id: "process", label: "Process" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
  { id: "seo", label: "SEO" },
] as const;

function mapIssue({ field, issue }: GateIssue): { message: string; tab: Tab } {
  if (field.startsWith("showcase")) return { message: "Every showcase image needs alt text.", tab: "showcase" };
  if (field.startsWith("gallery")) return { message: "Every gallery image needs alt text.", tab: "gallery" };
  if (field.startsWith("overview_body")) return { message: "Add at least one overview paragraph.", tab: "overview" };
  switch (field) {
    case "name":
      return { message: "Name is required.", tab: "identity" };
    case "short":
      return { message: "Sector label is required to publish.", tab: "identity" };
    case "tagline":
      return { message: "Tagline is required to publish.", tab: "identity" };
    case "intro":
      return { message: "Intro is required to publish.", tab: "identity" };
    case "hero_image":
      return { message: "Add a hero image.", tab: "identity" };
    case "hero_image.alt":
      return { message: "Hero image needs alt text.", tab: "identity" };
    default:
      return { message: `${field}: ${issue}`, tab: "identity" };
  }
}

export interface ConcernEditorProps {
  initial: ConcernDetail | null;
  isAdmin: boolean;
  canViewAuditLog: boolean;
  seoDefaults: SeoDefaults;
  metadataBase: string;
}

export function ConcernEditor({ initial, isAdmin, canViewAuditLog, seoDefaults, metadataBase }: ConcernEditorProps) {
  return (
    <EditorScaffold<ConcernFormValues, ConcernDetail, ReturnType<typeof toServerInput>, Tab>
      initial={initial}
      noun="concern"
      titleNoun="Concerns"
      basePath="/admin/concerns"
      liveUrlBase={metadataBase ? `${metadataBase.replace(/\/$/, "")}/concern-detail` : null}
      titleField="name"
      tabs={TABS as unknown as { id: Tab; label: string }[]}
      zodResolver={zodResolver(concernFormSchema)}
      emptyForm={emptyForm}
      fromDetail={fromDetail}
      toServerInput={toServerInput}
      canViewAuditLog={canViewAuditLog}
      auditLogHref="/admin/audit"
      mapIssue={mapIssue}
      tabOfError={(errors) => {
        if (errors.name || errors.slug || errors.establishedYear) return "identity";
        if (errors.facts) return "facts";
        if (errors.services) return "services";
        if (errors.why) return "why";
        if (errors.showcase) return "showcase";
        if (errors.process) return "process";
        if (errors.faqs) return "faq";
        return null;
      }}
      applyServerErrors={(form, e) => {
        const details = (e as { details?: { field?: string }[] })?.details;
        if (Array.isArray(details) && details.some((d) => d.field === "slug")) {
          form.setError("slug", { message: "That slug is taken — try another." });
        }
      }}
      actions={{
        create: (input) => createConcernAction(input) as Promise<ConcernDetail>,
        update: (id, input) => updateConcernAction(id, input) as Promise<ConcernDetail>,
        publish: (id) => publishConcernAction(id) as Promise<ConcernDetail>,
        unpublish: (id) => unpublishConcernAction(id) as Promise<ConcernDetail>,
        archive: (id) => archiveConcernAction(id) as Promise<ConcernDetail>,
        remove: (id) => deleteConcernAction(id),
        duplicate: (id) => duplicateConcernAction(id) as Promise<{ id: string }>,
        preview: (id) => previewConcernAction(id),
        loadIssues: (id) => publishIssuesConcernAction(id),
      }}
      renderTab={(tab, form) => <ConcernTab tab={tab} form={form} />}
      renderRail={(form) => (
        <SeoSidebar
          defaults={seoDefaults}
          record={{
            title: form.watch("name"),
            summary: form.watch("tagline"),
            coverImageId: form.watch("hero")?.id ?? null,
          }}
          metadataBase={metadataBase}
          collectionPath="concern-detail"
          isPublished={initial?.content_status === "published"}
          initialOgImageUrl={initial ? ogImageUrl(initial.seo) : null}
        />
      )}
    />
  );
}

function ConcernTab({ tab, form }: { tab: Tab; form: UseFormReturn<ConcernFormValues> }) {
  const { register, control, formState } = form;
  const pick = useMediaPicker();
  const errors = formState.errors;

  if (tab === "identity") {
    return (
      <TabCard>
        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Sector label" htmlFor="short" helper="Required to publish.">
            <Input id="short" {...register("short")} />
          </Field>
          <Field label="Tagline" htmlFor="tagline" helper="Required to publish.">
            <Input id="tagline" {...register("tagline")} />
          </Field>
        </div>
        <Field label="Intro" htmlFor="intro" helper="Required to publish.">
          <Textarea id="intro" rows={3} {...register("intro")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Established year" htmlFor="establishedYear" error={errors.establishedYear?.message} helper="Shown as 'Est. YYYY'.">
            <Input id="establishedYear" inputMode="numeric" {...register("establishedYear")} />
          </Field>
          <Field label="Code" htmlFor="code" helper="e.g. ZCL / 01.">
            <Input id="code" {...register("code")} />
          </Field>
        </div>
        <MediaSlotField name="hero" label="Hero image" helper="Required to publish; needs alt text." />
      </TabCard>
    );
  }

  if (tab === "overview") {
    return (
      <TabCard>
        <Field label="Overview title" htmlFor="overviewTitle">
          <Input id="overviewTitle" {...register("overviewTitle")} />
        </Field>
        <RepeatableGroup
          name="overviewBody"
          label="Overview paragraphs"
          itemNoun="paragraph"
          variant="scalar-list"
          newRow={() => ({ value: "" })}
          summary={(r) => (r.value as string) || "Empty paragraph"}
          renderRow={({ index }) => (
            <Field label="Paragraph" htmlFor={`overviewBody.${index}.value`}>
              <Textarea id={`overviewBody.${index}.value`} rows={2} {...register(`overviewBody.${index}.value` as const)} />
            </Field>
          )}
        />
        <Field label="Mission statement" htmlFor="overviewMission" helper="Rendered as a blockquote.">
          <Textarea id="overviewMission" rows={2} {...register("overviewMission")} />
        </Field>
      </TabCard>
    );
  }

  if (tab === "facts") {
    return (
      <TabCard>
        <RepeatableGroup
          name="facts"
          label="Facts"
          itemNoun="fact"
          newRow={() => ({ big: "", label: "", sub: "" })}
          summary={(r) => (r.label as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Big" htmlFor={`facts.${index}.big`}>
                <Input id={`facts.${index}.big`} {...register(`facts.${index}.big` as const)} />
              </Field>
              <Field label="Label" htmlFor={`facts.${index}.label`}>
                <Input id={`facts.${index}.label`} {...register(`facts.${index}.label` as const)} />
              </Field>
              <Field label="Sub" htmlFor={`facts.${index}.sub`}>
                <Input id={`facts.${index}.sub`} {...register(`facts.${index}.sub` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "services") {
    return (
      <TabCard>
        <RepeatableGroup
          name="services"
          label="Services"
          itemNoun="service"
          newRow={() => ({ icon: "", title: "", copy: "" })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Icon" htmlFor={`services.${index}.icon`}>
                  <Input id={`services.${index}.icon`} {...register(`services.${index}.icon` as const)} />
                </Field>
                <Field label="Title" htmlFor={`services.${index}.title`}>
                  <Input id={`services.${index}.title`} {...register(`services.${index}.title` as const)} />
                </Field>
              </div>
              <Field label="Copy" htmlFor={`services.${index}.copy`}>
                <Textarea id={`services.${index}.copy`} rows={2} {...register(`services.${index}.copy` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "why") {
    return (
      <TabCard>
        <RepeatableGroup
          name="why"
          label="Why us"
          itemNoun="reason"
          newRow={() => ({ number: "", title: "", copy: "" })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Number" htmlFor={`why.${index}.number`}>
                  <Input id={`why.${index}.number`} {...register(`why.${index}.number` as const)} />
                </Field>
                <Field label="Title" htmlFor={`why.${index}.title`}>
                  <Input id={`why.${index}.title`} {...register(`why.${index}.title` as const)} />
                </Field>
              </div>
              <Field label="Copy" htmlFor={`why.${index}.copy`}>
                <Textarea id={`why.${index}.copy`} rows={2} {...register(`why.${index}.copy` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "showcase") {
    return (
      <TabCard>
        <RepeatableGroup
          name="showcase"
          label="Showcase projects"
          itemNoun="project"
          newRow={() => ({ title: "", location: "", category: "", summary: "", image: null })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => <ShowcaseRow index={index} form={form} pick={pick} />}
        />
      </TabCard>
    );
  }

  if (tab === "process") {
    return (
      <TabCard>
        <RepeatableGroup
          name="process"
          label="Process"
          itemNoun="step"
          newRow={() => ({ step: "", title: "", copy: "" })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Step" htmlFor={`process.${index}.step`}>
                  <Input id={`process.${index}.step`} {...register(`process.${index}.step` as const)} />
                </Field>
                <Field label="Title" htmlFor={`process.${index}.title`}>
                  <Input id={`process.${index}.title`} {...register(`process.${index}.title` as const)} />
                </Field>
              </div>
              <Field label="Copy" htmlFor={`process.${index}.copy`}>
                <Textarea id={`process.${index}.copy`} rows={2} {...register(`process.${index}.copy` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "gallery") {
    return (
      <TabCard>
        <RepeatableGroup
          name="gallery"
          label="Gallery"
          itemNoun="image"
          variant="media-backed"
          onAddExternal={async () => {
            const r = await pick({ resourceType: "image", multiple: true, title: "Add gallery images" });
            if (!r) return null;
            return r.map((m) => ({ media_id: m.id, url: m.url, caption: "" }));
          }}
          summary={(row) => (
            <span className="flex items-center gap-2">
              <Thumb media={row.url ? { id: String(row.media_id), url: String(row.url), alt: null, width: null, height: null } : null} alt="" className="h-8 w-12" />
            </span>
          )}
          renderRow={({ index }) => <GalleryRow index={index} form={form} />}
        />
      </TabCard>
    );
  }

  if (tab === "faq") {
    return (
      <TabCard>
        <RepeatableGroup
          name="faqs"
          label="FAQ"
          itemNoun="question"
          newRow={() => ({ question: "", answer: "" })}
          summary={(r) => (r.question as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3">
              <Field label="Question" htmlFor={`faqs.${index}.question`}>
                <Input id={`faqs.${index}.question`} {...register(`faqs.${index}.question` as const)} />
              </Field>
              <Field label="Answer" htmlFor={`faqs.${index}.answer`}>
                <Textarea id={`faqs.${index}.answer`} rows={2} {...register(`faqs.${index}.answer` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  return (
    <TabCard>
      <p className="text-sm text-muted-foreground">
        SEO metadata and the page slug are managed in the <strong className="text-foreground">SEO panel</strong> on the right rail.
      </p>
    </TabCard>
  );
}

function ShowcaseRow({
  index,
  form,
  pick,
}: {
  index: number;
  form: UseFormReturn<ConcernFormValues>;
  pick: ReturnType<typeof useMediaPicker>;
}) {
  const { register, control, setValue } = form;
  const image = useWatch({ control, name: `showcase.${index}.image` as const });
  const url = image && "url" in image ? image.url : null;
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" htmlFor={`showcase.${index}.title`}>
          <Input id={`showcase.${index}.title`} {...register(`showcase.${index}.title` as const)} />
        </Field>
        <Field label="Location" htmlFor={`showcase.${index}.location`}>
          <Input id={`showcase.${index}.location`} {...register(`showcase.${index}.location` as const)} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category" htmlFor={`showcase.${index}.category`} helper="Free text.">
          <Input id={`showcase.${index}.category`} {...register(`showcase.${index}.category` as const)} />
        </Field>
        <Field label="Summary" htmlFor={`showcase.${index}.summary`}>
          <Input id={`showcase.${index}.summary`} {...register(`showcase.${index}.summary` as const)} />
        </Field>
      </div>
      <Field label="Image">
        <div className="flex items-center gap-3">
          <Thumb media={url ? { id: "s", url, alt: null, width: null, height: null } : null} alt="" className="h-14 w-20" />
          <button
            type="button"
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary"
            onClick={async () => {
              const r = await pick({ resourceType: "image", title: "Choose showcase image" });
              if (r && r[0]) setValue(`showcase.${index}.image` as const, { id: r[0].id, url: r[0].url }, { shouldDirty: true });
            }}
          >
            {image ? "Replace" : "Choose"}
          </button>
        </div>
      </Field>
    </div>
  );
}

// Media-backed gallery: the public concern page renders only the image (the per-item caption
// was never shown on the frontend, so it's no longer editable here).
function GalleryRow({ index, form }: { index: number; form: UseFormReturn<ConcernFormValues> }) {
  const { control } = form;
  const url = useWatch({ control, name: `gallery.${index}.url` as const });
  return (
    <div className="flex items-start gap-3">
      <Thumb media={url ? { id: "g", url: String(url), alt: null, width: null, height: null } : null} alt="" className="h-16 w-24" />
    </div>
  );
}
