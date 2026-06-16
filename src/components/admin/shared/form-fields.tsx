"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { ImageIcon, X } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useMediaPicker } from "@/src/components/admin/media/media-picker-provider";
import { Thumb } from "./list-primitives";

// Shared form-field building blocks for the admin editors (Wave 2/3).

export function Field({
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

export function TabCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex flex-col gap-5 rounded-[10px] border border-border bg-card p-5 shadow-sm">
      {children}
    </div>
  );
}

export function Textarea({
  id,
  rows = 3,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id?: string }) {
  return (
    <textarea
      id={id}
      rows={rows}
      {...rest}
      className={cn(
        "rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        rest.className,
      )}
    />
  );
}

/**
 * A single media slot bound to a RHF field holding `{ id, url } | null`. Opens the
 * shared picker, shows a thumbnail, supports replace + clear. `resourceType` switches
 * image vs document mode (certifications use document).
 */
export function MediaSlotField({
  name,
  label,
  helper,
  resourceType = "image",
}: {
  name: string;
  label: string;
  helper?: string;
  resourceType?: "image" | "document";
}) {
  const { watch, setValue } = useFormContext();
  const pick = useMediaPicker();
  const value = watch(name) as { id: string; url: string | null } | null;

  async function choose() {
    const r = await pick({ resourceType, title: `Choose ${label.toLowerCase()}` });
    if (r && r[0]) setValue(name, { id: r[0].id, url: r[0].url }, { shouldDirty: true });
  }

  return (
    <Field label={label} helper={helper}>
      <div className="flex items-center gap-3">
        {resourceType === "image" ? (
          <Thumb
            media={value ? { id: value.id, url: value.url ?? "", alt: null, width: null, height: null } : null}
            alt=""
            className="h-16 w-24"
          />
        ) : (
          <span className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            {value ? "Document attached" : "No document"}
          </span>
        )}
        <Button type="button" variant="outline" size="sm" onClick={choose} className="gap-1">
          <ImageIcon className="h-4 w-4" /> {value ? "Replace" : "Choose"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setValue(name, null, { shouldDirty: true })}
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Field>
  );
}
