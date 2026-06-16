import { z } from "zod";

import {
  emptySeo,
  seoFormSchema,
  seoFromDetail,
  seoToInput,
} from "@/src/components/admin/shared/seo-form-fields";
import type { ConcernDetail } from "./types";

// Concern profile editor form model. Identity + overview paragraphs + seven repeatable
// profile sections + SEO. No taxonomy, no block-editor. The `default` flag is set via a
// dedicated action (list / publish rail), so it's not a form field here.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const mediaPick = z.object({ id: z.string(), url: z.string().nullable() }).nullable();
const scalar = z.object({ value: z.string() });

const factRow = z.object({ big: z.string().min(1, "Required."), label: z.string().min(1, "Required."), sub: z.string() });
const serviceRow = z.object({ icon: z.string(), title: z.string().min(1, "Required."), copy: z.string() });
const whyRow = z.object({ number: z.string(), title: z.string().min(1, "Required."), copy: z.string() });
const showcaseRow = z.object({ title: z.string().min(1, "Required."), location: z.string(), category: z.string(), summary: z.string(), image: mediaPick });
const processRow = z.object({ step: z.string(), title: z.string().min(1, "Required."), copy: z.string() });
const galleryRow = z.object({ media_id: z.string(), url: z.string().nullable(), caption: z.string() });
const faqRow = z.object({ question: z.string().min(1, "Required."), answer: z.string() });

const currentYear = new Date().getFullYear();

export const concernFormSchema = z.object({
  name: z.string().min(1, "Enter a concern name.").max(160),
  slug: z.string().regex(SLUG_RE, "That slug is taken — try another.").or(z.literal("")),
  short: z.string(),
  tagline: z.string(),
  intro: z.string(),
  establishedYear: z.string(), // numeric text; empty allowed
  code: z.string(),
  hero: mediaPick,
  overviewTitle: z.string(),
  overviewBody: z.array(scalar),
  overviewMission: z.string(),
  facts: z.array(factRow),
  services: z.array(serviceRow),
  why: z.array(whyRow),
  showcase: z.array(showcaseRow),
  process: z.array(processRow),
  gallery: z.array(galleryRow),
  faqs: z.array(faqRow),
  seo: seoFormSchema,
}).superRefine((v, ctx) => {
  if (v.establishedYear.trim()) {
    const n = Number(v.establishedYear);
    if (!Number.isInteger(n) || n < 1900 || n > currentYear) {
      ctx.addIssue({ path: ["establishedYear"], code: z.ZodIssueCode.custom, message: `Enter a year between 1900 and ${currentYear}.` });
    }
  }
});

export type ConcernFormValues = z.infer<typeof concernFormSchema>;

export function emptyForm(): ConcernFormValues {
  return {
    name: "",
    slug: "",
    short: "",
    tagline: "",
    intro: "",
    establishedYear: "",
    code: "",
    hero: null,
    overviewTitle: "",
    overviewBody: [],
    overviewMission: "",
    facts: [],
    services: [],
    why: [],
    showcase: [],
    process: [],
    gallery: [],
    faqs: [],
    seo: emptySeo(),
  };
}

function refUrl(m: { url: string } | { withdrawn: true } | null): string | null {
  if (!m) return null;
  return "url" in m ? m.url : null;
}

export function fromDetail(c: ConcernDetail): ConcernFormValues {
  return {
    name: c.name,
    slug: c.slug,
    short: c.short ?? "",
    tagline: c.tagline ?? "",
    intro: c.intro ?? "",
    establishedYear: c.established_year != null ? String(c.established_year) : "",
    code: c.code ?? "",
    hero: c.hero_image ? { id: c.hero_image.id, url: refUrl(c.hero_image) } : null,
    overviewTitle: c.overview_title ?? "",
    overviewBody: (c.overview_body ?? []).map((value) => ({ value })),
    overviewMission: c.overview_mission ?? "",
    facts: c.facts.map((r) => ({ big: r.big, label: r.label, sub: r.sub ?? "" })),
    services: c.services.map((r) => ({ icon: r.icon ?? "", title: r.title, copy: r.copy ?? "" })),
    why: c.why.map((r) => ({ number: r.number ?? "", title: r.title, copy: r.copy ?? "" })),
    showcase: c.showcase.map((r) => ({
      title: r.title,
      location: r.location ?? "",
      category: r.category ?? "",
      summary: r.summary ?? "",
      image: r.image ? { id: r.image.id, url: refUrl(r.image) } : null,
    })),
    process: c.process.map((r) => ({ step: r.step ?? "", title: r.title, copy: r.copy ?? "" })),
    gallery: c.gallery.map((g) => ({ media_id: g.image.id, url: refUrl(g.image), caption: g.caption ?? "" })),
    faqs: c.faqs.map((r) => ({ question: r.question, answer: r.answer ?? "" })),
    seo: seoFromDetail(c.seo),
  };
}

const blank = (s: string): string | null => (s.trim() ? s.trim() : null);

export function toServerInput(v: ConcernFormValues) {
  return {
    name: v.name.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    short: blank(v.short),
    tagline: blank(v.tagline),
    intro: blank(v.intro),
    established_year: v.establishedYear.trim() ? Number(v.establishedYear) : null,
    code: blank(v.code),
    hero_image_id: v.hero?.id ?? null,
    overview_title: blank(v.overviewTitle),
    overview_body: v.overviewBody.map((r) => r.value).filter((s) => s.trim()),
    overview_mission: blank(v.overviewMission),
    facts: v.facts.map((r) => ({ big: r.big, label: r.label, sub: blank(r.sub) })),
    services: v.services.map((r) => ({ icon: blank(r.icon), title: r.title, copy: blank(r.copy) })),
    why: v.why.map((r) => ({ number: blank(r.number), title: r.title, copy: blank(r.copy) })),
    showcase: v.showcase.map((r) => ({
      title: r.title,
      location: blank(r.location),
      category: blank(r.category),
      summary: blank(r.summary),
      image_id: r.image?.id ?? null,
    })),
    process: v.process.map((r) => ({ step: blank(r.step), title: r.title, copy: blank(r.copy) })),
    gallery: v.gallery.map((g) => ({ media_id: g.media_id, caption: blank(g.caption) })),
    faqs: v.faqs.map((r) => ({ question: r.question, answer: blank(r.answer) })),
    seo: seoToInput(v.seo),
  };
}
