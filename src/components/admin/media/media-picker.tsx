"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  FileText,
  ImageOff,
  Search,
} from "lucide-react";

import {
  listMediaAction,
  getMediaAction,
  updateMetadataAction,
} from "@/app/admin/media/actions";
import type { UsageRef } from "@/lib/data/media";
import { cn } from "@/src/lib/utils";
import { formatDate } from "@/src/lib/format-date";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useToast } from "@/src/components/ui/use-toast";
import { MediaUpload } from "./media-upload";
import {
  humanBytes,
  toConfirmed,
  type ConfirmedMedia,
  type MediaAssetView,
  type ResourceType,
} from "./types";

const PAGE_SIZE = 20;

function thumb(url: string): string {
  return url.includes("/upload/")
    ? url.replace("/upload/", "/upload/c_fill,w_240,h_240,f_auto,q_auto/")
    : url;
}

export interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType?: ResourceType;
  multiple?: boolean;
  title?: string;
  onConfirm: (selected: ConfirmedMedia[]) => void;
}

export function MediaPicker({
  open,
  onOpenChange,
  resourceType,
  multiple = false,
  title,
  onConfirm,
}: MediaPickerProps) {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("library");
  const [q, setQ] = React.useState("");
  const [format, setFormat] = React.useState("");
  const [inUse, setInUse] = React.useState<"" | "yes" | "no">("");

  const [list, setList] = React.useState<MediaAssetView[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loadError, setLoadError] = React.useState(false);

  const [selected, setSelected] = React.useState<Map<string, MediaAssetView>>(new Map());
  const [detailId, setDetailId] = React.useState<string | null>(null);

  const headerTitle =
    title ?? (resourceType === "document" ? "Choose a file" : "Choose an image");

  const hasFilters = q !== "" || format !== "" || inUse !== "";

  const load = React.useCallback(async () => {
    setLoadError(false);
    setList(null);
    try {
      const res = await listMediaAction({
        ...(q ? { q } : {}),
        ...(resourceType ? { resourceType } : {}),
        ...(format ? { format } : {}),
        ...(inUse ? { inUse: inUse === "yes" } : {}),
        page,
        pageSize: PAGE_SIZE,
      });
      setList(res.data as MediaAssetView[]);
      setTotal(res.meta.total);
    } catch {
      setLoadError(true);
    }
  }, [q, resourceType, format, inUse, page]);

  // Reset when opened.
  React.useEffect(() => {
    if (open) {
      setTab("library");
      setSelected(new Map());
      setDetailId(null);
      setPage(1);
    }
  }, [open]);

  // Debounced load while open.
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [open, load]);

  function toggleSelect(asset: MediaAssetView) {
    setDetailId(asset.id);
    setSelected((prev) => {
      const next = new Map(multiple ? prev : []);
      if (next.has(asset.id)) next.delete(asset.id);
      else next.set(asset.id, asset);
      return next;
    });
  }

  function confirm() {
    onConfirm([...selected.values()].map(toConfirmed));
    onOpenChange(false);
  }

  function onUploaded(asset: MediaAssetView) {
    setTab("library");
    setSelected(new Map([[asset.id, asset]]));
    setDetailId(asset.id);
    void load();
    toast({ variant: "success", title: "Uploaded." });
  }

  function patchLocal(id: string, patch: Partial<MediaAssetView>) {
    setList((prev) => prev?.map((a) => (a.id === id ? { ...a, ...patch } : a)) ?? prev);
    setSelected((prev) => {
      const cur = prev.get(id);
      if (!cur) return prev;
      const next = new Map(prev);
      next.set(id, { ...cur, ...patch });
      return next;
    });
  }

  const altMissingSelected = [...selected.values()].some(
    (a) => a.resource_type === "image" && !a.alt_present,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-h-[700px] max-w-4xl flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle>{headerTitle}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3">
            <TabsList>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="mt-0 flex min-h-0 flex-1 flex-col">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              <div className="relative min-w-[12rem] flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                  }}
                  placeholder="Search by name, alt text or tag…"
                  className="pl-8"
                />
              </div>
              <Input
                value={format}
                onChange={(e) => {
                  setPage(1);
                  setFormat(e.target.value.trim().toLowerCase());
                }}
                placeholder="Format (jpg, pdf…)"
                className="w-32"
              />
              <select
                value={inUse}
                onChange={(e) => {
                  setPage(1);
                  setInUse(e.target.value as "" | "yes" | "no");
                }}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                aria-label="In use filter"
              >
                <option value="">Any usage</option>
                <option value="yes">In use</option>
                <option value="no">Unused</option>
              </select>
            </div>

            <div className="flex min-h-0 flex-1">
              {/* Grid */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                {loadError ? (
                  <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <AlertCircle className="h-6 w-6 text-[var(--status-danger)]" />
                    <p className="text-sm text-muted-foreground">Couldn&apos;t load media.</p>
                    <Button variant="outline" size="sm" onClick={load}>
                      Retry
                    </Button>
                  </div>
                ) : list === null ? (
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square w-full rounded-md" />
                    ))}
                  </div>
                ) : list.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      {hasFilters ? "No assets match your search." : "No media yet. Upload your first file."}
                    </p>
                    {hasFilters ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQ("");
                          setFormat("");
                          setInUse("");
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setTab("upload")}>
                        Upload
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {list.map((asset) => (
                      <MediaCard
                        key={asset.id}
                        asset={asset}
                        selected={selected.has(asset.id)}
                        onSelect={() => toggleSelect(asset)}
                      />
                    ))}
                  </div>
                )}
                {list && total > PAGE_SIZE && (
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <span className="text-muted-foreground tabular-nums">
                      Page {page} of {Math.ceil(total / PAGE_SIZE)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= Math.ceil(total / PAGE_SIZE)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              {/* Detail */}
              {detailId && (
                <DetailPanel
                  key={detailId}
                  id={detailId}
                  onPatched={(patch) => patchLocal(detailId, patch)}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-0 min-h-0 flex-1 overflow-y-auto">
            <MediaUpload
              resourceType={resourceType ?? "image"}
              onRegistered={onUploaded}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-4">
          <div className="text-[13px] text-muted-foreground">
            {altMissingSelected ? (
              <span className="flex items-center gap-1.5 text-[var(--status-warning)]">
                <AlertCircle className="h-4 w-4" />
                This image needs alt text before it can be published.
              </span>
            ) : (
              <span>{selected.size} selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={selected.size === 0} onClick={confirm}>
              Use selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MediaCard({
  asset,
  selected,
  onSelect,
}: {
  asset: MediaAssetView;
  selected: boolean;
  onSelect: () => void;
}) {
  const isImage = asset.resource_type === "image";
  const [broken, setBroken] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border bg-card text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-muted-foreground",
      )}
    >
      <div className="flex aspect-square items-center justify-center bg-secondary/40">
        {isImage && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb(asset.url)}
            alt={asset.alt_text ?? ""}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : isImage ? (
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        ) : (
          <FileText className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex items-center justify-between gap-1 p-2">
        <span className="truncate text-xs" title={asset.title ?? asset.original_filename ?? ""}>
          {asset.title || asset.original_filename || "Untitled"}
        </span>
        <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
          {asset.format}
        </Badge>
      </div>
      {isImage && !asset.alt_present && (
        <span
          className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded bg-[var(--status-warning)] px-1.5 py-0.5 text-[10px] font-medium text-white"
          title="Missing alt text"
        >
          No alt
        </span>
      )}
      {selected && (
        <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

type DetailData = MediaAssetView & { usage: UsageRef[] };

function DetailPanel({
  id,
  onPatched,
}: {
  id: string;
  onPatched: (patch: Partial<MediaAssetView>) => void;
}) {
  const { toast } = useToast();
  const [data, setData] = React.useState<DetailData | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setData(null);
    setError(false);
    getMediaAction(id)
      .then((d) => alive && setData(d as DetailData))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [id]);

  async function save(patch: { altText?: string; title?: string; tags?: string[] }) {
    try {
      const updated = (await updateMetadataAction(id, patch)) as MediaAssetView;
      setData((prev) => (prev ? { ...prev, ...updated } : prev));
      onPatched(updated);
    } catch {
      toast({ variant: "destructive", title: "Couldn't save — reverted." });
    }
  }

  if (error) {
    return (
      <div className="w-72 shrink-0 border-l border-border p-4 text-sm text-muted-foreground">
        Couldn&apos;t load asset details.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex w-72 shrink-0 flex-col gap-3 border-l border-border p-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const isImage = data.resource_type === "image";
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border p-4">
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-secondary/40">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb(data.url)} alt={data.alt_text ?? ""} className="h-full w-full object-contain" />
        ) : (
          <FileText className="h-10 w-10 text-muted-foreground" />
        )}
      </div>

      {isImage && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="md-alt">Alt text</Label>
          <textarea
            id="md-alt"
            defaultValue={data.alt_text ?? ""}
            onBlur={(e) => save({ altText: e.target.value })}
            rows={2}
            maxLength={300}
            placeholder="Describe the image for screen readers and SEO."
            className="rounded-md border border-input bg-card px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {!data.alt_present && (
            <p className="text-[12px] text-[var(--status-warning)]">
              Alt text is required before this image can be published.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="md-title">Title</Label>
        <Input id="md-title" defaultValue={data.title ?? ""} onBlur={(e) => save({ title: e.target.value })} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="md-tags">Tags</Label>
        <Input
          id="md-tags"
          defaultValue={data.tags.join(", ")}
          onBlur={(e) =>
            save({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
          }
          placeholder="comma, separated"
        />
      </div>

      <dl className="grid grid-cols-2 gap-1 text-[12px] text-muted-foreground">
        {isImage && data.width && data.height && (
          <>
            <dt>Dimensions</dt>
            <dd className="tabular-nums">{data.width}×{data.height}</dd>
          </>
        )}
        <dt>Format</dt>
        <dd className="uppercase">{data.format}</dd>
        <dt>Size</dt>
        <dd className="tabular-nums">{humanBytes(data.bytes)}</dd>
        <dt>Added</dt>
        <dd className="tabular-nums">{formatDate(data.created_at)}</dd>
      </dl>

      {data.usage.length > 0 && (
        <div className="border-t border-border pt-2">
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Used in {data.usage.length}
          </p>
          <ul className="flex flex-col gap-0.5 text-[12px] text-muted-foreground">
            {data.usage.slice(0, 5).map((u, i) => (
              <li key={i} className="truncate" title={`${u.module} · ${u.title}`}>
                {u.module}: {u.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
