import { z } from "zod";

import type { CertDetail } from "./types";

// Certification editor form model. No SEO embed (certs have no public detail page —
// slug lives in Basics for the ?preview= deep-link). Plain non-optional fields so the
// Zod input/output match for the RHF resolver.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const termRef = z.object({ id: z.string(), slug: z.string(), label: z.string() }).nullable();
const mediaPick = z.object({ id: z.string(), url: z.string().nullable() }).nullable();

export const certFormSchema = z
  .object({
    title: z.string().min(1, "Enter a title.").max(200),
    slug: z.string().regex(SLUG_RE, "That slug is taken — try another.").or(z.literal("")),
    authority: z.string(),
    number: z.string(),
    category: termRef,
    status: z.enum(["Active", "Completed", "Expired", "Renewed"]),
    issuedDate: z.string(),
    expiryDate: z.string(),
    description: z.string(),
    document: mediaPick,
    tone: z.enum(["paper", "slate", "cream"]),
    sealShape: z.enum(["round", "hex"]),
    showOnHome: z.boolean(),
    sealLabel: z.string(),
    sealId: z.string(),
    sealValidity: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.issuedDate && v.expiryDate && v.expiryDate < v.issuedDate) {
      ctx.addIssue({ path: ["expiryDate"], code: z.ZodIssueCode.custom, message: "Expiry can't be before the issued date." });
    }
    if (v.showOnHome && !v.sealLabel.trim()) {
      ctx.addIssue({ path: ["sealLabel"], code: z.ZodIssueCode.custom, message: "A seal label is required to show on home." });
    }
  });

export type CertFormValues = z.infer<typeof certFormSchema>;

export function emptyForm(): CertFormValues {
  return {
    title: "",
    slug: "",
    authority: "",
    number: "",
    category: null,
    status: "Active",
    issuedDate: "",
    expiryDate: "",
    description: "",
    document: null,
    tone: "paper",
    sealShape: "round",
    showOnHome: false,
    sealLabel: "",
    sealId: "",
    sealValidity: "",
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

export function fromDetail(c: CertDetail): CertFormValues {
  return {
    title: c.title,
    slug: c.slug,
    authority: c.authority ?? "",
    number: c.number ?? "",
    category: c.category ? { id: c.category.id, slug: c.category.slug, label: c.category.label } : null,
    status: c.status,
    issuedDate: dateInput(c.issued_date),
    expiryDate: dateInput(c.expiry_date),
    description: c.description ?? "",
    document: c.document ? { id: c.document.id, url: refUrl(c.document) } : null,
    tone: c.tone,
    sealShape: c.seal_shape,
    showOnHome: c.show_on_home,
    sealLabel: c.seal_label ?? "",
    sealId: c.seal_id ?? "",
    sealValidity: c.seal_validity ?? "",
  };
}

const blank = (s: string): string | null => (s.trim() ? s.trim() : null);

export function toServerInput(v: CertFormValues) {
  return {
    title: v.title.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    authority: blank(v.authority),
    number: blank(v.number),
    category_id: v.category?.id ?? null,
    status: v.status,
    issued_date: v.issuedDate || null,
    expiry_date: v.expiryDate || null,
    description: blank(v.description),
    document_id: v.document?.id ?? null,
    tone: v.tone,
    seal_shape: v.sealShape,
    show_on_home: v.showOnHome,
    seal_label: blank(v.sealLabel),
    seal_id: blank(v.sealId),
    seal_validity: blank(v.sealValidity),
  };
}
