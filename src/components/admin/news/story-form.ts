import { z } from "zod";

import type { BlockEditorValue } from "@/src/components/admin/block-editor/block-editor";
import type { NewsBody } from "@/src/components/admin/block-editor/types";
import {
  emptySeo,
  seoFormSchema,
  seoFromDetail,
  seoToInput,
} from "@/src/components/admin/shared/seo-form-fields";
import type { StoryDetail } from "./types";

// News story editor form model. Body = the block-editor in flat (news) mode; its
// { lead, body:{blocks} } maps to body_lead + body. Gallery is a media-backed
// repeatable group (≤20). No author field (byline is the SITE default — BR-9).

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const termRef = z.object({ id: z.string(), slug: z.string(), label: z.string() }).nullable();
const mediaPick = z.object({ id: z.string(), url: z.string().nullable() }).nullable();
const galleryItem = z.object({ media_id: z.string(), url: z.string().nullable(), caption: z.string() });

export const storyFormSchema = z.object({
  title: z.string().min(1, "Enter a story title.").max(200),
  slug: z.string().regex(SLUG_RE, "That slug is taken — try another.").or(z.literal("")),
  excerpt: z.string().max(320, "Keep the excerpt under 320 characters."),
  category: termRef,
  tags: z.array(z.string()),
  cover: mediaPick,
  articleDate: z.string(),
  featured: z.boolean(),
  block: z.object({ lead: z.string(), body: z.any() }),
  gallery: z.array(galleryItem).max(20, "Up to 20 gallery images."),
  seo: seoFormSchema,
});

export type StoryFormValues = z.infer<typeof storyFormSchema>;

export function emptyBlock(): BlockEditorValue {
  const body: NewsBody = { blocks: [] };
  return { lead: "", body };
}

export function emptyForm(): StoryFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: null,
    tags: [],
    cover: null,
    articleDate: "",
    featured: false,
    block: emptyBlock(),
    gallery: [],
    seo: emptySeo(),
  };
}

function dateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}
function refUrl(m: { url: string } | { withdrawn: true } | null): string | null {
  if (!m) return null;
  return "url" in m ? m.url : null;
}

export function fromDetail(s: StoryDetail): StoryFormValues {
  const bodyRaw = (s.body ?? null) as NewsBody | null;
  return {
    title: s.title,
    slug: s.slug,
    excerpt: s.excerpt ?? "",
    category: s.category ? { id: s.category.id, slug: s.category.slug, label: s.category.label } : null,
    tags: s.tags ?? [],
    cover: s.cover_image ? { id: s.cover_image.id, url: refUrl(s.cover_image) } : null,
    articleDate: dateInput(s.article_date),
    featured: s.featured,
    block: { lead: s.body_lead ?? "", body: { blocks: bodyRaw?.blocks ?? [] } },
    gallery: s.gallery.map((g) => ({ media_id: g.media.id, url: refUrl(g.media), caption: g.caption ?? "" })),
    seo: seoFromDetail(s.seo),
  };
}

const blank = (s: string): string | null => (s.trim() ? s.trim() : null);

export function toServerInput(v: StoryFormValues) {
  return {
    title: v.title.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    excerpt: blank(v.excerpt),
    category_id: v.category?.id ?? null,
    tags: v.tags.map((t) => t.trim()).filter(Boolean),
    cover_image_id: v.cover?.id ?? null,
    article_date: v.articleDate || null,
    featured: v.featured,
    body_lead: blank(v.block.lead),
    body: v.block.body,
    gallery: v.gallery.map((g) => ({ media_id: g.media_id, caption: blank(g.caption) })),
    seo: seoToInput(v.seo),
  };
}
