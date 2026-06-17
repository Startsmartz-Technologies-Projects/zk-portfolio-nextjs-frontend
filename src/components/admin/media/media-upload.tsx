"use client";

import * as React from "react";
import { Loader2, UploadCloud } from "lucide-react";

import {
  signUploadAction,
  registerAction,
} from "@/app/admin/media/actions";
import {
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_DOCUMENT_FORMATS,
  MAX_IMAGE_BYTES,
  MAX_DOCUMENT_BYTES,
} from "@/lib/validation/media";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import type { MediaAssetView, ResourceType } from "./types";

const IMAGE_MSG = "Use PNG, JPG, WEBP, GIF or SVG up to 10 MB.";
const DOC_MSG = "Use PDF, DWG, XLS/XLSX, DOC/DOCX or CSV up to 25 MB.";

function extOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; pct: number; name: string }
  | { phase: "error"; message: string };

/** Direct-to-Cloudinary signed upload (FR-MEDIA-001/002), with progress; registers on success. */
export function MediaUpload({
  resourceType,
  onRegistered,
}: {
  resourceType: ResourceType;
  onRegistered: (asset: MediaAssetView) => void;
}) {
  const [state, setState] = React.useState<UploadState>({ phase: "idle" });
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const accept =
    resourceType === "image"
      ? ALLOWED_IMAGE_FORMATS.map((f) => `.${f}`).join(",")
      : ALLOWED_DOCUMENT_FORMATS.map((f) => `.${f}`).join(",");
  const typeMsg = resourceType === "image" ? IMAGE_MSG : DOC_MSG;
  const maxBytes = resourceType === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  const allowed: readonly string[] =
    resourceType === "image" ? ALLOWED_IMAGE_FORMATS : ALLOWED_DOCUMENT_FORMATS;

  async function uploadToCloudinary(
    file: File,
    payload: Awaited<ReturnType<typeof signUploadAction>>,
  ): Promise<Record<string, unknown>> {
    const endpoint = `https://api.cloudinary.com/v1_1/${payload.cloud_name}/${
      resourceType === "image" ? "image" : "raw"
    }/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", payload.api_key);
    form.append("timestamp", String(payload.timestamp));
    form.append("folder", payload.folder);
    form.append("signature", payload.signature);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setState({ phase: "uploading", pct: Math.round((e.loaded / e.total) * 100), name: file.name });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(`Cloudinary ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("network"));
      xhr.send(form);
    });
  }

  async function handleFile(file: File) {
    const ext = extOf(file.name);
    if (!allowed.includes(ext)) {
      setState({ phase: "error", message: typeMsg });
      return;
    }
    if (file.size > maxBytes) {
      setState({ phase: "error", message: typeMsg });
      return;
    }

    setState({ phase: "uploading", pct: 0, name: file.name });
    try {
      const payload = await signUploadAction({
        resource_type: resourceType,
        format: ext,
        bytes: file.size,
      });
      const result = await uploadToCloudinary(file, payload);
      const asset = await registerAction({
        public_id: String(result.public_id),
        url: String(result.secure_url ?? result.url),
        format: String(result.format ?? ext),
        bytes: Number(result.bytes ?? file.size),
        width: (result.width as number) ?? null,
        height: (result.height as number) ?? null,
        resource_type: resourceType,
        original_filename: (result.original_filename as string) ?? file.name,
      });
      setState({ phase: "idle" });
      onRegistered(asset as MediaAssetView);
    } catch {
      // Cloudinary not configured (dev), signature refused, or a network/outage error.
      setState({
        phase: "error",
        message: "Upload failed. Please try again. (Cloudinary must be configured.)",
      });
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
        className={cn(
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed p-6 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        {state.phase === "uploading" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium" aria-live="polite">
              Uploading… {state.pct}%
            </p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${state.pct}%` }} />
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag a file here, or click to browse.</p>
            <p className="text-[13px] text-muted-foreground">{typeMsg}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {state.phase === "error" && (
        <div role="alert" className="flex items-center justify-between gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive">
          <span>{state.message}</span>
          <Button size="sm" variant="outline" onClick={() => setState({ phase: "idle" })}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
