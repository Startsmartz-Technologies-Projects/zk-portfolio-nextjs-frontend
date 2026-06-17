"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ImageIcon, Loader2, Wand2, X } from "lucide-react";

import {
  resolveSeoMeta,
  type SeoDefaults,
  type SeoMeta,
  type SeoRecordContext,
} from "@/lib/seo/seo-meta";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useMediaPicker } from "@/src/components/admin/media/media-picker-provider";

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

/** Code-point length (not bytes) so Bangla measures correctly (edge 11). */
function charCount(s: string | undefined | null): number {
  return s ? [...s].length : 0;
}

function basicSlugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface SeoFieldNames {
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: string;
}

export interface SeoSidebarProps {
  /** RHF field paths; sensible defaults under a `seo.*` group + top-level `slug`. */
  names?: SeoFieldNames;
  /** Site defaults from SeoSettings (host fetches — draft per §14). Drives the fallback chain. */
  defaults: SeoDefaults;
  /** Live record fallbacks (host keeps current as the title field changes). */
  record?: SeoRecordContext;
  metadataBase: string;
  /** Collection segment for the preview URL, e.g. "projects". */
  collectionPath?: string;
  /** Pages use a fixed seeded path — hide the slug field (ADR 0003 §2). */
  pagesMode?: boolean;
  /** Show the slug-change redirect notice (already-published record). */
  isPublished?: boolean;
  /** Host-module slug uniqueness check (the resolve/301 is the module's). */
  onCheckSlug?: (slug: string) => Promise<"available" | "taken">;
  /** Thumbnail URL for an already-set og_image (host resolves the id). */
  initialOgImageUrl?: string | null;
  className?: string;
}

