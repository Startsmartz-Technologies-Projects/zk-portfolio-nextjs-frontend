import type { Metadata } from "next";
import { CertificationsPageContent } from "@/src/components/certifications-page-content";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Public Certifications directory route (certifications-fe-public §A/§F). Server-rendered; ISR per
// the shared convention. No per-record SeoMeta (no detail URLs, BR-8) — page metadata comes from
// the SITE/SEO defaults (the PAGES-managed override lands with pages-fe-public, Wave C).
export const revalidate = REVALIDATE;

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getPublicSeoDefaults();
  return buildMetadata({
    record: { title: "Certifications & Credentials", summary: "Official registrations, approvals and certifications held by Zakir Enterprise — current, verified and available for pre-qualification." },
    defaults,
    path: "/certifications",
  });
}

export default function CertificationsPage() {
  return <CertificationsPageContent />;
}
