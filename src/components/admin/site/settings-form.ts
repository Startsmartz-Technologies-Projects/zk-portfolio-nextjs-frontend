import { z } from "zod";
import type { SettingType } from "@prisma/client";

// Client form schemas + mappers for the Site Settings editor (site-admin-settings,
// Admin Wave 4). Mirrors the server schemas in lib/validation/site (the server stays
// authoritative — FR-SITE-021); the data layer hands back camelCase Prisma rows, so the
// server page maps them to the plain `*Initial` shapes below before handing them here.

export const SOCIAL_PLATFORMS = ["facebook", "linkedin", "instagram", "youtube", "twitter", "other"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const STAT_UNITS = ["", "+", "%"] as const;

const thisYear = new Date().getFullYear();

// ── Profile (Profile + Contact + Social tabs all write the one CompanyProfile) ──

export const profileFormSchema = z.object({
  name: z.string().min(1, "Enter the company name."),
  legalName: z.string(),
  tagline: z.string(),
  brandDescription: z.string(),
  establishmentYear: z.coerce
    .number({ invalid_type_error: `Enter a year between 1900 and ${thisYear}.` })
    .int()
    .min(1900, `Enter a year between 1900 and ${thisYear}.`)
    .max(thisYear, `Enter a year between 1900 and ${thisYear}.`),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(1, "Use the international format, e.g. +8801791026074."),
  whatsapp: z
    .string()
    .refine((v) => v.trim() === "" || /^https?:\/\//.test(v.trim()), "Enter a valid WhatsApp link (https://…)."),
  officeAddress: z.string().min(1, "Enter the office address."),
  businessHours: z.string(),
  coverageSummary: z.string(),
  copyrightText: z.string().min(1, "Copyright text is required."),
  socials: z.array(
    z.object({
      platform: z.enum(["facebook", "linkedin", "instagram", "youtube", "twitter", "other"]),
      url: z.string().url("Enter a full https:// link (not '#')."),
    }),
  ),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export interface ProfileInitial {
  name: string;
  legalName: string | null;
  tagline: string | null;
  brandDescription: string | null;
  establishmentYear: number | null;
  email: string;
  phone: string;
  whatsapp: string | null;
  officeAddress: string;
  businessHours: string | null;
  coverageSummary: string | null;
  copyrightText: string;
  updatedAt: string | null;
  socials: { platform: SocialPlatform; url: string }[];
}

const blank = (s: string): string | null => {
  const t = s.trim();
  return t ? t : null;
};

export function toProfileForm(p: ProfileInitial | null): ProfileFormValues {
  return {
    name: p?.name ?? "",
    legalName: p?.legalName ?? "",
    tagline: p?.tagline ?? "",
    brandDescription: p?.brandDescription ?? "",
    establishmentYear: p?.establishmentYear ?? thisYear,
    email: p?.email ?? "",
    phone: p?.phone ?? "",
    whatsapp: p?.whatsapp ?? "",
    officeAddress: p?.officeAddress ?? "",
    businessHours: p?.businessHours ?? "",
    coverageSummary: p?.coverageSummary ?? "",
    copyrightText: p?.copyrightText ?? "",
    socials: (p?.socials ?? []).map((s) => ({ platform: s.platform, url: s.url })),
  };
}

export function toProfileInput(v: ProfileFormValues, expectedUpdatedAt: string | null) {
  return {
    name: v.name.trim(),
    legalName: blank(v.legalName),
    tagline: blank(v.tagline),
    brandDescription: blank(v.brandDescription),
    establishmentYear: v.establishmentYear,
    email: v.email.trim(),
    phone: v.phone.trim(),
    whatsapp: blank(v.whatsapp),
    officeAddress: v.officeAddress.trim(),
    businessHours: blank(v.businessHours),
    coverageSummary: blank(v.coverageSummary),
    copyrightText: v.copyrightText.trim(),
    socials: v.socials.map((s, i) => ({ platform: s.platform, url: s.url.trim(), position: i })),
    ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}),
  };
}

/** Derived "years of experience" preview (FR-SITE-010 — display only, never stored). */
export function yearsOfExperience(establishmentYear: number | null | undefined): number | null {
  if (!establishmentYear || establishmentYear < 1900 || establishmentYear > thisYear) return null;
  return thisYear - establishmentYear + 1;
}

// ── Brand assets ───────────────────────────────────────────────────────────

export interface BrandSlotValue {
  id: string;
  url: string;
  alt: string | null;
  altPresent: boolean;
}
export interface BrandInitial {
  logo_primary: BrandSlotValue | null;
  logo_footer: BrandSlotValue | null;
  favicon: BrandSlotValue | null;
  og_default: BrandSlotValue | null;
}
export type BrandFormValues = BrandInitial;

/** Save-blocked reasons for the Brand tab (FR-SITE-005/007 + the brandUpdateSchema required slots). */
export function brandSaveBlockers(b: BrandFormValues): string[] {
  const out: string[] = [];
  if (!b.logo_primary) out.push("Choose a primary logo.");
  else if (!b.logo_primary.altPresent) out.push("The primary logo needs alt text before it can be saved.");
  if (!b.logo_footer) out.push("Choose a footer logo.");
  else if (!b.logo_footer.altPresent) out.push("The footer logo needs alt text before it can be saved.");
  if (!b.favicon) out.push("Choose a favicon.");
  return out;
}

export function toBrandInput(b: BrandFormValues) {
  return {
    logoPrimaryId: b.logo_primary?.id ?? "",
    logoFooterId: b.logo_footer?.id ?? "",
    faviconId: b.favicon?.id ?? "",
    ogDefaultId: b.og_default?.id ?? null,
  };
}

// ── Company stats ──────────────────────────────────────────────────────────

// Mirrors STAT_KEY_RE in lib/validation/site (the authoritative server rule). Stat keys are
// referenced by the page resolver/seed with underscores, so allow `-` and `_` (not just `-`).
const STAT_KEY_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

export const statsFormSchema = z.object({
  stats: z.array(
    z.object({
      key: z.string().min(1, "Enter a key.").regex(STAT_KEY_RE, "Use lowercase letters, numbers, hyphens, or underscores."),
      label: z.string().min(1, "Enter a label."),
      value: z.string().min(1, "Enter a value."),
      unit: z.string(),
    }),
  ),
});
export type StatsFormValues = z.infer<typeof statsFormSchema>;
export interface StatInitial {
  key: string;
  label: string;
  value: string;
  unit: string | null;
}

export function toStatsForm(stats: StatInitial[]): StatsFormValues {
  return { stats: stats.map((s) => ({ key: s.key, label: s.label, value: s.value, unit: s.unit ?? "" })) };
}

export function toStatsInput(v: StatsFormValues) {
  return { stats: v.stats.map((s) => ({ key: s.key.trim(), label: s.label.trim(), value: s.value.trim(), unit: s.unit ? s.unit : null })) };
}

// ── Typed settings ─────────────────────────────────────────────────────────

export interface SettingInitial {
  key: string;
  value: string;
  type: SettingType;
  isPublic: boolean;
}

/** Coerce a row's editor value into the payload the server's coerceSettingValue expects. */
export function settingPayload(type: SettingType, raw: string | boolean): string | number | boolean {
  switch (type) {
    case "int":
      return typeof raw === "string" ? Number(raw) : raw;
    case "bool":
      return typeof raw === "boolean" ? raw : raw === "true";
    default:
      return typeof raw === "boolean" ? String(raw) : raw;
  }
}
