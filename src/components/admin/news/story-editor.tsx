"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";

import {
  createStoryAction,
  updateStoryAction,
  publishStoryAction,
  unpublishStoryAction,
  archiveStoryAction,
  deleteStoryAction,
  duplicateStoryAction,
  previewStoryAction,
  publishIssuesStoryAction,
} from "@/app/admin/news/actions";
import type { SeoDefaults } from "@/lib/seo/seo-meta";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { SeoSidebar } from "@/src/components/admin/seo/seo-sidebar";
import { TaxonomySelector } from "@/src/components/admin/taxonomy-selector/taxonomy-selector";
import { BlockEditor, type BlockEditorValue } from "@/src/components/admin/block-editor/block-editor";
import { RepeatableGroup } from "@/src/components/admin/repeatable/repeatable-group";
import { useMediaPicker } from "@/src/components/admin/media/media-picker-provider";
import { EditorScaffold, type GateIssue } from "@/src/components/admin/shared/editor-scaffold";
import { Field, MediaSlotField, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import { TagsInput } from "@/src/components/admin/shared/tags-input";
import { Thumb } from "@/src/components/admin/shared/list-primitives";
import { ogImageUrl } from "@/src/components/admin/shared/seo-form-fields";
import {
  storyFormSchema,
  emptyForm,
  fromDetail,
  toServerInput,
  type StoryFormValues,
} from "./story-form";
import type { StoryDetail } from "./types";

type Tab = "basics" | "body" | "gallery" | "seo";

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "body", label: "Body" },
  { id: "gallery", label: "Gallery" },
  { id: "seo", label: "SEO" },
] as const;

function mapIssue({ field, issue }: GateIssue): { message: string; tab: Tab } {
  if (field.startsWith("gallery")) return { message: "Every gallery image needs alt text.", tab: "gallery" };
  if (field.startsWith("body")) return { message: "Body needs a lead + at least one block (with alt text on images).", tab: "body" };
  switch (field) {
    case "title":
      return { message: "Title is required.", tab: "basics" };
    case "excerpt":
      return { message: "Excerpt is required to publish.", tab: "basics" };
    case "category":
      return { message: "Choose a category.", tab: "basics" };
    case "article_date":
      return { message: "Set an article date.", tab: "basics" };
    case "cover_image":
      return { message: "Add a cover image.", tab: "basics" };
    case "cover_image.alt":
      return { message: "Cover image needs alt text.", tab: "basics" };
    default:
      return { message: `${field}: ${issue}`, tab: "basics" };
  }
}

export interface StoryEditorProps {
  initial: StoryDetail | null;
  isAdmin: boolean;
  canViewAuditLog: boolean;
  seoDefaults: SeoDefaults;
  metadataBase: string;
}

export function StoryEditor({ initial, isAdmin, canViewAuditLog, seoDefaults, metadataBase }: StoryEditorProps) {
  return (
    <EditorScaffold<StoryFormValues, StoryDetail, ReturnType<typeof toServerInput>, Tab>
      initial={initial}
      noun="story"
      titleNoun="News"
      basePath="/admin/news"
      liveUrlBase={metadataBase ? `${metadataBase.replace(/\/$/, "")}/news` : null}
      titleField="title"
      tabs={TABS as unknown as { id: Tab; label: string }[]}
      zodResolver={zodResolver(storyFormSchema)}
      emptyForm={emptyForm}
      fromDetail={fromDetail}
      toServerInput={toServerInput}
      canViewAuditLog={canViewAuditLog}
      auditLogHref="/admin/audit"
      mapIssue={mapIssue}
      tabOfError={(errors) => {
        if (errors.title || errors.excerpt) return "basics";
        if (errors.slug) return "seo";
        if (errors.block) return "body";
        if (errors.gallery) return "gallery";
        return null;
      }}
      applyServerErrors={(form, e) => {
        const details = (e as { details?: { field?: string }[] })?.details;
        if (Array.isArray(details) && details.some((d) => d.field === "slug")) {
          form.setError("slug", { message: "That slug is taken — try another." });
        }
      }}
      actions={{
        create: (input) => createStoryAction(input) as Promise<StoryDetail>,
        update: (id, input) => updateStoryAction(id, input) as Promise<StoryDetail>,
        publish: (id) => publishStoryAction(id) as Promise<StoryDetail>,
        unpublish: (id) => unpublishStoryAction(id) as Promise<StoryDetail>,
        archive: (id) => archiveStoryAction(id) as Promise<StoryDetail>,
        remove: (id) => deleteStoryAction(id),
        duplicate: (id) => duplicateStoryAction(id) as Promise<{ id: string }>,
        preview: (id) => previewStoryAction(id),
        loadIssues: (id) => publishIssuesStoryAction(id),
      }}
      renderTab={(tab, form) => <StoryTab tab={tab} form={form} isAdmin={isAdmin} />}
      renderRail={(form) => (
        <SeoSidebar
          defaults={seoDefaults}
          record={{
            title: form.watch("title"),
            summary: form.watch("excerpt"),
            coverImageId: form.watch("cover")?.id ?? null,
          }}
          metadataBase={metadataBase}
          collectionPath="news"
          isPublished={initial?.content_status === "published"}
          initialOgImageUrl={initial ? ogImageUrl(initial.seo) : null}
        />
      )}
    />
  );
}

