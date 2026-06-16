"use client";

import * as React from "react";
import {
  AlertTriangle,
  ExternalLink,
  Eye,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { recentEntityAuditAction } from "@/app/admin/audit/actions";
import type { AuditLogItem } from "@/lib/users/audit-read";
import { cn } from "@/src/lib/utils";
import { formatDate, formatDateTime } from "@/src/lib/format-date";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useToast } from "@/src/components/ui/use-toast";

export type ContentStatus = "draft" | "published" | "archived";

const STATUS_BADGE: Record<ContentStatus, { variant: "draft" | "published" | "archived"; label: string }> = {
  draft: { variant: "draft", label: "Draft" },
  published: { variant: "published", label: "Published" },
  archived: { variant: "archived", label: "Archived" },
};

const AUDIT_LABEL: Record<string, string> = {
  create: "Created",
  update: "Updated",
  publish: "Published",
  unpublish: "Unpublished",
  archive: "Archived",
  restore: "Restored",
  delete: "Deleted",
  merge: "Merged",
};

export interface PublishAuditPanelProps {
  status: ContentStatus;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  updatedByName?: string | null;
  createdAt?: string | Date | null;
  createdByName?: string | null;
  liveUrl?: string | null;
  featured?: boolean;
  /** "no-lifecycle" (SITE/Leads): a save/delete gate instead of publish transitions. */
  mode?: "content" | "no-lifecycle";
  allowDuplicate?: boolean;
  allowDelete?: boolean;
  /** Admin-only affordances. */
  canRestoreFromDeleted?: boolean;
  canViewAuditLog?: boolean;
  auditLogHref?: string;
  /** The noun used in confirm/toast copy, e.g. "project". */
  itemNoun?: string;
  /** Blocking publish issues (host's collectPublishIssues). Non-empty → Publish disabled. */
  publishIssues?: string[];
  onIssueClick?: (issue: string, index: number) => void;
  /** Host transitions (each acts on the saved record and updates the host's state). */
  onPublish?: () => Promise<void>;
  onUnpublish?: () => Promise<void>;
  onArchive?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onDuplicate?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  /** Returns a short-lived signed preview URL to open in a new tab (FR-PROJ-032). */
  onPreview?: () => Promise<string>;
  /** Record identity for the audit timeline. */
  entityType?: string;
  entityId?: string;
}

