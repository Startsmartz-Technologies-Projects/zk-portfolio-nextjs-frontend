"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";

import {
  createServiceAction,
  updateServiceAction,
  publishServiceAction,
  unpublishServiceAction,
  archiveServiceAction,
  deleteServiceAction,
  duplicateServiceAction,
  previewServiceAction,
  publishIssuesServiceAction,
} from "@/app/admin/services/actions";
import type { SeoDefaults } from "@/lib/seo/seo-meta";
import { Input } from "@/src/components/ui/input";
import { SeoSidebar } from "@/src/components/admin/seo/seo-sidebar";
import { RepeatableGroup } from "@/src/components/admin/repeatable/repeatable-group";
import {
  EditorScaffold,
  type GateIssue,
} from "@/src/components/admin/shared/editor-scaffold";
import { Field, MediaSlotField, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import { ogImageUrl } from "@/src/components/admin/shared/seo-form-fields";
import {
  serviceFormSchema,
  emptyForm,
  fromDetail,
  toServerInput,
  type ServiceFormValues,
} from "./service-form";
import type { ServiceDetail } from "./types";

type Tab =
  | "basics"
  | "overview"
  | "scope"
  | "process"
  | "benefits"
  | "machinery"
  | "faq"
  | "seo";

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "overview", label: "Overview" },
  { id: "scope", label: "Scope" },
  { id: "process", label: "Process" },
  { id: "benefits", label: "Benefits" },
  { id: "machinery", label: "Machinery" },
  { id: "faq", label: "FAQ" },
  { id: "seo", label: "SEO" },
] as const;

function mapIssue({ field, issue }: GateIssue): { message: string; tab: Tab } {
  switch (field) {
    case "title":
      return { message: "Title is required.", tab: "basics" };
    case "subtitle":
      return { message: "Subtitle is required to publish.", tab: "basics" };
    case "overview_title":
      return { message: "Overview title is required.", tab: "overview" };
    case "overview_lead":
      return { message: "Overview lead is required.", tab: "overview" };
    case "hero_image":
      return { message: "Add a hero image.", tab: "basics" };
    case "hero_image.alt":
      return { message: "Hero image needs alt text.", tab: "basics" };
    case "machine_image.alt":
      return { message: "Machine image needs alt text.", tab: "basics" };
    case "cta_image.alt":
      return { message: "CTA image needs alt text.", tab: "basics" };
    default:
      return { message: `${field}: ${issue}`, tab: "basics" };
  }
}

export interface ServiceEditorProps {
  initial: ServiceDetail | null;
  canViewAuditLog: boolean;
  seoDefaults: SeoDefaults;
  metadataBase: string;
}

export function ServiceEditor({ initial, canViewAuditLog, seoDefaults, metadataBase }: ServiceEditorProps) {
  return (
    <EditorScaffold<ServiceFormValues, ServiceDetail, ReturnType<typeof toServerInput>, Tab>
      initial={initial}
      noun="service"
      titleNoun="Services"
      basePath="/admin/services"
      liveUrlBase={metadataBase ? `${metadataBase.replace(/\/$/, "")}/service-details` : null}
      titleField="title"
      tabs={TABS as unknown as { id: Tab; label: string }[]}
      zodResolver={zodResolver(serviceFormSchema)}
      emptyForm={emptyForm}
      fromDetail={fromDetail}
      toServerInput={toServerInput}
      canViewAuditLog={canViewAuditLog}
      auditLogHref="/admin/audit"
      mapIssue={mapIssue}
      tabOfError={(errors) => {
        const map: Record<string, Tab> = {
          title: "basics",
          slug: "seo",
          scope: "scope",
          process: "process",
          benefits: "benefits",
          machine: "machinery",
          faq: "faq",
        };
        for (const k of Object.keys(errors)) if (map[k]) return map[k];
        return null;
      }}
      applyServerErrors={(form, e) => {
        const details = (e as { details?: { field?: string }[] })?.details;
        if (Array.isArray(details) && details.some((d) => d.field === "slug")) {
          form.setError("slug", { message: "That slug is taken — try another." });
        }
      }}
      actions={{
        create: (input) => createServiceAction(input) as Promise<ServiceDetail>,
        update: (id, input) => updateServiceAction(id, input) as Promise<ServiceDetail>,
        publish: (id) => publishServiceAction(id) as Promise<ServiceDetail>,
        unpublish: (id) => unpublishServiceAction(id) as Promise<ServiceDetail>,
        archive: (id) => archiveServiceAction(id) as Promise<ServiceDetail>,
        remove: (id) => deleteServiceAction(id),
        duplicate: (id) => duplicateServiceAction(id) as Promise<{ id: string }>,
        preview: (id) => previewServiceAction(id),
        loadIssues: (id) => publishIssuesServiceAction(id),
      }}
      renderTab={(tab, form) => <ServiceTab tab={tab} form={form} />}
      renderRail={(form) => (
        <SeoSidebar
          defaults={seoDefaults}
          record={{
            title: form.watch("title"),
            summary: form.watch("subtitle"),
            coverImageId: form.watch("hero")?.id ?? null,
          }}
          metadataBase={metadataBase}
          collectionPath="service-details"
          isPublished={initial?.content_status === "published"}
          initialOgImageUrl={initial ? ogImageUrl(initial.seo) : null}
        />
      )}
    />
  );
}

