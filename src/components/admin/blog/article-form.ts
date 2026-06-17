import { z } from "zod";

import type { BlockEditorValue } from "@/src/components/admin/block-editor/block-editor";
import type { BlogBody } from "@/src/components/admin/block-editor/types";
import {
  emptySeo,
  seoFormSchema,
  seoFromDetail,
  seoToInput,
} from "@/src/components/admin/shared/seo-form-fields";
import type { ArticleDetail } from "./types";

// Blog article editor form model. The Body tab is the block-editor (nested, blog mode);
// its value (lead + { sections }) maps directly to body_lead + body on the server.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const termRef = z.object({ id: z.string(), slug: z.string(), label: z.string() }).nullable();
const mediaPick = z.object({ id: z.string(), url: z.string().nullable() }).nullable();

// The block-editor value is validated structurally by the server's bodyDocSchema; in the
// form we keep it as an opaque object the block-editor controls (lead + body document).
const blockValueSchema = z.object({
  lead: z.string(),
  body: z.any(),
});

export const articleFormSchema = z.object({
  title: z.string().min(1, "Enter an article title.").max(200),
  slug: z.string().regex(SLUG_RE, "That slug is taken — try another.").or(z.literal("")),
  excerpt: z.string().max(320, "Keep the excerpt under 320 characters."),
  category: termRef,
  tags: z.array(z.string()),
  cover: mediaPick,
  articleDate: z.string(), // yyyy-mm-dd
  featured: z.boolean(),
  authorName: z.string(),
  authorRole: z.string(),
  authorBio: z.string(),
  block: blockValueSchema,
  seo: seoFormSchema,
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export function emptyBlock(): BlockEditorValue {
  const body: BlogBody = { sections: [] };
  return { lead: "", body };
}

export function emptyForm(): ArticleFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: null,
    tags: [],
    cover: null,
    articleDate: "",
    featured: false,
    authorName: "",
    authorRole: "",
    authorBio: "",
    block: emptyBlock(),
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

export function fromDetail(a: ArticleDetail): ArticleFormValues {
  const bodyRaw = (a.body ?? null) as BlogBody | null;
  return {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? "",
    category: a.category ? { id: a.category.id, slug: a.category.slug, label: a.category.label } : null,
    tags: a.tags ?? [],
    cover: a.cover_image ? { id: a.cover_image.id, url: refUrl(a.cover_image) } : null,
    articleDate: dateInput(a.article_date),
    featured: a.featured,
    authorName: a.author_name ?? "",
    authorRole: a.author_role ?? "",
    authorBio: a.author_bio ?? "",
    block: {
      lead: a.body_lead ?? "",
      body: { sections: bodyRaw?.sections ?? [] },
    },
    seo: seoFromDetail(a.seo),
  };
}

const blank = (s: string): string | null => (s.trim() ? s.trim() : null);

export function toServerInput(v: ArticleFormValues) {
  return {
    title: v.title.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    excerpt: blank(v.excerpt),
    category_id: v.category?.id ?? null,
    tags: v.tags.map((t) => t.trim()).filter(Boolean),
    cover_image_id: v.cover?.id ?? null,
    article_date: v.articleDate || null,
    featured: v.featured,
    author_name: blank(v.authorName),
    author_role: blank(v.authorRole),
    author_bio: blank(v.authorBio),
    body_lead: blank(v.block.lead),
    body: v.block.body,
    seo: seoToInput(v.seo),
  };
}