export function PublishAuditPanel({
  status,
  publishedAt,
  updatedAt,
  updatedByName,
  createdAt,
  createdByName,
  liveUrl,
  featured = false,
  mode = "content",
  allowDuplicate = true,
  allowDelete = true,
  canRestoreFromDeleted = false,
  canViewAuditLog = false,
  auditLogHref,
  itemNoun = "record",
  publishIssues = [],
  onIssueClick,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onDuplicate,
  onDelete,
  onPreview,
  entityType,
  entityId,
}: PublishAuditPanelProps) {
  const confirm = useConfirm();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const lifecycle = mode === "content";
  const blocked = publishIssues.length > 0;
  const badge = STATUS_BADGE[status];

  // ── Audit timeline ────────────────────────────────────────────────────
  const [audit, setAudit] = React.useState<AuditLogItem[] | null>(null);
  const [auditError, setAuditError] = React.useState(false);

  const loadAudit = React.useCallback(async () => {
    if (!entityType || !entityId) return;
    setAuditError(false);
    setAudit(null);
    try {
      setAudit(await recentEntityAuditAction(entityType, entityId));
    } catch {
      setAuditError(true);
    }
  }, [entityType, entityId]);

  React.useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  async function run(
    key: string,
    fn: (() => Promise<void>) | undefined,
    opts: { confirm?: Parameters<typeof confirm>[0]; toast?: string } = {},
  ) {
    if (!fn) return;
    if (opts.confirm) {
      const ok = await confirm(opts.confirm);
      if (!ok) return;
    }
    setError(null);
    setBusy(key);
    try {
      await fn();
      if (opts.toast) toast({ variant: "success", title: opts.toast });
      await loadAudit();
    } catch {
      setError(`Couldn't ${key} — please try again.`);
    } finally {
      setBusy(null);
    }
  }

  async function preview() {
    if (!onPreview) return;
    setError(null);
    setBusy("preview");
    try {
      const url = await onPreview();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Couldn't open the preview link.");
    } finally {
      setBusy(null);
    }
  }

  const featuredNote = featured
    ? " It's featured, so it will also be removed from the featured set."
    : "";

  return (
    <section
      aria-label="Publish"
      className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-4 shadow-sm"
    >
      {/* Status block */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold">Publish</h3>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        {status === "published" && (
          <p className="text-[13px] text-muted-foreground">
            Published {formatDate(publishedAt)}
            {liveUrl && (
              <>
                {" · "}
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
                >
                  View live page <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive">
          {error}
        </p>
      )}

      {/* Publish gate */}
      {lifecycle && status !== "published" && blocked && (
        <div role="alert" className="flex flex-col gap-2 rounded-md border border-[var(--status-warning)]/40 bg-[var(--status-warning)]/10 p-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--status-warning)]">
            <AlertTriangle className="h-4 w-4" /> Can&apos;t publish yet
          </p>
          <ul className="flex flex-col gap-1">
            {publishIssues.map((issue, i) => (
              <li key={i}>
                {onIssueClick ? (
                  <button
                    type="button"
                    onClick={() => onIssueClick(issue, i)}
                    className="text-left text-[13px] text-foreground underline-offset-2 hover:underline"
                  >
                    {issue}
                  </button>
                ) : (
                  <span className="text-[13px] text-foreground">{issue}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary + secondary transitions */}
      {lifecycle && (
        <div className="flex flex-col gap-2">
          {status !== "published" && status !== "archived" && (
            <Button
              type="button"
              className="w-full"
              disabled={blocked || busy !== null}
              aria-disabled={blocked}
              onClick={() => run("publish", onPublish, { toast: "Published — live on the site shortly." })}
            >
              {busy === "publish" && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy === "publish" ? "Publishing…" : "Publish"}
            </Button>
          )}

          <div className="flex flex-wrap gap-2">
            {status === "published" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() =>
                  run("unpublish", onUnpublish, {
                    confirm: {
                      title: `Unpublish this ${itemNoun}?`,
                      description: `It will be removed from the public site.${featuredNote}`,
                      confirmLabel: "Unpublish",
                      destructive: true,
                    },
                    toast: "Unpublished.",
                  })
                }
              >
                {busy === "unpublish" && <Loader2 className="h-4 w-4 animate-spin" />}
                Unpublish
              </Button>
            )}
            {status !== "archived" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() =>
                  run("archive", onArchive, {
                    confirm: {
                      title: `Archive this ${itemNoun}?`,
                      description: `It leaves the public site and lists; you can restore it later.${featuredNote}`,
                      confirmLabel: "Archive",
                      destructive: true,
                    },
                    toast: "Archived.",
                  })
                }
              >
                {busy === "archive" && <Loader2 className="h-4 w-4 animate-spin" />}
                Archive
              </Button>
            )}
            {status === "archived" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => run("restore", onRestore, { toast: "Restored to draft." })}
              >
                {busy === "restore" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Restore
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Preview + utilities */}
      <div className="flex flex-wrap gap-2">
        {onPreview && (
          <Button type="button" variant="outline" size="sm" disabled={busy !== null} onClick={preview}>
            {busy === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            {status === "published" ? "Preview" : "Preview draft"}
          </Button>
        )}
        {allowDuplicate && onDuplicate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy !== null}
            onClick={() => run("duplicate", onDuplicate, { toast: "Duplicated — opening the copy." })}
          >
            {busy === "duplicate" && <Loader2 className="h-4 w-4 animate-spin" />}
            Duplicate
          </Button>
        )}
        {allowDelete && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={busy !== null}
            onClick={() =>
              run("delete", onDelete, {
                confirm: {
                  title: `Delete this ${itemNoun}?`,
                  description: "It's removed from lists; an admin can restore it.",
                  confirmLabel: "Delete",
                  destructive: true,
                },
                toast: "Deleted.",
              })
            }
          >
            {busy === "delete" && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </Button>
        )}
      </div>

      {/* Provenance */}
      {(updatedAt || createdAt) && (
        <div className="border-t border-border pt-3 text-[13px] text-muted-foreground">
          {updatedAt && (
            <p className="tabular-nums">
              Last saved {formatDateTime(updatedAt)}
              {updatedByName ? ` by ${updatedByName}` : ""}
            </p>
          )}
          {createdAt && (
            <p className="tabular-nums">
              Created {formatDate(createdAt)}
              {createdByName ? ` by ${createdByName}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Audit timeline */}
      {entityType && entityId && (
        <div className="border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent activity
            </h4>
            {canViewAuditLog && auditLogHref && (
              <a href={auditLogHref} className="text-xs text-foreground underline-offset-2 hover:underline">
                View audit log
              </a>
            )}
          </div>
          {auditError ? (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              Couldn&apos;t load recent activity.
              <Button variant="ghost" size="sm" onClick={loadAudit}>
                Retry
              </Button>
            </div>
          ) : audit === null ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : audit.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No recent activity yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {audit.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-0.5 text-[13px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {AUDIT_LABEL[entry.action] ?? entry.action}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {formatDateTime(entry.created_at)}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {entry.summary}
                    {entry.actor ? ` — ${entry.actor.full_name}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