function ServiceTab({ tab, form }: { tab: Tab; form: UseFormReturn<ServiceFormValues> }) {
  const { register, formState } = form;
  const errors = formState.errors;

  if (tab === "basics") {
    return (
      <TabCard>
        <Field label="Title" htmlFor="title" error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>
        <Field label="Subtitle" htmlFor="subtitle" helper="Required to publish.">
          <Input id="subtitle" {...register("subtitle")} />
        </Field>
        <Field label="Icon" htmlFor="icon" helper="Icon key (e.g. 'fabrication').">
          <Input id="icon" {...register("icon")} />
        </Field>
        <MediaSlotField name="hero" label="Hero image" helper="Required to publish; needs alt text." />
        <MediaSlotField name="machineImage" label="Machine image" helper="Optional; alt text required if set." />
        <MediaSlotField name="ctaImage" label="CTA image" helper="Optional; falls back to the site default." />
        <RepeatableGroup
          name="meta"
          label="Meta facts"
          itemNoun="fact"
          newRow={() => ({ key: "", value: "" })}
          summary={(r) => (r.key as string) || "Untitled fact"}
          renderRow={({ index }) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Key" htmlFor={`meta.${index}.key`}>
                <Input id={`meta.${index}.key`} {...register(`meta.${index}.key` as const)} />
              </Field>
              <Field label="Value" htmlFor={`meta.${index}.value`}>
                <Input id={`meta.${index}.value`} {...register(`meta.${index}.value` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "overview") {
    return (
      <TabCard>
        <Field label="Overview title" htmlFor="overviewTitle" helper="Required to publish.">
          <Input id="overviewTitle" {...register("overviewTitle")} />
        </Field>
        <Field label="Overview lead" htmlFor="overviewLead" helper="Required to publish.">
          <Textarea id="overviewLead" rows={2} {...register("overviewLead")} />
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
        <RepeatableGroup
          name="overviewBullets"
          label="Overview key points"
          itemNoun="point"
          variant="scalar-list"
          newRow={() => ({ value: "" })}
          summary={(r) => (r.value as string) || "Empty point"}
          renderRow={({ index }) => (
            <Field label="Point" htmlFor={`overviewBullets.${index}.value`}>
              <Input id={`overviewBullets.${index}.value`} {...register(`overviewBullets.${index}.value` as const)} />
            </Field>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "scope") {
    return (
      <TabCard>
        <SectionHeads form={form} titleName="scopeTitle" leadName="scopeLead" />
        <RepeatableGroup
          name="scope"
          label="Scope items"
          itemNoun="scope item"
          newRow={() => ({ icon: "", title: "", body: "" })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => <IconTitleBody form={form} base={`scope.${index}`} />}
        />
      </TabCard>
    );
  }

  if (tab === "process") {
    return (
      <TabCard>
        <SectionHeads form={form} titleName="processTitle" leadName="processLead" />
        <RepeatableGroup
          name="process"
          label="Process steps"
          itemNoun="step"
          newRow={() => ({ tag: "", title: "", body: "" })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tag" htmlFor={`process.${index}.tag`}>
                  <Input id={`process.${index}.tag`} {...register(`process.${index}.tag` as const)} />
                </Field>
                <Field label="Title" htmlFor={`process.${index}.title`}>
                  <Input id={`process.${index}.title`} {...register(`process.${index}.title` as const)} />
                </Field>
              </div>
              <Field label="Body" htmlFor={`process.${index}.body`}>
                <Textarea id={`process.${index}.body`} rows={2} {...register(`process.${index}.body` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "benefits") {
    return (
      <TabCard>
        <SectionHeads form={form} titleName="benefitsTitle" leadName="benefitsLead" />
        <RepeatableGroup
          name="benefits"
          label="Benefits"
          itemNoun="benefit"
          newRow={() => ({ icon: "", title: "", body: "" })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => <IconTitleBody form={form} base={`benefits.${index}`} />}
        />
      </TabCard>
    );
  }

  if (tab === "machinery") {
    return (
      <TabCard>
        <SectionHeads form={form} titleName="capabilityTitle" leadName="capabilityLead" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Capability body title" htmlFor="capabilityBodyTitle">
            <Input id="capabilityBodyTitle" {...register("capabilityBodyTitle")} />
          </Field>
          <Field label="Capability body description" htmlFor="capabilityBodyDesc">
            <Input id="capabilityBodyDesc" {...register("capabilityBodyDesc")} />
          </Field>
        </div>
        <RepeatableGroup
          name="machine"
          label="Machinery"
          itemNoun="machine"
          newRow={() => ({ title: "", description: "" })}
          summary={(r) => (r.title as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3">
              <Field label="Title" htmlFor={`machine.${index}.title`}>
                <Input id={`machine.${index}.title`} {...register(`machine.${index}.title` as const)} />
              </Field>
              <Field label="Description" htmlFor={`machine.${index}.description`}>
                <Textarea id={`machine.${index}.description`} rows={2} {...register(`machine.${index}.description` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  if (tab === "faq") {
    return (
      <TabCard>
        <SectionHeads form={form} titleName="faqTitle" leadName="faqLead" />
        <RepeatableGroup
          name="faq"
          label="FAQ"
          itemNoun="question"
          newRow={() => ({ question: "", answer: "" })}
          summary={(r) => (r.question as string) || "Untitled"}
          renderRow={({ index }) => (
            <div className="grid gap-3">
              <Field label="Question" htmlFor={`faq.${index}.question`}>
                <Input id={`faq.${index}.question`} {...register(`faq.${index}.question` as const)} />
              </Field>
              <Field label="Answer" htmlFor={`faq.${index}.answer`}>
                <Textarea id={`faq.${index}.answer`} rows={2} {...register(`faq.${index}.answer` as const)} />
              </Field>
            </div>
          )}
        />
      </TabCard>
    );
  }

  // SEO tab — managed in the right rail (single home for slug + SEO).
  return (
    <TabCard>
      <p className="text-sm text-muted-foreground">
        SEO metadata and the page slug are managed in the{" "}
        <strong className="text-foreground">SEO panel</strong> on the right rail.
      </p>
    </TabCard>
  );
}

function SectionHeads({
  form,
  titleName,
  leadName,
}: {
  form: UseFormReturn<ServiceFormValues>;
  titleName: keyof ServiceFormValues & string;
  leadName: keyof ServiceFormValues & string;
}) {
  const { register } = form;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Section title" htmlFor={titleName}>
        <Input id={titleName} {...register(titleName)} />
      </Field>
      <Field label="Section lead" htmlFor={leadName}>
        <Input id={leadName} {...register(leadName)} />
      </Field>
    </div>
  );
}

function IconTitleBody({ form, base }: { form: UseFormReturn<ServiceFormValues>; base: string }) {
  const { register } = form;
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Icon" htmlFor={`${base}.icon`}>
          <Input id={`${base}.icon`} {...register(`${base}.icon` as never)} />
        </Field>
        <Field label="Title" htmlFor={`${base}.title`}>
          <Input id={`${base}.title`} {...register(`${base}.title` as never)} />
        </Field>
      </div>
      <Field label="Body" htmlFor={`${base}.body`}>
        <Textarea id={`${base}.body`} rows={2} {...register(`${base}.body` as never)} />
      </Field>
    </div>
  );
}