export function SeoSidebar({
  names,
  defaults,
  record = {},
  metadataBase,
  collectionPath,
  pagesMode = false,
  isPublished = false,
  onCheckSlug,
  initialOgImageUrl = null,
  className,
}: SeoSidebarProps) {
  const { control, register, setValue } = useFormContext();
  const pick = useMediaPicker();

  const N = {
    slug: names?.slug ?? "slug",
    metaTitle: names?.metaTitle ?? "seo.metaTitle",
    metaDescription: names?.metaDescription ?? "seo.metaDescription",
    canonicalUrl: names?.canonicalUrl ?? "seo.canonicalUrl",
    ogImage: names?.ogImage ?? "seo.ogImage",
    ogTitle: names?.ogTitle ?? "seo.ogTitle",
    ogDescription: names?.ogDescription ?? "seo.ogDescription",
    noindex: names?.noindex ?? "seo.noindex",
  };

  const slug = useWatch({ control, name: N.slug }) as string | undefined;
  const metaTitle = useWatch({ control, name: N.metaTitle }) as string | undefined;
  const metaDescription = useWatch({ control, name: N.metaDescription }) as string | undefined;
  const canonicalUrl = useWatch({ control, name: N.canonicalUrl }) as string | undefined;
  const ogImage = useWatch({ control, name: N.ogImage }) as string | undefined;
  const ogTitle = useWatch({ control, name: N.ogTitle }) as string | undefined;
  const ogDescription = useWatch({ control, name: N.ogDescription }) as string | undefined;
  const noindex = Boolean(useWatch({ control, name: N.noindex }));

  const [ogUrl, setOgUrl] = React.useState<string | null>(initialOgImageUrl);
  const [slugStatus, setSlugStatus] = React.useState<"idle" | "checking" | "available" | "taken">("idle");
  const [slugChanged, setSlugChanged] = React.useState(false);

  const meta: SeoMeta = {
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    ogTitle,
    ogDescription,
    noindex,
  };
  const resolved = resolveSeoMeta(meta, record, defaults);

  const previewUrl = `${metadataBase.replace(/\/$/, "")}${collectionPath ? `/${collectionPath}` : ""}${slug ? `/${slug}` : ""}`;

  // Debounced slug uniqueness check (the host module owns the check).
  React.useEffect(() => {
    if (!onCheckSlug || !slug) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    const t = setTimeout(async () => {
      try {
        setSlugStatus(await onCheckSlug(slug));
      } catch {
        setSlugStatus("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [slug, onCheckSlug]);

  async function pickOgImage() {
    const result = await pick({ resourceType: "image", title: "Choose a social image" });
    if (result && result[0]) {
      setValue(N.ogImage, result[0].id, { shouldDirty: true });
      setOgUrl(result[0].url);
    }
  }

  function clearOgImage() {
    setValue(N.ogImage, null, { shouldDirty: true });
    setOgUrl(null);
  }

  return (
    <section aria-label="SEO" className={cn("flex flex-col gap-4 rounded-[10px] border border-border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold">SEO</h3>
        <Badge variant={noindex ? "warning" : "outline"}>{noindex ? "No-index" : "Indexed"}</Badge>
      </div>

      {/* Search preview */}
      <div className="flex flex-col gap-1 rounded-md border border-border bg-background p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Search preview</p>
        <p className="truncate text-[15px] text-[#1a0dab]">{resolved.title}</p>
        <p className="truncate text-[12px] text-[#006621]">{previewUrl}</p>
        <p className="line-clamp-2 text-[13px] text-muted-foreground">{resolved.description}</p>
      </div>

      {/* Slug */}
      {!pagesMode && (
        <Field label="Slug" htmlFor="seo-slug" helper="Used in the page URL. Changing a published slug adds a 301 redirect.">
          <div className="flex gap-2">
            <Input
              id="seo-slug"
              {...register(N.slug, {
                onChange: () => {
                  if (isPublished) setSlugChanged(true);
                },
              })}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (record.title) setValue(N.slug, basicSlugify(record.title), { shouldDirty: true });
              }}
              title="Generate from title"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
          <div aria-live="polite" className="min-h-[1rem] text-[12px]">
            {slugStatus === "checking" && <span className="text-muted-foreground">Checking availability…</span>}
            {slugStatus === "available" && <span className="text-[var(--status-published)]">Available.</span>}
            {slugStatus === "taken" && <span className="text-destructive">This slug is already used. Choose another.</span>}
          </div>
          {isPublished && slugChanged && (
            <p className="text-[12px] text-[var(--status-warning)]">
              Changing this slug will redirect the old URL (301) to the new one.
            </p>
          )}
        </Field>
      )}

      {/* Meta title */}
      <Field label="Meta title" htmlFor="seo-meta-title">
        <Input id="seo-meta-title" {...register(N.metaTitle)} aria-describedby="seo-meta-title-meter" />
        <Meter id="seo-meta-title-meter" count={charCount(metaTitle)} max={META_TITLE_MAX} over="Over the recommended 60 characters — may be truncated in search." />
        {!metaTitle?.trim() && <Fallback>Falls back to: {resolved.title}</Fallback>}
      </Field>

      {/* Meta description */}
      <Field label="Meta description" htmlFor="seo-meta-desc">
        <textarea
          id="seo-meta-desc"
          rows={3}
          {...register(N.metaDescription)}
          aria-describedby="seo-meta-desc-meter"
          className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Meter id="seo-meta-desc-meter" count={charCount(metaDescription)} max={META_DESC_MAX} over="Over the recommended 160 characters." />
        {!metaDescription?.trim() && <Fallback>Falls back to: {resolved.description}</Fallback>}
      </Field>

      {/* Social card preview */}
      <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Social card preview</p>
        <div className="overflow-hidden rounded-md border border-border">
          <div className="flex aspect-[1.91/1] items-center justify-center bg-secondary/40">
            {ogUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ogUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageIcon className="h-7 w-7" />
                <span className="text-[11px]">
                  {defaults.defaultOgImageId ? "Falls back to site default" : "No site default social image is set."}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5 p-2">
            <span className="truncate text-[12px] text-muted-foreground">{metadataBase.replace(/^https?:\/\//, "")}</span>
            <span className="truncate text-[13px] font-semibold">{resolved.ogTitle}</span>
            <span className="line-clamp-2 text-[12px] text-muted-foreground">{resolved.ogDescription}</span>
          </div>
        </div>
      </div>

      {/* OG image */}
      <Field label="Social image (OG)" htmlFor="seo-og-image">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={pickOgImage} className="gap-1">
            <ImageIcon className="h-4 w-4" /> {ogImage ? "Replace" : "Choose image"}
          </Button>
          {ogImage && (
            <Button type="button" variant="ghost" size="sm" onClick={clearOgImage} aria-label="Clear social image">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!ogImage && <Fallback>Falls back to the record cover, then the site default image.</Fallback>}
      </Field>

      {/* OG title / description */}
      <Field label="Social title (OG)" htmlFor="seo-og-title">
        <Input id="seo-og-title" {...register(N.ogTitle)} />
        {!ogTitle?.trim() && <Fallback>Falls back to: {resolved.ogTitle}</Fallback>}
      </Field>
      <Field label="Social description (OG)" htmlFor="seo-og-desc">
        <textarea
          id="seo-og-desc"
          rows={2}
          {...register(N.ogDescription)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {!ogDescription?.trim() && <Fallback>Falls back to: {resolved.ogDescription}</Fallback>}
      </Field>

      {/* Canonical */}
      <Field label="Canonical URL" htmlFor="seo-canonical" helper="Leave empty to use this page's own URL.">
        <Input id="seo-canonical" type="url" placeholder="https://…" {...register(N.canonicalUrl)} />
      </Field>

      {/* noindex */}
      <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
        <div className="flex flex-col">
          <Label htmlFor="seo-noindex">Hide from search engines</Label>
          <span className="text-[12px] text-muted-foreground">
            Hides this page from search engines and removes it from the sitemap.
          </span>
        </div>
        <button
          id="seo-noindex"
          type="button"
          role="switch"
          aria-checked={noindex}
          onClick={() => setValue(N.noindex, !noindex, { shouldDirty: true })}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            noindex ? "bg-primary" : "bg-input",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              noindex ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {helper && <p className="text-[12px] text-muted-foreground">{helper}</p>}
    </div>
  );
}

function Meter({ id, count, max, over }: { id: string; count: number; max: number; over: string }) {
  const isOver = count > max;
  return (
    <div id={id} className="flex flex-col gap-0.5">
      <span aria-live="polite" className={cn("text-[12px] tabular-nums", isOver ? "text-[var(--status-warning)]" : "text-muted-foreground")}>
        {count}/{max}
      </span>
      {isOver && <span className="text-[12px] text-[var(--status-warning)]">{over}</span>}
    </div>
  );
}

function Fallback({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] italic text-muted-foreground">{children}</p>;
}
