import { z } from "zod";

import {
  emptySeo,
  seoFormSchema,
  seoFromDetail,
  seoToInput,
  type SeoFormValues,
} from "@/src/components/admin/shared/seo-form-fields";
import type { ServiceDetail } from "./types";

// Service editor form model (clones the Projects editor shape). Plain non-optional
// fields (no .default) so the Zod input/output match for the RHF resolver. Mappers
// convert to/from the snake_case server create/update input (services-be-2).

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const mediaPick = z.object({ id: z.string(), url: z.string().nullable() }).nullable();
const scalar = z.object({ value: z.string() });

const metaRow = z.object({ key: z.string(), value: z.string() });
const scopeRow = z.object({ icon: z.string(), title: z.string().min(1, "Enter a title."), body: z.string() });
const processRow = z.object({ tag: z.string(), title: z.string().min(1, "Enter a title."), body: z.string() });
const benefitRow = z.object({ icon: z.string(), title: z.string().min(1, "Enter a title."), body: z.string() });
const machineRow = z.object({ title: z.string().min(1, "Enter a title."), description: z.string() });
const faqRow = z.object({ question: z.string().min(1, "Enter a question."), answer: z.string() });

export const serviceFormSchema = z.object({
  title: z.string().min(1, "Enter a service title.").max(160),
  slug: z.string().regex(SLUG_RE, "That slug is taken — try another.").or(z.literal("")),
  subtitle: z.string(),
  icon: z.string(),
  hero: mediaPick,
  machineImage: mediaPick,
  ctaImage: mediaPick,

  overviewTitle: z.string(),
  overviewLead: z.string(),
  overviewBody: z.array(scalar),
  overviewBullets: z.array(scalar),

  scopeTitle: z.string(),
  scopeLead: z.string(),
  processTitle: z.string(),
  processLead: z.string(),
  benefitsTitle: z.string(),
  benefitsLead: z.string(),
  capabilityTitle: z.string(),
  capabilityLead: z.string(),
  capabilityBodyTitle: z.string(),
  capabilityBodyDesc: z.string(),
  faqTitle: z.string(),
  faqLead: z.string(),

  meta: z.array(metaRow),
  scope: z.array(scopeRow),
  process: z.array(processRow),
  benefits: z.array(benefitRow),
  machine: z.array(machineRow),
  faq: z.array(faqRow),

  seo: seoFormSchema,
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export function emptyForm(): ServiceFormValues {
  return {
    title: "",
    slug: "",
    subtitle: "",
    icon: "",
    hero: null,
    machineImage: null,
    ctaImage: null,
    overviewTitle: "",
    overviewLead: "",
    overviewBody: [],
    overviewBullets: [],
    scopeTitle: "",
    scopeLead: "",
    processTitle: "",
    processLead: "",
    benefitsTitle: "",
    benefitsLead: "",
    capabilityTitle: "",
    capabilityLead: "",
    capabilityBodyTitle: "",
    capabilityBodyDesc: "",
    faqTitle: "",
    faqLead: "",
    meta: [],
    scope: [],
    process: [],
    benefits: [],
    machine: [],
    faq: [],
    seo: emptySeo(),
  };
}

function refUrl(m: { url: string } | { withdrawn: true } | null): string | null {
  if (!m) return null;
  return "url" in m ? m.url : null;
}

export function fromDetail(s: ServiceDetail): ServiceFormValues {
  return {
    title: s.title,
    slug: s.slug,
    subtitle: s.subtitle ?? "",
    icon: s.icon ?? "",
    hero: s.hero_image ? { id: s.hero_image.id, url: refUrl(s.hero_image) } : null,
    machineImage: s.machine_image ? { id: s.machine_image.id, url: refUrl(s.machine_image) } : null,
    ctaImage: s.cta_image ? { id: s.cta_image.id, url: refUrl(s.cta_image) } : null,
    overviewTitle: s.overview_title ?? "",
    overviewLead: s.overview_lead ?? "",
    overviewBody: (s.overview_body ?? []).map((value) => ({ value })),
    overviewBullets: (s.overview_bullets ?? []).map((value) => ({ value })),
    scopeTitle: s.scope_title ?? "",
    scopeLead: s.scope_lead ?? "",
    processTitle: s.process_title ?? "",
    processLead: s.process_lead ?? "",
    benefitsTitle: s.benefits_title ?? "",
    benefitsLead: s.benefits_lead ?? "",
    capabilityTitle: s.capability_title ?? "",
    capabilityLead: s.capability_lead ?? "",
    capabilityBodyTitle: s.capability_body_title ?? "",
    capabilityBodyDesc: s.capability_body_desc ?? "",
    faqTitle: s.faq_title ?? "",
    faqLead: s.faq_lead ?? "",
    meta: s.meta.map((m) => ({ key: m.key, value: m.value })),
    scope: s.scope.map((r) => ({ icon: r.icon ?? "", title: r.title, body: r.body ?? "" })),
    process: s.process.map((r) => ({ tag: r.tag ?? "", title: r.title, body: r.body ?? "" })),
    benefits: s.benefits.map((r) => ({ icon: r.icon ?? "", title: r.title, body: r.body ?? "" })),
    machine: s.machine.map((r) => ({ title: r.title, description: r.description ?? "" })),
    faq: s.faq.map((r) => ({ question: r.question, answer: r.answer ?? "" })),
    seo: seoFromDetail(s.seo),
  };
}

const blank = (s: string): string | null => (s.trim() ? s.trim() : null);

export function toServerInput(v: ServiceFormValues) {
  return {
    title: v.title.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    subtitle: blank(v.subtitle),
    icon: blank(v.icon),
    hero_image_id: v.hero?.id ?? null,
    machine_image_id: v.machineImage?.id ?? null,
    cta_image_id: v.ctaImage?.id ?? null,
    overview_title: blank(v.overviewTitle),
    overview_lead: blank(v.overviewLead),
    overview_body: v.overviewBody.map((r) => r.value).filter((s) => s.trim()),
    overview_bullets: v.overviewBullets.map((r) => r.value).filter((s) => s.trim()),
    scope_title: blank(v.scopeTitle),
    scope_lead: blank(v.scopeLead),
    process_title: blank(v.processTitle),
    process_lead: blank(v.processLead),
    benefits_title: blank(v.benefitsTitle),
    benefits_lead: blank(v.benefitsLead),
    capability_title: blank(v.capabilityTitle),
    capability_lead: blank(v.capabilityLead),
    capability_body_title: blank(v.capabilityBodyTitle),
    capability_body_desc: blank(v.capabilityBodyDesc),
    faq_title: blank(v.faqTitle),
    faq_lead: blank(v.faqLead),
    meta: v.meta.filter((m) => m.key.trim() && m.value.trim()),
    scope: v.scope.map((r) => ({ icon: blank(r.icon), title: r.title, body: blank(r.body) })),
    process: v.process.map((r) => ({ tag: blank(r.tag), title: r.title, body: blank(r.body) })),
    benefits: v.benefits.map((r) => ({ icon: blank(r.icon), title: r.title, body: blank(r.body) })),
    machine: v.machine.map((r) => ({ title: r.title, description: blank(r.description) })),
    faq: v.faq.map((r) => ({ question: r.question, answer: blank(r.answer) })),
    seo: seoToInput(v.seo),
  };
}

export type { SeoFormValues };
