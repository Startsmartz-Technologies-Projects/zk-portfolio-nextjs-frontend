"use client";

import * as React from "react";
import { Check, Loader2, Search } from "lucide-react";

import { listProjectsAction } from "@/app/admin/projects/actions";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { CoverThumb } from "./cover-thumb";
import type { ProjectListItem } from "./types";

export interface RelatedPick {
  id: string;
  title: string;
  published: true;
}

interface ListResult {
  data: ProjectListItem[];
  meta: { page: number; pageSize: number; total: number };
}

/**
 * A search/select overlay for the editor's Related tab: pick published projects to
 * relate (excludes self + already-chosen, ≤ remaining slots). Promise-based so it
 * plugs into RepeatableGroup's `onAddExternal` (picker-backed variant). FR-PROJ-039.
 */
export function RelatedPicker({
  open,
  onOpenChange,
  excludeIds,
  remaining,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: string[];
  remaining: number;
  onConfirm: (picks: RelatedPick[]) => void;
}) {
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState<ProjectListItem[] | null>(null);
  const [error, setError] = React.useState(false);
  const [selected, setSelected] = React.useState<Record<string, ProjectListItem>>({});

  const load = React.useCallback(async (query: string) => {
    setRows(null);
    setError(false);
    try {
      const res = (await listProjectsAction({
        page: 1,
        pageSize: 20,
        contentStatus: "published",
        q: query || undefined,
        sort: "recent",
      })) as ListResult;
      setRows(res.data);
    } catch {
      setError(true);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setSelected({});
    setQ("");
    void load("");
  }, [open, load]);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(q), 300);
    return () => clearTimeout(t);
  }, [q, open, load]);

  const selectedIds = Object.keys(selected);
  const atMax = selectedIds.length >= remaining;

  function toggle(row: ProjectListItem) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[row.id]) delete next[row.id];
      else if (selectedIds.length < remaining) next[row.id] = row;
      return next;
    });
  }

  function confirm() {
    onConfirm(
      selectedIds.map((id) => ({ id, title: selected[id].title, published: true as const })),
    );
    onOpenChange(false);
  }

  const visible = (rows ?? []).filter((r) => !excludeIds.includes(r.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add related projects</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search published projects…"
            aria-label="Search published projects"
            className="pl-8"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {selectedIds.length} of {remaining} selected
        </p>

        <div className="max-h-[50vh] overflow-auto rounded-md border border-border">
          {error ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              Couldn&apos;t load projects.
              <Button variant="outline" size="sm" onClick={() => load(q)}>
                Retry
              </Button>
            </div>
          ) : rows === null ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : visible.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No more published projects to relate.
            </p>
          ) : (
            <ul>
              {visible.map((row) => {
                const isSelected = !!selected[row.id];
                const disabled = !isSelected && atMax;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => toggle(row)}
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left last:border-0 hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-50",
                        isSelected && "bg-secondary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <CoverThumb cover={row.cover_image} alt="" />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-medium">{row.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.category?.label ?? "Uncategorised"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={selectedIds.length === 0}>
            Add {selectedIds.length > 0 ? selectedIds.length : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
