import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import {
  getProfileAction,
  getBrandAction,
  listCompanyStatsAction,
  listSettingsAction,
} from "@/app/admin/site/actions";
import { SettingsEditor } from "@/src/components/admin/site/settings-editor";
import type {
  BrandInitial,
  BrandSlotValue,
  ProfileInitial,
  SettingInitial,
  SocialPlatform,
  StatInitial,
} from "@/src/components/admin/site/settings-form";

export const metadata: Metadata = { title: "Site Settings · Zakir Enterprise Admin" };

type BrandSlotRow = { media: { id: string; url: string; altText: string | null } | null } | null;

function toSlot(row: BrandSlotRow): BrandSlotValue | null {
  const m = row?.media;
  if (!m) return null;
  return { id: m.id, url: m.url, alt: m.altText, altPresent: Boolean(m.altText?.trim()) };
}

// Site Settings — the Admin-only global config editor (site-admin-settings, Admin Wave 4).
// Admin-guarded at the route (the sidebar item is already hidden for editors); the server
// actions re-enforce `site_settings` (BR-6 / FR-SITE-021).
export default async function SiteSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const principal = await auth();
  if (!principal || !can(principal.role, "site_settings")) notFound();
  const { tab } = await searchParams;

  const [profileRow, brandRows, statRows, settingRows] = await Promise.all([
    getProfileAction(),
    getBrandAction(),
    listCompanyStatsAction(),
    listSettingsAction(),
  ]);

  const profile: ProfileInitial | null = profileRow
    ? {
        name: profileRow.name,
        legalName: profileRow.legalName,
        tagline: profileRow.tagline,
        brandDescription: profileRow.brandDescription,
        establishmentYear: profileRow.establishmentYear,
        email: profileRow.email,
        phone: profileRow.phone,
        whatsapp: profileRow.whatsapp,
        officeAddress: profileRow.officeAddress,
        businessHours: profileRow.businessHours,
        coverageSummary: profileRow.coverageSummary,
        copyrightText: profileRow.copyrightText,
        updatedAt: profileRow.updatedAt ? new Date(profileRow.updatedAt).toISOString() : null,
        socials: profileRow.socialLinks.map((s) => ({ platform: s.platform as SocialPlatform, url: s.url })),
      }
    : null;

  const brand: BrandInitial = {
    logo_primary: toSlot(brandRows.logo_primary),
    logo_footer: toSlot(brandRows.logo_footer),
    favicon: toSlot(brandRows.favicon),
    og_default: toSlot(brandRows.og_default),
  };

  const stats: StatInitial[] = statRows.map((s) => ({ key: s.key, label: s.label, value: s.value, unit: s.unit }));
  const settings: SettingInitial[] = settingRows.map((s) => ({ key: s.key, value: s.value, type: s.type, isPublic: s.isPublic }));

  return (
    <SettingsEditor
      profile={profile}
      brand={brand}
      stats={stats}
      settings={settings}
      canViewAuditLog={can(principal.role, "audit_log")}
      initialTab={tab ?? "profile"}
    />
  );
}
