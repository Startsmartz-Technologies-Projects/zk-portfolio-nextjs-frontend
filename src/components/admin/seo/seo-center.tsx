"use client";

import * as React from "react";
import Link from "next/link";
import { ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";

import {
  updateSeoSettingsAction,
  listRedirectsAction,
  createRedirectAction,
  updateRedirectAction,
  deleteRedirectAction,
  updateJsonldAction,
} from "@/app/admin/seo/actions";
import { JSONLD_TYPES } from "@/lib/validation/seo";
import { PageHeader } from "@/src/components/admin/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Field, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import { Thumb } from "@/src/components/admin/shared/list-primitives";
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
import { MediaPickerProvider, useMediaPicker } from "@/src/components/admin/media/media-picker-provider";

export interface SeoSettings {
  siteTitleTemplate: string;
  defaultMetaDescription: string;
  metadataBase: string;
  defaultOgImageId: string | null;
  twitterHandle: string | null;
  defaultRobots: "index_follow" | "noindex_nofollow" | "custom";
  googleSiteVerification: string | null;
  bingSiteVerification: string | null;
  jsonldTypes: string[];
}
export interface RedirectRow {
  id: string;
  fromPath: string;
  toPath: string;
  status: "permanent" | "temporary";
  source: "system" | "manual";
  isActive: boolean;
  note: string | null;
}
export interface SeoCenterProps {
  settings: SeoSettings;
  initialOgUrl: string | null;
  redirects: RedirectRow[];
  organization: unknown;
  sitemapTotal: number;
}

export function SeoCenter(props: SeoCenterProps) {
  return (
    <MediaPickerProvider>
      <Inner {...props} />
    </MediaPickerProvider>
  );
}

function Inner({ settings, initialOgUrl, redirects: initialRedirects, organization, sitemapTotal }: SeoCenterProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="SEO Center" breadcrumbs={[{ label: "SEO Center" }]} />
      <Tabs defaultValue="defaults">
        <TabsList className="flex-wrap">
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
          <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>
        <TabsContent value="defaults" forceMount>
          <DefaultsTab settings={settings} initialOgUrl={initialOgUrl} />
        </TabsContent>
        <TabsContent value="redirects">
          <RedirectsTab initial={initialRedirects} />
        </TabsContent>
        <TabsContent value="jsonld">
          <JsonldTab enabled={settings.jsonldTypes} organization={organization} />
        </TabsContent>
        <TabsContent value="sitemap">
          <SitemapTab total={sitemapTotal} robots={settings.defaultRobots} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DefaultsTab({ settings, initialOgUrl }: { settings: SeoSettings; initialOgUrl: string | null }) {
  const { toast } = useToast();
  const pick = useMediaPicker();
  const [form, setForm] = React.useState(settings);
  const [ogUrl, setOgUrl] = React.useState(initialOgUrl);
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function pickOg() {
    const r = await pick({ resourceType: "image", title: "Choose default social image" });
    if (r && r[0]) { set("defaultOgImageId", r[0].id); setOgUrl(r[0].url); }
  }

  async function save() {
    setSaving(true);
    try {
      await updateSeoSettingsAction({
        siteTitleTemplate: form.siteTitleTemplate,
        defaultMetaDescription: form.defaultMetaDescription,
        metadataBase: form.metadataBase,
        defaultOgImageId: form.defaultOgImageId,
        twitterHandle: form.twitterHandle?.trim() || null,
        defaultRobots: form.defaultRobots,
        googleSiteVerification: form.googleSiteVerification?.trim() || null,
        bingSiteVerification: form.bingSiteVerification?.trim() || null,
      });
      toast({ variant: "success", title: "Saved — updating the site." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't save — check the title template (%s) and base URL." });
    } finally {
      setSaving(false);
    }
  }

  const titlePreview = form.siteTitleTemplate.includes("%s") ? form.siteTitleTemplate.replace("%s", "Projects") : form.siteTitleTemplate;

  return (
    <TabCard>
      <Field label="Site title template" htmlFor="seo-tt" helper="Must contain %s (the page title). Preview below.">
        <Input id="seo-tt" value={form.siteTitleTemplate} onChange={(e) => set("siteTitleTemplate", e.target.value)} />
      </Field>
      <p className="text-[12px] text-muted-foreground">Preview: <span className="font-medium text-foreground">{titlePreview}</span></p>
      <Field label="Default meta description" htmlFor="seo-desc">
        <Textarea id="seo-desc" rows={2} value={form.defaultMetaDescription} onChange={(e) => set("defaultMetaDescription", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Metadata base URL" htmlFor="seo-base" helper="Canonical origin, e.g. https://example.com.">
          <Input id="seo-base" value={form.metadataBase} onChange={(e) => set("metadataBase", e.target.value)} />
        </Field>
        <Field label="Twitter handle" htmlFor="seo-tw" helper="e.g. @zakirenterprise.">
          <Input id="seo-tw" value={form.twitterHandle ?? ""} onChange={(e) => set("twitterHandle", e.target.value)} />
        </Field>
      </div>
      <Field label="Default robots policy" htmlFor="seo-robots">
        <select id="seo-robots" value={form.defaultRobots} onChange={(e) => set("defaultRobots", e.target.value as SeoSettings["defaultRobots"])} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="index_follow">index, follow</option>
          <option value="noindex_nofollow">noindex, nofollow (discourage indexing)</option>
          <option value="custom">custom</option>
        </select>
      </Field>
      <Field label="Default social image (OG)" helper="Fallback share image for pages without their own.">
        <div className="flex items-center gap-3">
          <Thumb media={ogUrl ? { id: "og", url: ogUrl, alt: null, width: null, height: null } : null} alt="" className="h-16 w-28" />
          <Button type="button" variant="outline" size="sm" onClick={pickOg} className="gap-1"><ImageIcon className="h-4 w-4" /> {form.defaultOgImageId ? "Replace" : "Choose"}</Button>
          {form.defaultOgImageId && (
            <Button type="button" variant="ghost" size="sm" onClick={() => { set("defaultOgImageId", null); setOgUrl(null); }} aria-label="Remove OG image"><X className="h-4 w-4" /></Button>
          )}
        </div>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Google site verification" htmlFor="seo-gsv">
          <Input id="seo-gsv" value={form.googleSiteVerification ?? ""} onChange={(e) => set("googleSiteVerification", e.target.value)} />
        </Field>
        <Field label="Bing site verification" htmlFor="seo-bsv">
          <Input id="seo-bsv" value={form.bingSiteVerification ?? ""} onChange={(e) => set("bingSiteVerification", e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={save} disabled={saving} className="gap-1.5">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </TabCard>
  );
}

function RedirectsTab({ initial }: { initial: RedirectRow[] }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = React.useState<RedirectRow[]>(initial);
  const [dialog, setDialog] = React.useState<{ mode: "add" } | { mode: "edit"; row: RedirectRow } | null>(null);

  async function reload() {
    try { setRows((await listRedirectsAction()) as RedirectRow[]); } catch { /* keep stale */ }
  }

  async function toggleActive(r: RedirectRow) {
    try { await updateRedirectAction(r.id, { isActive: !r.isActive }); toast({ variant: "success", title: r.isActive ? "Deactivated." : "Activated." }); reload(); }
    catch { toast({ variant: "destructive", title: "Couldn't update the redirect." }); }
  }

  async function remove(r: RedirectRow) {
    const ok = await confirm({ title: `Delete redirect from '${r.fromPath}'?`, description: "This can't be undone.", confirmLabel: "Delete", destructive: true });
    if (!ok) return;
    try { await deleteRedirectAction(r.id); toast({ variant: "success", title: "Redirect deleted." }); reload(); }
    catch { toast({ variant: "destructive", title: "Couldn't delete the redirect." }); }
  }

  return (
    <TabCard>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} redirect{rows.length === 1 ? "" : "s"}. Single-hop only — chains collapse automatically.</p>
        <Button size="sm" onClick={() => setDialog({ mode: "add" })} className="gap-1"><Plus className="h-4 w-4" /> Add redirect</Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border [&_th]:h-10 [&_th]:bg-secondary/40 [&_th]:px-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
              <th>From</th><th>To</th><th>Type</th><th>Source</th><th>Status</th><th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No redirects yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-middle">
                  <td className="font-mono text-xs">{r.fromPath}</td>
                  <td className="font-mono text-xs text-muted-foreground">{r.toPath}</td>
                  <td>{r.status === "permanent" ? "301" : "302"}</td>
                  <td>{r.source === "system" ? <Badge variant="outline">system</Badge> : <Badge variant="default">manual</Badge>}</td>
                  <td>{r.isActive ? <Badge variant="published">Active</Badge> : <Badge variant="outline">Inactive</Badge>}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setDialog({ mode: "edit", row: r })}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleActive(r)} aria-label="Toggle active">{r.isActive ? "Off" : "On"}</Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r)} aria-label="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {dialog && (
        <RedirectDialog
          key={dialog.mode === "edit" ? dialog.row.id : "add"}
          dialog={dialog}
          onClose={() => setDialog(null)}
          onSaved={() => { setDialog(null); reload(); }}
        />
      )}
    </TabCard>
  );
}

function RedirectDialog({
  dialog,
  onClose,
  onSaved,
}: {
  dialog: { mode: "add" } | { mode: "edit"; row: RedirectRow };
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const editing = dialog.mode === "edit" ? dialog.row : null;
  const [fromPath, setFromPath] = React.useState(editing?.fromPath ?? "");
  const [toPath, setToPath] = React.useState(editing?.toPath ?? "");
  const [status, setStatus] = React.useState<"permanent" | "temporary">(editing?.status ?? "permanent");
  const [note, setNote] = React.useState(editing?.note ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!/^\/\S*$/.test(fromPath) || !/^\/\S*$/.test(toPath)) return setError("Both paths must be root-relative (start with /).");
    setBusy(true);
    try {
      if (dialog.mode === "add") {
        await createRedirectAction({ fromPath, toPath, status, note: note.trim() || null });
        toast({ variant: "success", title: "Redirect created." });
      } else {
        await updateRedirectAction(dialog.row.id, { toPath, status, note: note.trim() || null });
        toast({ variant: "success", title: "Redirect updated." });
      }
      onSaved();
    } catch {
      setError("Couldn't save — the source may already redirect, collide with a live URL, or form a loop.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialog.mode === "add" ? "Add redirect" : "Edit redirect"}</DialogTitle>
          <DialogDescription>Root-relative paths only. Chains collapse to a single hop automatically.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Field label="From path" htmlFor="r-from" helper={dialog.mode === "edit" ? "Source can't be changed." : "e.g. /old-projects/foo"}>
            <Input id="r-from" value={fromPath} disabled={dialog.mode === "edit"} onChange={(e) => setFromPath(e.target.value)} />
          </Field>
          <Field label="To path" htmlFor="r-to">
            <Input id="r-to" value={toPath} onChange={(e) => setToPath(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="r-status">
              <select id="r-status" value={status} onChange={(e) => setStatus(e.target.value as "permanent" | "temporary")} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
                <option value="permanent">Permanent (301)</option>
                <option value="temporary">Temporary (302)</option>
              </select>
            </Field>
            <Field label="Note" htmlFor="r-note">
              <Input id="r-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
          {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="gap-1.5">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JsonldTab({ enabled, organization }: { enabled: string[]; organization: unknown }) {
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<string[]>(enabled);
  const [saving, setSaving] = React.useState(false);

  function toggle(t: string) {
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  }

  async function save() {
    setSaving(true);
    try {
      await updateJsonldAction({ enabledTypes: selected });
      toast({ variant: "success", title: "Saved — updating the site." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't save the JSON-LD settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <TabCard>
      <p className="text-sm text-muted-foreground">Enable the structured-data types emitted in the public pages.</p>
      <ul className="flex flex-col gap-2">
        {JSONLD_TYPES.map((t) => (
          <li key={t}>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(t)} onChange={() => toggle(t)} className="h-4 w-4 rounded border-input" />
              {t}
            </label>
          </li>
        ))}
      </ul>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organization preview</p>
        {organization ? (
          <pre className="max-h-64 overflow-auto rounded-md border border-border bg-secondary/30 p-3 text-xs">{JSON.stringify(organization, null, 2)}</pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            Organization data is incomplete — fill in the company profile in{" "}
            <Link href="/admin/site" className="text-primary hover:underline">Site Settings</Link>.
          </p>
        )}
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={save} disabled={saving} className="gap-1.5">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
      </div>
    </TabCard>
  );
}

function SitemapTab({ total, robots }: { total: number; robots: string }) {
  return (
    <TabCard>
      <p className="text-sm">
        <strong className="tabular-nums">{total}</strong> indexable URL{total === 1 ? "" : "s"} in the sitemap.
      </p>
      <p className="text-[13px] text-muted-foreground">
        The sitemap and <code>robots.txt</code> are generated from published content. The site-wide robots policy is{" "}
        <Badge variant="outline">{robots.replace("_", ", ")}</Badge> — change it on the <strong>Defaults</strong> tab.
      </p>
      {total === 0 && (
        <p className="rounded-md border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
          No published URLs yet — entries appear as content is published.
        </p>
      )}
    </TabCard>
  );
}
