"use client";

import * as React from "react";
import { Download, Loader2, Paperclip, Search, Trash2 } from "lucide-react";

import {
  listLeadsAction,
  getLeadAction,
  updateLeadTriageAction,
  addLeadNoteAction,
  deleteLeadAction,
} from "@/app/admin/inquiries/actions";
import { INQUIRY_TYPES, inquiryTypeLabel } from "@/lib/leads/options";
import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Field, Textarea } from "@/src/components/admin/shared/form-fields";
import { Pagination } from "@/src/components/admin/shared/list-primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useToast } from "@/src/components/ui/use-toast";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { formatDate } from "@/src/lib/format-date";

type BadgeVariant = "default" | "outline" | "primary" | "published" | "archived" | "danger" | "warning";

const STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  new: { label: "New", variant: "primary" },
  in_review: { label: "In review", variant: "warning" },
  contacted: { label: "Contacted", variant: "default" },
  qualified: { label: "Qualified", variant: "published" },
  won: { label: "Won", variant: "published" },
  lost: { label: "Lost", variant: "outline" },
  spam: { label: "Spam", variant: "danger" },
  archived: { label: "Archived", variant: "archived" },
};
const STATUS_ORDER = ["new", "in_review", "contacted", "qualified", "won", "lost", "archived"] as const;

interface Assignee { id: string; name: string }
interface LeadListItem {
  id: string;
  reference_no: string;
  name: string;
  company: string | null;
  email: string;
  subject: string;
  inquiry_type: string;
  status: string;
  is_spam: boolean;
  assignee: Assignee | null;
  attachment_count: number;
  created_at: string;
  deleted_at?: string;
}

const PAGE_SIZE = 20;

export interface LeadsInboxProps {
  principalId: string;
  principalName: string;
  canManage: boolean;
}

