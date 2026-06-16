"use client";

import * as React from "react";
import { FileText, Loader2, RotateCcw, Search, Trash2, Upload as UploadIcon } from "lucide-react";

import {
  listMediaAction,
  getMediaAction,
  updateMetadataAction,
  deleteMediaAction,
  restoreMediaAction,
} from "@/app/admin/media/actions";
import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Field } from "@/src/components/admin/shared/form-fields";
import { Pagination } from "@/src/components/admin/shared/list-primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useToast } from "@/src/components/ui/use-toast";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { MediaUpload } from "@/src/components/admin/media/media-upload";
import { humanBytes, type MediaAssetView, type ResourceType } from "@/src/components/admin/media/types";
import { formatDate } from "@/src/lib/format-date";

interface UsageRef { module: string; record_id: string; title: string; role: string }
type Detail = MediaAssetView & { usage: UsageRef[] };

const PAGE_SIZE = 24;

export interface MediaLibraryProps {
  isAdmin: boolean;
}

export function MediaLibrary({ isAdmin }: MediaLibraryProps) {
  const { toast } = useToast();

  const [rows, setRows] = React.useState<MediaAssetView[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [resourceType, setResourceType] = React.useState<"" | ResourceType>("");
  const [inUse, setInUse] = React.useState<"" | "yes" | "no">("");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const seq = React.useRef(0);
  const load = React.useCallback(async () => {
    const s = ++seq.current;
    setRows(null);
    setLoadError(false);
    try {
      const res = await listMediaAction({
        q: q.trim() || undefined,
        resourceType: resourceType || undefined,
        inUse: inUse === "" ? undefined : inUse === "yes",
        includeDeleted: includeDeleted || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      if (s !== seq.current) return;
      setRows(res.data as MediaAssetView[]);
      setTotal(res.meta.total);
    } catch {
      if (s !== seq.current) return;
      setLoadError(true);
    }
  }, [q, resourceType, inUse, includeDeleted, page]);

  React.useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Media"
        breadcrumbs={[{ label: "Media" }]}
        actions={
          <Button onClick={() => setUploadOpen(true)} className="gap-1.5">
            <UploadIcon className="h-4 w-4" /> Upload
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Search filename, title, alt, tag…" className="w-64 pl-8" aria-label="Search media" />
        </div>
        <select value={resourceType} onChange={(e) => { setPage(1); setResourceType(e.target.value as "" | ResourceType); }} aria-label="Filter by type" className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
        </select>
        <select value={inUse} onChange={(e) => { setPage(1); setInUse(e.target.value as "" | "yes" | "no"); }} aria-label="Filter by usage" className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">Any usage</option>
          <option value="yes">In use</option>
          <option value="no">Unused</option>
        </select>
        {isAdmin && (
          <label className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <input type="checkbox" checked={includeDeleted} onChange={(e) => { setPage(1); setIncludeDeleted(e.target.checked); }} className="h-4 w-4 rounded border-input" />
            Show withdrawn
          </label>
        )}
      </div>

      {/* Grid */}
      {rows === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-md border border-border bg-card/60" />)}
        </div>
      ) : loadError ? (
        <div className="rounded-[10px] border border-border bg-card p-6 text-center"><Button size="sm" variant="outline" onClick={load}>Retry</Button></div>
      ) : rows.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">No media match your filters. Upload your first asset.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {rows.map((m) => <AssetCard key={m.id} asset={m} onOpen={() => setOpenId(m.id)} />)}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />}

      {uploadOpen && <UploadDialog onClose={() => setUploadOpen(false)} onDone={() => { setUploadOpen(false); setPage(1); load(); }} toast={toast} />}
      {openId && (
        <AssetDetailDialog
          id={openId}
          isAdmin={isAdmin}
          onClose={() => setOpenId(null)}
          onChanged={load}
          toast={toast}
        />
      )}
    </div>
  );
}

function AssetCard({ asset, onOpen }: { asset: MediaAssetView; onOpen: () => void }) {
  const withdrawn = Boolean(asset.deleted_at);
  return (
    <button type="button" onClick={onOpen} className="group flex flex-col overflow-hidden rounded-md border border-border bg-card text-left shadow-sm transition-colors hover:border-primary">
      <div className="relative flex aspect-square items-center justify-center bg-secondary/40">
        {asset.resource_type === "image" && asset.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- matches the media picker/Thumb convention (cloudinary loader)
          <img src={asset.url} alt={asset.alt_text ?? ""} className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-10 w-10 text-muted-foreground" />
        )}
        {withdrawn && <span className="absolute inset-x-0 top-0 bg-destructive/80 py-0.5 text-center text-[10px] font-medium text-white">Withdrawn</span>}
        {asset.resource_type === "image" && !asset.alt_present && !withdrawn && (
          <span className="absolute bottom-0 inset-x-0 bg-[var(--status-warning)]/85 py-0.5 text-center text-[10px] font-medium text-white">No alt text</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span className="line-clamp-1 text-xs">{asset.title || asset.original_filename || asset.public_id}</span>
        {asset.in_use && <Badge variant="outline" className="shrink-0 text-[10px]">used</Badge>}
      </div>
    </button>
  );
}

function UploadDialog({ onClose, onDone, toast }: { onClose: () => void; onDone: () => void; toast: ReturnType<typeof useToast>["toast"] }) {
  const [resourceType, setResourceType] = React.useState<ResourceType>("image");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
          <DialogDescription>Upload an image or document to the library.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="inline-flex rounded-md border border-border p-0.5 text-sm">
            {(["image", "document"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setResourceType(t)} className={t === resourceType ? "rounded px-3 py-1 bg-secondary font-medium capitalize" : "rounded px-3 py-1 capitalize text-muted-foreground"}>{t}</button>
            ))}
          </div>
          <MediaUpload
            resourceType={resourceType}
            onRegistered={() => { toast({ variant: "success", title: "Uploaded." }); onDone(); }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssetDetailDialog({
  id,
  isAdmin,
  onClose,
  onChanged,
  toast,
}: {
  id: string;
  isAdmin: boolean;
  onClose: () => void;
  onChanged: () => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const confirm = useConfirm();
  const [asset, setAsset] = React.useState<Detail | null>(null);
  const [error, setError] = React.useState(false);
  const [altText, setAltText] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const a = (await getMediaAction(id)) as Detail;
        setAsset(a);
        setAltText(a.alt_text ?? "");
        setTitle(a.title ?? "");
        setTags(a.tags.join(", "));
      } catch {
        setError(true);
      }
    })();
  }, [id]);

  async function save() {
    setBusy(true);
    try {
      await updateMetadataAction(id, {
        altText: altText.trim() || null,
        title: title.trim() || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast({ variant: "success", title: "Saved." });
      onChanged();
      onClose();
    } catch {
      toast({ variant: "destructive", title: "Couldn't save the metadata." });
    } finally {
      setBusy(false);
    }
  }

  async function softDelete() {
    const ok = await confirm({ title: "Withdraw this asset?", description: "It leaves the library but still resolves for existing references. An admin can restore it.", confirmLabel: "Withdraw", destructive: true });
    if (!ok) return;
    try { await deleteMediaAction(id); toast({ variant: "success", title: "Asset withdrawn." }); onChanged(); onClose(); }
    catch { toast({ variant: "destructive", title: "Couldn't withdraw the asset." }); }
  }

  async function hardDelete() {
    const ok = await confirm({ title: "Delete permanently?", description: "This can't be undone.", confirmLabel: "Delete permanently", destructive: true });
    if (!ok) return;
    try { await deleteMediaAction(id, { hard: true }); toast({ variant: "success", title: "Asset deleted." }); onChanged(); onClose(); }
    catch { toast({ variant: "destructive", title: "Can't delete — the asset is still in use." }); }
  }

  async function restore() {
    try { await restoreMediaAction(id); toast({ variant: "success", title: "Asset restored." }); onChanged(); onClose(); }
    catch { toast({ variant: "destructive", title: "Couldn't restore the asset." }); }
  }

  const withdrawn = Boolean(asset?.deleted_at);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {!asset ? (
          <div className="py-10 text-center text-sm text-muted-foreground">{error ? "Couldn't load this asset." : "Loading…"}</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="truncate">{asset.title || asset.original_filename || asset.public_id}</DialogTitle>
              <DialogDescription>
                {asset.resource_type} · {asset.format?.toUpperCase()} · {humanBytes(asset.bytes)}
                {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""} · {formatDate(asset.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/40">
                {asset.resource_type === "image" && asset.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- matches the media picker/Thumb convention
                  <img src={asset.url} alt={asset.alt_text ?? ""} className="h-full w-full object-contain" />
                ) : (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              <div className="flex flex-col gap-3">
                {asset.resource_type === "image" && (
                  <Field label="Alt text" htmlFor="m-alt" helper="Required for images used on the public site.">
                    <Input id="m-alt" value={altText} onChange={(e) => setAltText(e.target.value)} />
                  </Field>
                )}
                <Field label="Title" htmlFor="m-title">
                  <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <Field label="Tags" htmlFor="m-tags" helper="Comma-separated.">
                  <Input id="m-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                </Field>
                <Button onClick={save} disabled={busy} className="gap-1.5 self-start">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save metadata
                </Button>
              </div>
            </div>

            {/* Usage */}
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Where it's used</p>
              {asset.usage.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not referenced by any record.</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm">
                  {asset.usage.map((u, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-1.5">
                      <span className="min-w-0 truncate"><span className="font-medium capitalize">{u.module}</span> · {u.title}</span>
                      <Badge variant="outline" className="shrink-0">{u.role}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter className="sm:justify-between">
              <span className="text-xs text-muted-foreground">{asset.in_use ? "In use — referenced assets can't be permanently deleted." : "Unused."}</span>
              <div className="flex gap-2">
                {withdrawn ? (
                  isAdmin && <Button variant="outline" onClick={restore} className="gap-1.5"><RotateCcw className="h-4 w-4" /> Restore</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={softDelete} className="gap-1.5"><Trash2 className="h-4 w-4" /> Withdraw</Button>
                    {isAdmin && !asset.in_use && <Button variant="destructive" onClick={hardDelete}>Delete permanently</Button>}
                  </>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
