"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  listTermRefsAction,
  createTermForFieldAction,
} from "@/app/admin/taxonomies/actions";
import type { TermRef } from "@/lib/data/site";
import { TERM_SLUG_RE } from "@/lib/validation/site";
import { cn } from "@/src/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useToast } from "@/src/components/ui/use-toast";

/** Mirror of the server slugify (lib/data/site.ts) so the auto-slug preview matches. */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TaxonomySelectorProps {
  /** SITE vocabulary slug, e.g. `projects-category`, `location`. */
  vocabularySlug: string;
  /** Human label of the vocabulary (create-panel title); falls back to the slug. */
  vocabularyLabel?: string;
  value: TermRef | null;
  onChange: (term: TermRef | null) => void;
  /** Noun for the placeholder, e.g. "category" → "Select a category". */
  fieldNoun?: string;
  placeholder?: string;
  required?: boolean;
  /** Host passes `role === "admin"`; the server still enforces it (BR-6). */
  canCreateTerm?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  triggerId?: string;
  ariaDescribedBy?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; terms: TermRef[] };

export function TaxonomySelector({
  vocabularySlug,
  vocabularyLabel,
  value,
  onChange,
  fieldNoun,
  placeholder,
  required = false,
  canCreateTerm = false,
  disabled = false,
  invalid = false,
  triggerId,
  ariaDescribedBy,
}: TaxonomySelectorProps) {
  const { toast } = useToast();
  const [state, setState] = React.useState<LoadState>({ status: "loading" });
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [mode, setMode] = React.useState<"list" | "create">("list");

  const load = React.useCallback(async () => {
    setState({ status: "loading" });
    try {
      const terms = await listTermRefsAction(vocabularySlug);
      setState({ status: "ready", terms });
    } catch {
      setState({ status: "error" });
    }
  }, [vocabularySlug]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Reset transient UI when the popover closes.
  React.useEffect(() => {
    if (!open) {
      setMode("list");
      setQuery("");
    }
  }, [open]);

  const placeholderText =
    placeholder ?? (fieldNoun ? `Select a ${fieldNoun}` : "Select…");

  const terms = state.status === "ready" ? state.terms : [];
  const referencedButInactive =
    value !== null &&
    state.status === "ready" &&
    !terms.some((t) => t.id === value.id);

  function select(term: TermRef) {
    onChange(term);
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            id={triggerId}
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              invalid && "border-destructive",
            )}
          >
            <span
              className={cn(
                "flex min-w-0 items-center gap-2 truncate",
                !value && "text-muted-foreground",
              )}
            >
              <span className="truncate">{value ? value.label : placeholderText}</span>
              {referencedButInactive && (
                <Badge variant="outline" className="shrink-0 text-[11px]">
                  Inactive
                </Badge>
              )}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[16rem]"
          align="start"
        >
          {mode === "create" ? (
            <CreateTermPanel
              vocabularySlug={vocabularySlug}
              vocabularyLabel={vocabularyLabel ?? vocabularySlug}
              initialLabel={query}
              onCancel={() => setMode("list")}
              onCreated={(term) => {
                setState((prev) =>
                  prev.status === "ready"
                    ? { status: "ready", terms: [...prev.terms, term] }
                    : prev,
                );
                onChange(term);
                toast({ variant: "success", title: "Term added." });
                setOpen(false);
              }}
              onForbidden={() => {
                toast({
                  variant: "destructive",
                  title: "Only an administrator can add taxonomy terms.",
                });
                setMode("list");
              }}
            />
          ) : state.status === "loading" ? (
            <div className="flex flex-col gap-1 p-2">
              <Skeleton className="mb-1 h-8 w-full" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          ) : state.status === "error" ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <AlertCircle className="h-5 w-5 text-[var(--status-danger)]" />
              <p className="text-sm text-muted-foreground">Couldn&apos;t load terms.</p>
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            </div>
          ) : terms.length === 0 ? (
            <div className="flex flex-col gap-3 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {canCreateTerm
                  ? "No terms yet. Create the first one below."
                  : "No terms yet. Ask an administrator to add one in Site Settings."}
              </p>
              {canCreateTerm && (
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setQuery("");
                    setMode("create");
                  }}
                >
                  <Plus className="h-4 w-4" /> Create the first term
                </Button>
              )}
            </div>
          ) : (
            <Command>
              <CommandInput
                placeholder="Search terms…"
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>No terms match “{query}”.</CommandEmpty>
                <CommandGroup>
                  {terms.map((term) => (
                    <CommandItem
                      key={term.id}
                      value={term.label}
                      onSelect={() => select(term)}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value?.id === term.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{term.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              {canCreateTerm && (
                <div className="border-t border-border p-1">
                  <button
                    type="button"
                    onClick={() => setMode("create")}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Plus className="h-4 w-4" />
                    {query.trim() ? `Create “${query.trim()}”` : "Add new term"}
                  </button>
                </div>
              )}
            </Command>
          )}
        </PopoverContent>
      </Popover>

      {value && !required && !disabled && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear selection"
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function CreateTermPanel({
  vocabularySlug,
  vocabularyLabel,
  initialLabel,
  onCreated,
  onCancel,
  onForbidden,
}: {
  vocabularySlug: string;
  vocabularyLabel: string;
  initialLabel: string;
  onCreated: (term: TermRef) => void;
  onCancel: () => void;
  onForbidden: () => void;
}) {
  const [label, setLabel] = React.useState(initialLabel);
  const [slug, setSlug] = React.useState(slugify(initialLabel));
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function onLabelChange(next: string) {
    setLabel(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!label.trim()) {
      setError("Enter a term name.");
      return;
    }
    if (!TERM_SLUG_RE.test(slug)) {
      setError("Use lowercase letters, numbers, and hyphens.");
      return;
    }
    setBusy(true);
    const result = await createTermForFieldAction(vocabularySlug, {
      label: label.trim(),
      slug,
    });
    setBusy(false);
    if (result.ok) {
      onCreated(result.term);
    } else if (result.reason === "forbidden") {
      onForbidden();
    } else {
      setError(result.message ?? "Couldn't create the term. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-3">
      <p className="text-sm font-medium">Add a term to {vocabularyLabel}</p>
      {error && (
        <p role="alert" className="text-[13px] font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-term-label">Term name</Label>
        <Input
          id="new-term-label"
          value={label}
          autoFocus
          disabled={busy}
          onChange={(e) => onLabelChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-term-slug">Slug</Label>
        <Input
          id="new-term-slug"
          value={slug}
          disabled={busy}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Creating…" : "Create"}
        </Button>
      </div>
    </form>
  );
}