export function LeadsInbox({ principalId, principalName, canManage }: LeadsInboxProps) {
  const { toast } = useToast();

  const [rows, setRows] = React.useState<LeadListItem[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [inquiryType, setInquiryType] = React.useState("");
  const [sort, setSort] = React.useState("recent");
  const [spam, setSpam] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState(false);

  const filters = React.useMemo(
    () => ({
      q: q.trim() || undefined,
      status: status || undefined,
      inquiryType: inquiryType || undefined,
      sort: sort as "recent" | "oldest" | "status",
      spam: spam || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [q, status, inquiryType, sort, spam, page],
  );

  const seq = React.useRef(0);
  const load = React.useCallback(async () => {
    const s = ++seq.current;
    setRows(null);
    setLoadError(false);
    try {
      const res = await listLeadsAction(filters);
      if (s !== seq.current) return;
      setRows(res.data as LeadListItem[]);
      setTotal(res.meta.total);
    } catch {
      if (s !== seq.current) return;
      setLoadError(true);
    }
  }, [filters]);

  React.useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const exportHref = React.useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status) p.set("status", status);
    if (inquiryType) p.set("inquiryType", inquiryType);
    if (spam) p.set("spam", "true");
    p.set("sort", sort);
    return `/api/admin/inquiries/export?${p.toString()}`;
  }, [q, status, inquiryType, spam, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inquiries"
        breadcrumbs={[{ label: "Inquiries" }]}
        actions={
          canManage ? (
            <Button asChild variant="outline" className="gap-1.5">
              <a href={exportHref} download><Download className="h-4 w-4" /> Export CSV</a>
            </Button>
          ) : undefined
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Search name, email, ref…" className="w-60 pl-8" aria-label="Search inquiries" />
        </div>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} aria-label="Filter by status" className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
        </select>
        <select value={inquiryType} onChange={(e) => { setPage(1); setInquiryType(e.target.value); }} aria-label="Filter by type" className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">All types</option>
          {INQUIRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="recent">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="status">By status</option>
        </select>
        <label className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <input type="checkbox" checked={spam} onChange={(e) => { setPage(1); setSpam(e.target.checked); }} className="h-4 w-4 rounded border-input" />
          Spam
        </label>
      </div>

      {/* Table */}
      <div className="relative w-full overflow-auto rounded-[10px] border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border [&_th]:h-11 [&_th]:bg-secondary/40 [&_th]:px-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
              <th>Ref</th>
              <th>From</th>
              {/* Subject absorbs spare width so the row fills the table (no right-side gap). */}
              <th className="w-full">Subject</th>
              <th>Type</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : loadError ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center"><Button size="sm" variant="outline" onClick={load}>Retry</Button></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No inquiries match your filters.</td></tr>
            ) : (
              rows.map((l) => {
                const st = STATUS[l.status] ?? { label: l.status, variant: "default" as BadgeVariant };
                return (
                  <tr key={l.id} onClick={() => setOpenId(l.id)} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/50 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle">
                    <td className="font-mono text-xs text-muted-foreground">{l.reference_no}</td>
                    <td>
                      <span className="font-medium text-foreground">{l.name}</span>
                      {l.company && <span className="block text-xs text-muted-foreground">{l.company}</span>}
                    </td>
                    <td className="w-full max-w-0">
                      <span className="line-clamp-1">{l.subject}</span>
                      {l.attachment_count > 0 && <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"><Paperclip className="h-3 w-3" /> {l.attachment_count}</span>}
                    </td>
                    <td className="text-muted-foreground">{inquiryTypeLabel(l.inquiry_type as never)}</td>
                    <td>{l.is_spam ? <Badge variant="danger">Spam</Badge> : <Badge variant={st.variant}>{st.label}</Badge>}</td>
                    <td className="text-muted-foreground">{l.assignee?.name ?? "—"}</td>
                    <td className="whitespace-nowrap text-muted-foreground">{formatDate(l.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />}

      {openId && (
        <LeadDetailDialog
          id={openId}
          principalId={principalId}
          principalName={principalName}
          canManage={canManage}
          onClose={() => setOpenId(null)}
          onChanged={load}
          toast={toast}
        />
      )}
    </div>
  );
}

interface LeadDetail {
  id: string;
  reference_no: string;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  subject: string;
  inquiry_type: string;
  services: string[];
  budget: string | null;
  location: string | null;
  timeline: string | null;
  bid_name: string | null;
  message: string;
  status: string;
  assignee: Assignee | null;
  is_spam: boolean;
  attachments: { id: string; media: { original_filename?: string | null } | Record<string, unknown>; position: number }[];
  notes: { id: string; author: Assignee | null; body: string; created_at: string }[];
  source_page: string;
  created_at: string;
}

function LeadDetailDialog({
  id,
  principalId,
  principalName,
  canManage,
  onClose,
  onChanged,
  toast,
}: {
  id: string;
  principalId: string;
  principalName: string;
  canManage: boolean;
  onClose: () => void;
  onChanged: () => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const confirm = useConfirm();
  const [lead, setLead] = React.useState<LeadDetail | null>(null);
  const [error, setError] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    try {
      setLead((await getLeadAction(id)) as LeadDetail);
    } catch {
      setError(true);
    }
  }, [id]);
  React.useEffect(() => { reload(); }, [reload]);

  async function triage(patch: { status?: string; assignee_id?: string | null; is_spam?: boolean }) {
    setBusy(true);
    try {
      setLead((await updateLeadTriageAction(id, patch)) as LeadDetail);
      toast({ variant: "success", title: "Updated." });
      onChanged();
    } catch {
      toast({ variant: "destructive", title: "Couldn't update the inquiry." });
    } finally {
      setBusy(false);
    }
  }

  async function submitNote() {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await addLeadNoteAction(id, { body: note.trim() });
      setNote("");
      await reload();
      toast({ variant: "success", title: "Note added." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't add the note." });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({ title: "Delete this inquiry?", description: "It's soft-deleted and can be restored by an admin.", confirmLabel: "Delete", destructive: true });
    if (!ok) return;
    try {
      await deleteLeadAction(id);
      toast({ variant: "success", title: "Inquiry deleted." });
      onChanged();
      onClose();
    } catch {
      toast({ variant: "destructive", title: "Couldn't delete the inquiry." });
    }
  }

  const assignedToMe = lead?.assignee?.id === principalId;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {!lead ? (
          <div className="py-10 text-center text-sm text-muted-foreground">{error ? "Couldn't load this inquiry." : "Loading…"}</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {lead.subject}
                {lead.is_spam && <Badge variant="danger">Spam</Badge>}
              </DialogTitle>
              <DialogDescription>
                {lead.reference_no} · {inquiryTypeLabel(lead.inquiry_type as never)} · {formatDate(lead.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
              {/* Contact + meta */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Meta label="Name" value={lead.name} />
                <Meta label="Company" value={lead.company} />
                <Meta label="Email" value={<a className="text-primary hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a>} />
                <Meta label="Phone" value={<a className="text-primary hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a>} />
                {lead.budget && <Meta label="Budget" value={lead.budget} />}
                {lead.timeline && <Meta label="Timeline" value={lead.timeline} />}
                {lead.location && <Meta label="Location" value={lead.location} />}
                {lead.bid_name && <Meta label="Tender / bid" value={lead.bid_name} />}
              </dl>

              {lead.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {lead.services.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              )}

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap rounded-md border border-border bg-secondary/30 p-3 text-sm">{lead.message}</p>
              </div>

              {/* Attachments */}
              {lead.attachments.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachments</p>
                  <ul className="flex flex-col gap-1">
                    {lead.attachments.map((a) => {
                      const fname = ("original_filename" in a.media ? (a.media.original_filename as string | null) : null) ?? `Attachment ${a.position + 1}`;
                      return (
                        <li key={a.id}>
                          <a href={`/api/admin/inquiries/${lead.id}/attachments/${a.id}/download`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                            <Paperclip className="h-3.5 w-3.5" /> {fname}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Triage controls */}
              <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-3">
                <Field label="Status" htmlFor="lead-status">
                  <select id="lead-status" value={lead.status} disabled={busy} onChange={(e) => triage({ status: e.target.value })} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
                    {Object.keys(STATUS).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
                  </select>
                </Field>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Assignee</span>
                  <span className="text-sm text-muted-foreground">{lead.assignee?.name ?? "Unassigned"}</span>
                </div>
                {assignedToMe ? (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => triage({ assignee_id: null })}>Unassign</Button>
                ) : (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => triage({ assignee_id: principalId })}>Assign to me ({principalName.split(" ")[0]})</Button>
                )}
                <Button size="sm" variant="outline" disabled={busy} onClick={() => triage({ is_spam: !lead.is_spam })}>
                  {lead.is_spam ? "Not spam" : "Mark spam"}
                </Button>
                {canManage && (
                  <Button size="sm" variant="ghost" disabled={busy} onClick={remove} className="ml-auto gap-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                )}
              </div>

              {/* Notes */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Internal notes</p>
                <ul className="mb-2 flex flex-col gap-2">
                  {lead.notes.length === 0 ? (
                    <li className="text-sm text-muted-foreground">No notes yet.</li>
                  ) : (
                    lead.notes.map((n) => (
                      <li key={n.id} className="rounded-md border border-border bg-card p-2 text-sm">
                        <div className="mb-0.5 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{n.author?.name ?? "System"}</span>
                          <span>{formatDate(n.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{n.body}</p>
                      </li>
                    ))
                  )}
                </ul>
                <div className="flex items-end gap-2">
                  <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note…" className="flex-1" />
                  <Button size="sm" disabled={busy || !note.trim()} onClick={submitNote} className="gap-1.5">
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Add
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
