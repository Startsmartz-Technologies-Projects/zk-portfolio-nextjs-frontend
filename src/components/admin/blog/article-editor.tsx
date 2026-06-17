"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type UseFormReturn } from "react-hook-form";

import {
  createArticleAction,
  updateArticleAction,
  publishArticleAction,
  unpublishArticleAction,
  archiveArticleAction,
  deleteArticleAction,
  duplicateArticleAction,
  previewArticleAction,
  publishIssuesArticleAction,
} from "@/app/admin/blog/actions";
import type { SeoDefaults } from "@/lib/seo/seo-meta";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { SeoSidebar } from "@/src/components/admin/seo/seo-sidebar";
import { TaxonomySelector } from "@/src/components/admin/taxonomy-selector/taxonomy-selector";
import { BlockEditor, type BlockEditorValue } from "@/src/components/admin/block-editor/block-editor";
import { EditorScaffold, type GateIssue } from "@/src/components/admin/shared/editor-scaffold";
import { Field, MediaSlotField, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import { TagsInput } from "@/src/components/admin/shared/tags-input";
import { ogImageUrl } from "@/src/components/admin/shared/seo-form-fields";
import {
  articleFormSchema,
  emptyForm,
  fromDetail,
  toServerInput,
  type ArticleFormValues,
} from "./article-form";
import type { ArticleDetail } from "./types";

type Tab = "basics" | "body" | "author" | "seo";

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "body", label: "Body" },
  { id: "author", label: "Author" },
  { id: "seo", label: "SEO" },
] as const;

function mapIssue({ field, issue }: GateIssue): { message: string; tab: Tab } {
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

export interface ArticleEditorProps {
  initial: ArticleDetail | null;
  isAdmin: boolean;
  canViewAuditLog: boolean;
  seoDefaults: SeoDefaults;
  metadataBase: string;
}

export function ArticleEditor({ initial, isAdmin, canViewAuditLog, seoDefaults, metadataBase }: ArticleEditorProps) {
  return (
    <EditorScaffold<ArticleFormValues, ArticleDetail, ReturnType<typeof toServerInput>, Tab>
      initial={initial}
      noun="article"
      titleNoun="Blog"
      basePath="/admin/blog"
      liveUrlBase={metadataBase ? `${metadataBase.replace(/\/$/, "")}/blogs` : null}
      titleField="title"
      tabs={TABS as unknown as { id: Tab; label: string }[]}
      zodResolver={zodResolver(articleFormSchema)}
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
        return null;
      }}
      applyServerErrors={(form, e) => {
        const details = (e as { details?: { field?: string }[] })?.details;
        if (Array.isArray(details) && details.some((d) => d.field === "slug")) {
          form.setError("slug", { message: "That slug is taken — try another." });
        }
      }}
      actions={{
        create: (input) => createArticleAction(input) as Promise<ArticleDetail>,
        update: (id, input) => updateArticleAction(id, input) as Promise<ArticleDetail>,
        publish: (id) => publishArticleAction(id) as Promise<ArticleDetail>,
        unpublish: (id) => unpublishArticleAction(id) as Promise<ArticleDetail>,
        archive: (id) => archiveArticleAction(id) as Promise<ArticleDetail>,
        remove: (id) => deleteArticleAction(id),
        duplicate: (id) => duplicateArticleAction(id) as Promise<{ id: string }>,
        preview: (id) => previewArticleAction(id),
        loadIssues: (id) => publishIssuesArticleAction(id),
      }}
      renderTab={(tab, form) => <ArticleTab tab={tab} form={form} isAdmin={isAdmin} />}
      renderRail={(form) => (
        <SeoSidebar
          defaults={seoDefaults}
          record={{
            title: form.watch("title"),
            summary: form.watch("excerpt"),
            coverImageId: form.watch("cover")?.id ?? null,
          }}
          metadataBase={metadataBase}
          collectionPath="blogs"
          isPublished={initial?.content_status === "published"}
          initialOgImageUrl={initial ? ogImageUrl(initial.seo) : null}
        />
      )}
    />
  );
}

function ArticleTab({ tab, form, isAdmin }: { tab: Tab; form: UseFormReturn<ArticleFormValues>; isAdmin: boolean }) {
  const { register, control, watch, setValue, formState } = form;
  const errors = formState.errors;

  if (tab === "basics") {
    return (
      <TabCard>
        <Field label="Title" htmlFor="title" error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>
        <Field label="Excerpt" htmlFor="excerpt" error={errors.excerpt?.message} helper="Shown on cards + as the SEO fallback. Required to publish.">
          <Textarea id="excerpt" rows={3} {...register("excerpt")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <TaxonomySelector vocabularySlug="blog-category" fieldNoun="category" value={field.value} onChange={field.onChange} canCreateTerm={isAdmin} />
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
          <span className="text-[12px] text-muted-foreground">Featured articles surface on the home + listing strips (published only).</span>
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
          render={({ field }) => (
            <BlockEditor mode="blog" value={field.value as BlockEditorValue} onChange={field.onChange} />
          )}
        />
      </TabCard>
    );
  }

  if (tab === "author") {
    return (
      <TabCard>
        <p className="text-sm text-muted-foreground">Leave blank to use the site default author.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Author name" htmlFor="authorName">
            <Input id="authorName" {...register("authorName")} />
          </Field>
          <Field label="Author role" htmlFor="authorRole">
            <Input id="authorRole" {...register("authorRole")} />
          </Field>
        </div>
        <Field label="Author bio" htmlFor="authorBio">
          <Textarea id="authorBio" rows={3} {...register("authorBio")} />
        </Field>
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
