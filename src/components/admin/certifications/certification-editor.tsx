"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type UseFormReturn } from "react-hook-form";

import {
  createCertificationAction,
  updateCertificationAction,
  publishCertificationAction,
  unpublishCertificationAction,
  archiveCertificationAction,
  deleteCertificationAction,
  duplicateCertificationAction,
  publishIssuesCertAction,
} from "@/app/admin/certifications/actions";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { TaxonomySelector } from "@/src/components/admin/taxonomy-selector/taxonomy-selector";
import { EditorScaffold, type GateIssue } from "@/src/components/admin/shared/editor-scaffold";
import { Field, MediaSlotField, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import {
  certFormSchema,
  emptyForm,
  fromDetail,
  toServerInput,
  type CertFormValues,
} from "./certification-form";
import { CERT_STATUSES, SEAL_SHAPES, TONES, type CertDetail } from "./types";

type Tab = "basics" | "document" | "presentation" | "home-seal";

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "document", label: "Document" },
  { id: "presentation", label: "Presentation" },
  { id: "home-seal", label: "Home seal" },
] as const;

function mapIssue({ field, issue }: GateIssue): { message: string; tab: Tab } {
  switch (field) {
    case "title":
      return { message: "Title is required.", tab: "basics" };
    case "authority":
      return { message: "Authority is required to publish.", tab: "basics" };
    case "category":
      return { message: "Choose a category.", tab: "basics" };
    case "issued_date":
      return { message: "Set an issued date.", tab: "basics" };
    case "document.alt":
      return { message: "The document needs alt text.", tab: "document" };
    default:
      return { message: `${field}: ${issue}`, tab: "basics" };
  }
}

export interface CertificationEditorProps {
  initial: CertDetail | null;
  isAdmin: boolean;
  canViewAuditLog: boolean;
}

export function CertificationEditor({ initial, isAdmin, canViewAuditLog }: CertificationEditorProps) {
  return (
    <EditorScaffold<CertFormValues, CertDetail, ReturnType<typeof toServerInput>, Tab>
      initial={initial}
      noun="certification"
      titleNoun="Certifications"
      basePath="/admin/certifications"
      titleField="title"
      tabs={TABS as unknown as { id: Tab; label: string }[]}
      zodResolver={zodResolver(certFormSchema)}
      emptyForm={emptyForm}
      fromDetail={fromDetail}
      toServerInput={toServerInput}
      canViewAuditLog={canViewAuditLog}
      auditLogHref="/admin/audit"
      mapIssue={mapIssue}
      tabOfError={(errors) => {
        if (errors.title || errors.authority || errors.slug || errors.issuedDate || errors.expiryDate) return "basics";
        if (errors.sealLabel) return "home-seal";
        return null;
      }}
      applyServerErrors={(form, e) => {
        const details = (e as { details?: { field?: string }[] })?.details;
        if (Array.isArray(details) && details.some((d) => d.field === "slug")) {
          form.setError("slug", { message: "That slug is taken — try another." });
        }
      }}
      actions={{
        create: (input) => createCertificationAction(input) as Promise<CertDetail>,
        update: (id, input) => updateCertificationAction(id, input) as Promise<CertDetail>,
        publish: (id) => publishCertificationAction(id) as Promise<CertDetail>,
        unpublish: (id) => unpublishCertificationAction(id) as Promise<CertDetail>,
        archive: (id) => archiveCertificationAction(id) as Promise<CertDetail>,
        remove: (id) => deleteCertificationAction(id),
        duplicate: (id) => duplicateCertificationAction(id) as Promise<{ id: string }>,
        loadIssues: (id) => publishIssuesCertAction(id),
      }}
      renderTab={(tab, form) => <CertTab tab={tab} form={form} isAdmin={isAdmin} published={initial?.content_status === "published"} />}
    />
  );
}

function CertTab({
  tab,
  form,
  isAdmin,
  published,
}: {
  tab: Tab;
  form: UseFormReturn<CertFormValues>;
  isAdmin: boolean;
  published: boolean;
}) {
  const { register, control, watch, setValue, formState } = form;
  const errors = formState.errors;

  if (tab === "basics") {
    return (
      <TabCard>
        <Field label="Title" htmlFor="title" error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>
        <Field label="Slug" htmlFor="slug" error={errors.slug?.message} helper="Used for the ?preview= deep-link. Auto-generated if left blank.">
          <Input id="slug" {...register("slug")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Authority" htmlFor="authority" helper="Required to publish.">
            <Input id="authority" {...register("authority")} />
          </Field>
          <Field label="Number" htmlFor="number">
            <Input id="number" {...register("number")} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <TaxonomySelector vocabularySlug="certifications-category" fieldNoun="category" value={field.value} onChange={field.onChange} canCreateTerm={isAdmin} />
              )}
            />
          </Field>
          <Field label="Certification status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CERT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Issued date" htmlFor="issuedDate" helper="Required to publish.">
            <Input id="issuedDate" type="date" {...register("issuedDate")} />
          </Field>
          <Field label="Expiry date" htmlFor="expiryDate" error={errors.expiryDate?.message}>
            <Input id="expiryDate" type="date" {...register("expiryDate")} />
          </Field>
        </div>
        <Field label="Description" htmlFor="description">
          <Textarea id="description" rows={3} {...register("description")} />
        </Field>
      </TabCard>
    );
  }

  if (tab === "document") {
    return (
      <TabCard>
        <MediaSlotField name="document" label="Certificate document" resourceType="document" helper="Optional PDF/scan. If set, it must have alt text before publishing." />
      </TabCard>
    );
  }

  if (tab === "presentation") {
    return (
      <TabCard>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tone">
            <Controller
              control={control}
              name="tone"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Seal shape">
            <Controller
              control={control}
              name="sealShape"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEAL_SHAPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
      </TabCard>
    );
  }

  // Home seal
  const showOnHome = watch("showOnHome");
  return (
    <TabCard>
      <div className="flex items-center gap-3">
        <Label htmlFor="showOnHome">Show on home</Label>
        <button
          id="showOnHome"
          type="button"
          role="switch"
          aria-checked={showOnHome}
          disabled={!published}
          onClick={() => setValue("showOnHome", !showOnHome, { shouldDirty: true })}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${showOnHome ? "bg-primary" : "bg-input"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${showOnHome ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
        <span className="text-[12px] text-muted-foreground">
          {published ? "Adds this certification to the home seals strip." : "Publish the certification first to feature it on the home page."}
        </span>
      </div>
      {showOnHome && (
        <>
          <Field label="Seal label" htmlFor="sealLabel" error={errors.sealLabel?.message} helper="Required when shown on home.">
            <Input id="sealLabel" {...register("sealLabel")} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Seal ID" htmlFor="sealId">
              <Input id="sealId" {...register("sealId")} />
            </Field>
            <Field label="Seal validity" htmlFor="sealValidity">
              <Input id="sealValidity" {...register("sealValidity")} />
            </Field>
          </div>
        </>
      )}
      <p className="text-[12px] text-muted-foreground">
        Order the home seals on the{" "}
        <Link href="/admin/certifications/home-seals" className="text-foreground underline underline-offset-2">
          Home seals manager
        </Link>
        .
      </p>
    </TabCard>
  );
}
