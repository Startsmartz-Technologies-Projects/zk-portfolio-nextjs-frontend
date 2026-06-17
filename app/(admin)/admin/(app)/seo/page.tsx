import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import {
  getSeoSettingsAction,
  listRedirectsAction,
  getJsonldAction,
  sitemapPreviewAction,
} from "@/app/admin/seo/actions";
import { resolveMediaAction } from "@/app/admin/media/actions";
import { PageHeader } from "@/src/components/admin/page-header";
import { SeoCenter, type RedirectRow, type SeoSettings } from "@/src/components/admin/seo/seo-center";

export const metadata: Metadata = { title: "SEO Center · Zakir Enterprise Admin" };

// SEO Center (seo-admin-center — Admin Wave 5). Admin-only (capability `seo_config`);
// the server actions re-enforce it and the redirect loop/chain/collision guards.
export default async function SeoCenterPage() {
  const principal = await auth();
  if (!principal || !can(principal.role, "seo_config")) notFound();

  const [raw, redirects, jsonld, sitemap] = await Promise.all([
    getSeoSettingsAction(),
    listRedirectsAction(),
    getJsonldAction(),
    sitemapPreviewAction({ page: 1, pageSize: 1 }),
  ]);

  if (!raw) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="SEO Center" breadcrumbs={[{ label: "SEO Center" }]} />
        <p className="rounded-[10px] border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
          SEO settings are not initialized yet — run the database seed to create the singleton.
        </p>
      </div>
    );
  }

  const settings: SeoSettings = {
    siteTitleTemplate: raw.siteTitleTemplate,
    defaultMetaDescription: raw.defaultMetaDescription,
    metadataBase: raw.metadataBase,
    defaultOgImageId: raw.defaultOgImageId,
    twitterHandle: raw.twitterHandle,
    defaultRobots: raw.defaultRobots,
    googleSiteVerification: raw.googleSiteVerification,
    bingSiteVerification: raw.bingSiteVerification,
    jsonldTypes: raw.jsonldTypes,
  };

  let initialOgUrl: string | null = null;
  if (raw.defaultOgImageId) {
    const refs = await resolveMediaAction([raw.defaultOgImageId]);
    const ref = refs[0];
    initialOgUrl = ref && "url" in ref ? ref.url : null;
  }

  return (
    <SeoCenter
      settings={settings}
      initialOgUrl={initialOgUrl}
      redirects={redirects as RedirectRow[]}
      organization={jsonld.organization}
      sitemapTotal={sitemap.meta.total}
    />
  );
}