function StoryTab({ tab, form, isAdmin }: { tab: Tab; form: UseFormReturn<StoryFormValues>; isAdmin: boolean }) {
  const { register, control, watch, setValue, formState } = form;
  const pick = useMediaPicker();
  const errors = formState.errors;

  if (tab === "basics") {
    return (
      <TabCard>
        <Field label="Title" htmlFor="title" error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>
        <Field label="Excerpt" htmlFor="excerpt" error={errors.excerpt?.message} helper="Required to publish.">
          <Textarea id="excerpt" rows={3} {...register("excerpt")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <TaxonomySelector vocabularySlug="news-category" fieldNoun="category" value={field.value} onChange={field.onChange} canCreateTerm={isAdmin} />
              )}
            />
          </Field>
          <Field label="Article date" htmlFor="articleDate" helper="Required to publish.">
            <Input id="articleDate" type="date" {...register("articleDate")} />
          </Field>
        </div>
        <Field label="Tags">
          <Controller control={control} name="tags" render={({ field }) => <TagsInput value={field.value} onChange={field.onChange} />} />
        </Field>
        <MediaSlotField name="cover" label="Cover image" helper="Required to publish; needs alt text." />
        <div className="flex items-center gap-3 border-t border-border pt-3">
          <Label htmlFor="featured">Featured</Label>
          <button
            id="featured"
            type="button"
            role="switch"
            aria-checked={watch("featured")}
            onClick={() => setValue("featured", !watch("featured"), { shouldDirty: true })}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${watch("featured") ? "bg-primary" : "bg-input"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${watch("featured") ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className="text-[12px] text-muted-foreground">Featured stories surface on the home + listing strips (published only).</span>
        </div>
      </TabCard>
    );
  }

  if (tab === "body") {
    return (
      <TabCard>
        <Controller
          control={control}
          name="block"
          render={({ field }) => <BlockEditor mode="news" value={field.value as BlockEditorValue} onChange={field.onChange} />}
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
          max={20}
          onAddExternal={async (remaining) => {
            const r = await pick({ resourceType: "image", multiple: true, title: "Add gallery images" });
            if (!r) return null;
            return r.slice(0, remaining).map((m) => ({ media_id: m.id, url: m.url, caption: "" }));
          }}
          summary={(row) => (
            <span className="flex items-center gap-2">
              <Thumb media={row.url ? { id: String(row.media_id), url: String(row.url), alt: null, width: null, height: null } : null} alt="" className="h-8 w-12" />
              <span className="truncate">{(row.caption as string) || "No caption"}</span>
            </span>
          )}
          renderRow={({ index }) => <GalleryRow index={index} control={control} register={register} />}
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

function GalleryRow({
  index,
  control,
  register,
}: {
  index: number;
  control: UseFormReturn<StoryFormValues>["control"];
  register: UseFormReturn<StoryFormValues>["register"];
}) {
  const url = useWatch({ control, name: `gallery.${index}.url` as const });
  return (
    <div className="flex items-start gap-3">
      <Thumb media={url ? { id: "g", url: String(url), alt: null, width: null, height: null } : null} alt="" className="h-16 w-24" />
      <div className="flex-1">
        <Field label="Caption" htmlFor={`gallery.${index}.caption`}>
          <Input id={`gallery.${index}.caption`} {...register(`gallery.${index}.caption` as const)} />
        </Field>
      </div>
    </div>
  );
}
